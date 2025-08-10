# trg_js/app.py

from flask_api import create_app
import os
import logging

logger = logging.getLogger(__name__)

app = create_app()

if __name__ == '__main__':
    database_path = app.config.get('DATABASE')
    if database_path:
        if not os.path.exists(database_path):
            logger.warning(f"データベースファイル '{database_path}' が見つかりません。アプリケーション起動時に自動作成されます。")
        else:
            logger.info(f"データベースファイル '{database_path}' を使用します。")
    else:
        logger.error("データベースパスが設定されていません。")

    app.run(debug=True)