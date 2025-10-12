from flask import Flask, jsonify, request, g, render_template_string
import os
from .api import api_bp
from .db import close_db, init_db
import logging

# ロギング設定
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_app(test_config=None):
    # Flaskインスタンスの作成
    # プロジェクトルート（trg_js/）を基準に設定
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    # index.htmlがルートにあるため、static/templateフォルダを明示的に指定
    app = Flask(__name__, 
                root_path=project_root,
                static_folder=project_root, # ルートを静的フォルダとして扱う
                template_folder=project_root) # ルートをテンプレートフォルダとして扱う
    
    # 基本設定
    app.config.from_mapping(
        SECRET_KEY='development_secret_key_change_me', # 本番環境では必ず変更してください
        DATABASE=os.path.join(app.root_path, 'sugizaki.db'),
        # ログファイルのパスを設定
        LOG_FILE_PATH=os.path.join(app.root_path, 'log.ndjson')
    )

    if test_config is None:
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    # データベースの初期化
    with app.app_context():
        try:
            init_db(app)
        except Exception as e:
            app.logger.error(f"データベースの初期化に失敗しました: {e}")
            # 起動を中止させる場合は raise e を使用
    
    # リクエスト終了後にDB接続を閉じる
    app.teardown_appcontext(close_db)

    # APIブループリントの登録
    app.register_blueprint(api_bp)

    # --- SPA（シングルページアプリケーション）のためのルーティング ---

    # ルートURL (/) で index.html を返す
    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    # API以外のすべてのパスをindex.htmlに転送し、フロントエンド側でルーティングさせる
    @app.route('/<path:path>')
    def serve_spa(path):
        # 存在しないパスへのアクセスはすべてindex.htmlに任せることで、
        # React RouterやVue Routerのようなフロントエンドルーティングを可能にする
        # ただし、JSやCSSファイルなどの実在する静的ファイルはそのまま配信する
        full_path = os.path.join(app.static_folder, path)
        if os.path.exists(full_path) and os.path.isfile(full_path):
             return app.send_static_file(path)
        else:
             return app.send_static_file('index.html')

    return app