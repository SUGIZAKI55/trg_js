from flask import Flask, send_from_directory, Response, render_template # render_template をインポート
import os
from .api import api_bp
from .db import close_db, init_db
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def create_app(test_config=None):
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    
    # ★★★ 修正点1: template_folder を明示的に指定 ★★★
    # これで Flask は flask_api/templates を見つけられるようになります
    app = Flask(__name__,
                root_path=project_root,
                template_folder=os.path.join(project_root, 'flask_api', 'templates'))

    app.config.from_mapping(
        SECRET_KEY='development_secret_key_change_me',
        DATABASE=os.path.join(project_root, 'sugizaki.db'),
        LOG_FILE_PATH=os.path.join(project_root, 'log.ndjson')
    )

    # ... (DB初期化やAPI登録の部分は変更なし) ...
    with app.app_context():
        init_db(app)
    app.teardown_appcontext(close_db)
    app.register_blueprint(api_bp)

    # ★★★ 修正点2: Reactに渡す「前」に、Flask専用のルートを定義 ★★★
    @app.route('/server-admin')
    def server_admin_page():
        # flask_api/templates/server_admin.html を表示します
        return render_template('server_admin.html')


    # Reactアプリを配信するための包括的なルート（これは一番最後に置く）
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react_app(path):
        dist_dir = os.path.join(project_root, 'frontend', 'dist')
        if path != "" and os.path.exists(os.path.join(dist_dir, path)):
            return send_from_directory(dist_dir, path)
        else:
            try:
                with open(os.path.join(dist_dir, 'index.html'), 'r', encoding='utf-8') as f:
                    content = f.read()
                return Response(content, mimetype='text/html')
            except Exception as e:
                app.logger.error(f"致命的なエラー: index.htmlの読み込みに失敗しました。エラー: {e}")
                return "<h1>500 Internal Server Error</h1>", 500

    return app