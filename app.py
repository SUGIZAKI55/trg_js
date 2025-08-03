# trg_js/app.py

from flask_api import create_app # flask_api/__init__.py から create_app をインポート
import os
import logging # ロギングを追加

logger = logging.getLogger(__name__) # このモジュール用のロガーを取得

app = create_app()

if __name__ == '__main__':
    # データベースファイルパスが正しく設定されているか確認
    database_path = app.config.get('DATABASE') # configから安全に取得
    if database_path:
        if not os.path.exists(database_path):
            logger.warning(f"データベースファイル '{database_path}' が見つかりません。アプリケーション起動時に自動作成されます。")
        else:
            logger.info(f"データベースファイル '{database_path}' を使用します。")
    else:
        logger.error("データベースパスが設定されていません。")

    app.run(debug=True)