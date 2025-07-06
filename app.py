# trg_js/app.py

from flask import Flask, g, current_app, send_from_directory
from flask_api.api import api_bp
import os
import sqlite3

# db.pyから get_db, close_db をインポート
from flask_api.db import get_db, close_db

def create_app():
    app = Flask(__name__)
    
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your_super_secret_default_key_change_this!') 
    
    database_path = os.path.join(app.root_path, 'flask_api', 'sugizaki.db')
    app.config['DATABASE'] = database_path
    print(f"Flask APP using database: {database_path}")

    app.register_blueprint(api_bp)

    # データベース接続のクリーンアップ設定
    @app.teardown_appcontext
    def close_db_connection(exception):
        db = getattr(g, '_database', None)
        if db is not None:
            db.close()

    # --- ここから修正・追加部分 ---

    # SPAの全てのクライアントサイドルートに対して index.html を返す
    # 注意: /api/ で始まるパスは api_bp で処理されるため、ここには含めない
    @app.route('/', defaults={'path': ''}) # ルートパスのデフォルト
    @app.route('/<path:path>') # それ以外の全てのパス（ただし /api/ を除く）
    def serve_spa_routes(path):
        # app.root_path は 'trg_js' ディレクトリを指します
        # index.html が 'trg_js' ディレクトリの直下にあることを想定しています
        # index.html が見つからない場合は、パスを調整してください。
        # 例: index.html が 'trg_js/static' にある場合:
        # return send_from_directory(os.path.join(app.root_path, 'static'), 'index.html')
        
        # あなたの構成では 'trg_js' ディレクトリの直下に index.html があるようなので、これでOK
        return send_from_directory(app.root_path, 'index.html')

    # favicon.ico のリクエストを処理（ブラウザが自動で要求することがあるため）
    @app.route('/favicon.ico')
    def favicon():
        return send_from_directory(app.root_path, 'favicon.ico', mimetype='image/vnd.microsoft.icon')
        
    # --- 修正・追加部分ここまで ---

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)