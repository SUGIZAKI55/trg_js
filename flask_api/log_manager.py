# trg_js/flask_api/log_manager.py

import json
import logging
import os
from flask import current_app # current_app をインポート

logger = logging.getLogger(__name__)

# LOG_FILE_PATH は、Flaskアプリケーションの初期化時に current_app.config['LOG_FILE_PATH'] に設定されます。
# そのため、ここでは直接パスを定義せず、log_w 関数内で current_app から取得します。

def log_w(data):
    """
    構造化されたログデータをNDJSON形式でファイルに追記します。
    """
    try:
        log_message = json.dumps(data, ensure_ascii=False)
        
        # current_app.config からログファイルのパスを取得
        # アプリケーションコンテキスト外で呼び出される可能性がないか注意
        log_file_path = current_app.config.get('LOG_FILE_PATH')
        if not log_file_path:
            logger.error("ログファイルパスが設定されていません (current_app.config['LOG_FILE_PATH'] がNone)。ログ書き込みをスキップします。")
            return

        with open(log_file_path, 'a', encoding='utf-8') as f: # 'a'は追記モード
            f.write(log_message + '\n') # 各レコードを改行で区切る

        # コンソールにも引き続き出力したい場合は残す
        logger.info(f"Logged data: {log_message}") 

    except Exception as e:
        logger.error(f"ログデータのファイル書き込みまたはJSONエンコードに失敗しました: {e}", exc_info=True) # exc_infoでスタックトレースも出力

if __name__ == '__main__':
    # 開発用のロギング設定（ファイル書き込みテスト用）
    # このテストブロックは Flask アプリケーションコンテキスト外で実行されるため、
    # current_app は利用できません。そのため、テスト専用のパスと書き込み関数を定義します。
    
    # このスクリプト (flask_api/log_manager.py) からプロジェクトルート (trg_js/) への相対パス
    _test_log_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'log.ndjson')
    
    # テスト時のbasicConfig設定
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # 既存のログファイルが存在すれば削除し、新しいログでテストする
    if os.path.exists(_test_log_file_path):
        os.remove(_test_log_file_path)
        print(f"既存のログファイル {_test_log_file_path} を削除しました。")
        logger.info(f"Existing test log file {_test_log_file_path} deleted.")

    print("\n--- テストログ書き込み開始 ---")
    
    # current_app に依存しない簡略化されたテスト書き込み関数
    def _test_log_writer(data, path):
        try:
            log_message = json.dumps(data, ensure_ascii=False)
            with open(path, 'a', encoding='utf-8') as f:
                f.write(log_message + '\n')
            logger.info(f"(TEST LOG) Successfully wrote: {log_message}")
        except Exception as e:
            logger.error(f"(TEST LOG) Failed to write test log: {e}", exc_info=True)

    test_data1 = {"message": "テストログ1", "user": "Vel", "genre": "Python", "result": "正解"}
    _test_log_writer(test_data1, _test_log_file_path)

    test_data2 = {"message": "テストログ2", "user": "AI", "genre": "JavaScript", "result": "不正解", "question_id": 101}
    _test_log_writer(test_data2, _test_log_file_path)

    print(f"\nログデータを {_test_log_file_path} に書き込みました。")

    # ファイル内容を確認
    if os.path.exists(_test_log_file_path):
        with open(_test_log_file_path, 'r', encoding='utf-8') as f:
            print("\n--- ファイル内容 ---")
            print(f.read())
            print("------------------")
    else:
        print(f"警告: テストログファイル {_test_log_file_path} が見つかりません。")
    print("--- テストログ書き込み終了 ---")