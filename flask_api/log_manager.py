import json
import logging
import os
from flask import current_app
from datetime import datetime

logger = logging.getLogger(__name__)

def log_w(data):
    """
    構造化されたログデータ(dict)をNDJSON形式でファイルに追記します。
    """
    try:
        # ログデータ内のdatetimeオブジェクトをISO文字列に変換
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
        
        log_message = json.dumps(data, ensure_ascii=False)
        
        # __init__.pyで設定されたログファイルパスを取得
        log_file_path = current_app.config.get('LOG_FILE_PATH')
        if not log_file_path:
            logger.error("ログファイルパスが設定されていません (LOG_FILE_PATH)。ログ書き込みをスキップします。")
            return

        # 'a' (追記モード) でファイルに書き込む
        with open(log_file_path, 'a', encoding='utf-8') as f:
            f.write(log_message + '\n') # 各レコードを改行で区切る

    except Exception as e:
        logger.error(f"ログデータのファイル書き込みまたはJSONエンコードに失敗しました: {e}", exc_info=True)