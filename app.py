# trg_js/app.py

from flask import Flask, g, current_app, send_from_directory # send_from_directory をインポート
from flask_api.api import api_bp
import os
import sqlite3

def create_app():
    app = Flask(__name__)
    
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your_super_secret_default_key_change_this!') 
    
    database_path = os.path.join(app.root_path, 'flask_api', 'sugizaki.db')
    app.config['DATABASE'] = database_path
    
    app.register_blueprint(api_bp)

    # データベース接続のクリーンアップ設定
    @app.teardown_appcontext
    def close_db_connection(exception):
        db = getattr(g, '_database', None)
        if db is not None:
            db.close()

    # --- ここから新しい追加部分 ---
    # メインのルートURL ('/') にアクセスがあったときに index.html を返す
    @app.route('/')
    def index():
        # app.root_path は 'trg_js' ディレクトリを指します
        # index.html が 'trg_js' ディレクトリの直下にあることを想定しています
        return send_from_directory(app.root_path, 'index.html')

    # favicon.ico のリクエストを処理（ブラウザが自動で要求することがあるため）
    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(app.root_path, 'favicon.ico', mimetype='image/vnd.microsoft.icon')
    # --- 新しい追加部分ここまで ---

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True) 
