# flask_api/__init__.py

from flask import Flask, send_from_directory
from flask_cors import CORS
from .api import api_bp
from .db import init_db, close_db
import logging
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

def create_app():
    # static_folder を親ディレクトリのパスに設定 (index.html が flask_api の外にあるため)
    app = Flask(__name__, static_folder='../', static_url_path='/') # static_url_pathもルートに
    app.config['SECRET_KEY'] = 'your_super_secret_key_please_change_this_in_production'
    app.config['DATABASE'] = os.path.join(app.root_path, 'sugizaki.db')

    CORS(app)

    app.register_blueprint(api_bp)

    app.teardown_appcontext(close_db)

    with app.app_context():
        if not os.path.exists(app.config['DATABASE']):
            print(f"データベース '{app.config['DATABASE']}' が見つかりません。初期化します...")
            init_db(app)
        else:
            print(f"データベース '{app.config['DATABASE']}' が存在します。")

    # ルートURL (/) で index.html を提供する
    @app.route('/')
    def serve_index():
        return send_from_directory(app.static_folder, 'index.html')

    # favicon.ico のリクエストも処理 (ブラウザが自動的に要求することが多いため)
    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(app.static_folder, 'favicon.ico', mimetype='image/vnd.microsoft.icon')

    return app

# `flask run` コマンドが `create_app()` 関数を自動的に検出して呼び出します。