import sqlite3
import os
import sys
import logging

# --- 設定 ---
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(script_dir, '..')
DATABASE_FILE = os.path.join(project_root, 'sugizaki.db')
QUIZ_TXT_FILE = os.path.join(project_root, 'quiz_questions.txt')

# --- ロギング設定 ---
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def import_data_from_txt(master_username):
    """
    指定されたmasterユーザーを作成者として、テキストファイルからクイズ問題をインポートする。
    """
    logger.info(f"データインポート開始: DB='{DATABASE_FILE}', TXT='{QUIZ_TXT_FILE}'")
    logger.info(f"作成者として指定されたユーザー: '{master_username}'")

    if not os.path.exists(QUIZ_TXT_FILE):
        logger.error(f"エラー: テキストファイル '{QUIZ_TXT_FILE}' が見つかりません。")
        return

    try:
        conn = sqlite3.connect(DATABASE_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
    except sqlite3.Error as e:
        logger.error(f"データベース接続エラー: {e}")
        return

    # --- 1. 指定されたmasterユーザーのIDを取得 ---
    try:
        cursor.execute("SELECT id FROM users WHERE username = ? AND role = 'master'", (master_username,))
        user_row = cursor.fetchone()
        if not user_row:
            logger.error(f"エラー: 指定されたマスターユーザー '{master_username}' が見つかりません。")
            conn.close()
            return
        creator_id = user_row['id']
        logger.info(f"作成者ID '{creator_id}' を取得しました。")
    except sqlite3.Error as e:
        logger.error(f"ユーザーIDの取得中にエラー: {e}")
        conn.close()
        return

    # --- 2. 既存の問題データをクリア ---
    try:
        cursor.execute("DELETE FROM questions")
        conn.commit()
        logger.info("既存の 'questions' テーブルのデータをクリアしました。")
    except sqlite3.Error as e:
        logger.error(f"既存の質問データ削除中にエラー: {e}")
        conn.close()
        return

    # --- 3. テキストファイルから問題を読み込み ---
    try:
        with open(QUIZ_TXT_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        logger.error(f"テキストファイルの読み込み中にエラー: {e}")
        conn.close()
        return

    questions_to_insert = []
    current_question = {}
    line_index = 0

    # (ファイルの解析ロジックはほぼ同じ)
    while line_index < len(lines):
        line = lines[line_index].strip()
        if line.isdigit() and line:
            if current_question:
                questions_to_insert.append(current_question)
            
            # Q_no は使わないが、パースのために読み飛ばす
            current_question = {} 
            line_index += 1
            
            fields = ["genre", "title", "choices", "answer", "explanation"]
            for field in fields:
                if line_index < len(lines):
                    current_question[field] = lines[line_index].strip()
                    line_index += 1
        else:
            line_index += 1
    if current_question:
         questions_to_insert.append(current_question)

    if not questions_to_insert:
        logger.warning("テキストファイルからインポートする質問が見つかりませんでした。")
        conn.close()
        return
        
    # --- 4. 新しいquestionsテーブルにデータを登録 ---
    try:
        for q_data in questions_to_insert:
            if not all(k in q_data for k in ["genre", "title", "choices", "answer"]):
                logger.warning(f"スキップ: 必須フィールドが不足しています。 {q_data}")
                continue
            
            cursor.execute("""
                INSERT INTO questions (creator_id, genre, title, choices, answer, explanation)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                creator_id,
                q_data.get("genre"),
                q_data.get("title"),
                q_data.get("choices"),
                q_data.get("answer"),
                q_data.get("explanation", "")
            ))
        conn.commit()
        logger.info(f"成功: {len(questions_to_insert)} 件の質問をデータベースにインポートしました。")
    except sqlite3.Error as e:
        logger.error(f"データ挿入エラー: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    # --- スクリプト実行時にユーザー名を引数として受け取る ---
    if len(sys.argv) < 2:
        print("エラー: 作成者となるマスターユーザーのユーザー名を指定してください。")
        print("使い方: python import_quiz_data.py <master_username>")
        sys.exit(1)
    
    master_username_arg = sys.argv[1]
    import_data_from_txt(master_username_arg)