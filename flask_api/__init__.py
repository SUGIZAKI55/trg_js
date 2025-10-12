from flask import Flask, jsonify, request, g, render_template_string
import os
from .api import api_bp
from .db import close_db, init_db
import logging

# ロギング設定
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_app(test_config=None):
    # Flaskインスタンスの作成
    # root_pathをプロジェクトルート（app.pyのある場所）に指定
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    # 修正: index.htmlがルートにあるため、static_folderとtemplate_folderを明示的に指定
    app = Flask(__name__, 
                root_path=project_root,
                static_folder=project_root,
                template_folder=project_root)
    
    # 基本設定のロード
    app.config.from_mapping(
        SECRET_KEY='development_secret_key_change_me', # JWT署名に使用
        # データベースパスの設定（プロジェクトルートのsugizaki.dbを指す）
        DATABASE=os.path.join(app.root_path, 'sugizaki.db'),
    )

    if test_config is None:
        # 環境変数から設定をロードする場合
        app.config.from_pyfile('config.py', silent=True)
    else:
        app.config.from_mapping(test_config)

    # --- データベースの初期化と連携 ---
    with app.app_context():
        # アプリケーションコンテキスト内でデータベースを初期化
        try:
            init_db(app) # db.pyが app.root_path + 'schema.sql' を探す
        except Exception as e:
            # DB初期化失敗は起動を続行させずログを出す
            app.logger.error(f"Failed to initialize database: {e}")
    
    # リクエスト終了後にDB接続を閉じるフックを登録
    app.teardown_appcontext(close_db)

    # --- APIルートの登録 ---
    app.register_blueprint(api_bp)

    # --- 静的ファイルのルーティング（index.htmlで使用するJS/CSSなど） ---
    
    # ルートURL (/) で index.html を返す
    @app.route('/')
    def index():
        # index.htmlを返すことで、SPAのJSがルーティングを開始する
        return app.send_static_file('index.html')

    # SPAのサブパス（/dashboard, /adminなど）およびその他の静的ファイルも処理
    @app.route('/<path:path>')
    def serve_static(path):
        # 認証が必要なSPAのサブパスは全てindex.htmlにルーティング
        # index.html内のJSが /dashboard, /admin などを処理
        if path in ['dashboard', 'login', 'signup', 'admin', 'my_results', 'register_staff', 'genre', 'question', 'kekka', 'view', 'q_list', 'create_question', 'users', 'register_company', 'create_user', 'master/create_user', 'master/create_master']:
            return app.send_static_file('index.html')
        
        # /styles.css や /images/logo.png などのその他の静的ファイルはデフォルトで処理
        return app.send_static_file(path)

    return app
