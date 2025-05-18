# flask_api/__init__.py
from flask import Flask
from flask_cors import CORS
from .api import api_bp
from .db import init_db
import logging
import os  # osモジュールを追加

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'your_secret_key'  # セッションやJWTに必要
    app.config['DATABASE'] = 'sugizaki.db'  # データベースファイル名

    CORS(app)  # 必要に応じて

    app.register_blueprint(api_bp)  # API用のBlueprintを登録

    @app.teardown_appcontext
    def close_db(error):
        from .db import close_db
        close_db(error)

    # データベースの初期化をアプリコンテキスト内で実行
    with app.app_context():
        init_db(app)

    return app

app = create_app()

if __name__ == '__main__':
    # スキーマファイルが存在しない場合にのみinit_dbを実行
    if not os.path.exists('sugizaki.db'):
        with app.app_context():
            init_db(app)
    app.run(debug=True)