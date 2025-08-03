# trg_js/flask_api/__init__.py

from flask import Flask, send_from_directory
from flask_cors import CORS
from .api import api_bp
from .db import init_db, close_db
import logging
import os

# 基本的なロギング設定をアプリケーション全体で適用
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__) # このモジュール用のロガーも取得

def create_app():
    # ★★★ここを修正します（App Root Pathの修正）★★★
    # このファイル (flask_api/__init__.py) のディレクトリの絶対パス
    current_module_dir = os.path.dirname(os.path.abspath(__file__))
    # プロジェクトのルートディレクトリ (trg_js/) のパスを明示的に計算
    # flask_api の親ディレクトリが trg_js であると仮定
    project_root_absolute_path = os.path.abspath(os.path.join(current_module_dir, '..'))

    # Flaskアプリケーションのインスタンスを作成
    # static_folder をプロジェクトのルートに設定し、static_url_path をルートURLに設定
    app = Flask(__name__, static_folder=project_root_absolute_path, static_url_path='/')
    
    # ★★★重要：app.root_pathを明示的に設定し直す★★★
    # これにより、Flaskが内部的に参照するroot_pathが、常にtrg_jsディレクトリになる
    app.root_path = project_root_absolute_path
    
    # SECRET_KEYは環境変数から取得することを強く推奨
    # 本番環境では必ずこのデフォルト値を変更してください！
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your_super_secret_default_key_change_this_in_production!')
    
    # ★修正（パスの統一）: データベースのパスを明示的なプロジェクトのルートディレクトリに設定
    app.config['DATABASE'] = os.path.join(app.root_path, 'sugizaki.db')
    
    # ★修正（パスの統一）: ログファイルのパスも明示的なプロジェクトのルートディレクトリに設定
    app.config['LOG_FILE_PATH'] = os.path.join(app.root_path, 'log.ndjson')
    
    logger.info(f"App Root Path (Explicitly Set): {app.root_path}")
    logger.info(f"Database Path configured: {app.config['DATABASE']}")
    logger.info(f"Log File Path configured: {app.config['LOG_FILE_PATH']}")

    CORS(app) # クロスオリジンリクエストを許可

    app.register_blueprint(api_bp) # APIブループリントを登録

    # リクエスト終了時にデータベース接続を自動的に閉じる
    app.teardown_appcontext(close_db)

    # アプリケーションコンテキスト内でデータベースを初期化
    with app.app_context():
        # schema.sqlにDROP TABLE IF EXISTSがあるので、毎回テーブルは再作成されます。
        logger.info(f"データベースのスキーマを初期化（または更新）します: {app.config['DATABASE']}")
        init_db(app) # データベースの有無に関わらず init_db を呼び出し、DROP TABLE IF EXISTS で対応

    # SPAの全てのクライアントサイドルートに対して index.html を返す
    # 注意: /api/ で始まるパスは api_bp で処理されるため、ここには含めない
    @app.route('/', defaults={'path': ''}) # ルートパスのデフォルト
    @app.route('/<path:path>') # それ以外の全てのパス（ただし /api/ を除く）
    def serve_spa_routes(path):
        # static_folder がプロジェクトのルート (trg_js) に設定されているので、index.html がその直下にある想定
        return send_from_directory(app.static_folder, 'index.html')

    # favicon.ico のリクエストを処理（ブラウザが自動で要求することがあるため）
    @app.route('/favicon.ico')
    def favicon():
        # static_folder から favicon.ico を提供
        return send_from_directory(app.static_folder, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

    return app

# `flask run` コマンドが `create_app()` 関数を自動的に検出して呼び出します。