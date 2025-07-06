# flask_api/log_manager.py
import json
import logging
import os # osモジュールをインポート

logger = logging.getLogger(__name__)

# ログファイルを保存するパスを定義（例: アプリケーションのルートディレクトリ）
# ここでは、api.pyと同じ階層、またはアプリケーションのルートに 'logs' フォルダを作成し、その中に保存する想定
# Flaskアプリのインスタンス化時に設定することも可能ですが、ここではシンプルに相対パスで指定
LOG_FILE_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'log.ndjson')
# もし Flask のインスタンスがある場所（通常は 'app.py' や 'run.py'）の直下に置きたいなら、
# 例えば 'app.py' と同じディレクトリに 'log.ndjson' を置くようにパスを調整してください。
# 例: LOG_FILE_PATH = 'log.ndjson' # アプリケーション起動時のカレントディレクトリになる

def log_w(data):
    try:
        log_message = json.dumps(data, ensure_ascii=False)
        
        # ★★★ここからがファイル書き込みの変更点★★★
        with open(LOG_FILE_PATH, 'a', encoding='utf-8') as f: # 'a'は追記モード
            f.write(log_message + '\n') # 各レコードを改行で区切る
        # ★★★ここまでが変更点★★★

        # コンソールにも引き続き出力したい場合は残す
        logger.info(log_message) 

    except Exception as e:
        logger.error(f"ログデータのファイル書き込みまたはJSONエンコードに失敗しました: {e}")

if __name__ == '__main__':
    # 開発用のロギング設定（ファイル書き込みテスト用）
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    # 既存のログファイルが存在すれば削除し、新しいログでテストする
    if os.path.exists(LOG_FILE_PATH):
        os.remove(LOG_FILE_PATH)
        print(f"既存のログファイル {LOG_FILE_PATH} を削除しました。")

    test_data1 = {"message": "テストログ1", "user": "Vel", "genre": "Python"}
    log_w(test_data1)
    print(f"ログデータを {LOG_FILE_PATH} に書き込みました。")

    test_data2 = {"message": "テストログ2", "user": "AI", "genre": "JavaScript"}
    log_w(test_data2)
    print(f"ログデータを {LOG_FILE_PATH} に書き込みました。")

    # ファイル内容を確認
    with open(LOG_FILE_PATH, 'r', encoding='utf-8') as f:
        print("\n--- ファイル内容 ---")
        print(f.read())
        print("------------------")