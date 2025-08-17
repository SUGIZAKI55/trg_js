# trg_js/flask_api/__init__.py

from flask import Flask, send_from_directory
from flask_cors import CORS
from .api import api_bp
from .db import init_db, close_db
import logging
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_app():
    current_module_dir = os.path.dirname(os.path.abspath(__file__))
    project_root_absolute_path = os.path.abspath(os.path.join(current_module_dir, '..'))

    # ★★★ 修正箇所 ★★★
    # Flaskのデフォルトの静的ファイル処理を無効化し、全てのルーティングを独自関数に委ねる
    app = Flask(__name__, static_folder=None)
    
    app.root_path = project_root_absolute_path
    
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your_super_secret_default_key_change_this_in_production!')
    app.config['DATABASE'] = os.path.join(app.root_path, 'sugizaki.db')
    app.config['LOG_FILE_PATH'] = os.path.join(app.root_path, 'log.ndjson')
    
    logger.info(f"App Root Path (Explicitly Set): {app.root_path}")
    logger.info(f"Database Path configured: {app.config['DATABASE']}")
    logger.info(f"Log File Path configured: {app.config['LOG_FILE_PATH']}")

    CORS(app)
    app.register_blueprint(api_bp)
    app.teardown_appcontext(close_db)

    with app.app_context():
        logger.info(f"Initializing database schema: {app.config['DATABASE']}")
        init_db(app)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_spa_routes(path):
        # ★★★ 修正箇所 ★★★
        # app.root_path を静的ファイルのルートとして使用する
        static_file_root = app.root_path

        # リクエストされたパスが実在するファイルであればそれを返す
        if path != "" and os.path.exists(os.path.join(static_file_root, path)):
            return send_from_directory(static_file_root, path)
        # そうでなければ、SPAのエントリーポイントである index.html を返す
        else:
            return send_from_directory(static_file_root, 'index.html')
    
    @app.route('/favicon.ico')
    def favicon():
        # favicon.ico が存在すれば返す
        return send_from_directory(app.root_path, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

    return app