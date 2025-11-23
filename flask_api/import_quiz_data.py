import sqlite3
import os
import sys
import logging

# --- 設定 ---
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(script_dir, '..'))
DATABASE_FILE = os.path.join(project_root, 'sugizaki.db')
QUIZ_TXT_FILE = os.path.join(project_root, 'quiz_questions.txt')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def import_data_from_txt(master_username):
    logger.info(f"データインポート開始: DB='{DATABASE_FILE}', TXT='{QUIZ_TXT_FILE}'")
    
    if not os.path.exists(QUIZ_TXT_FILE):
        logger.error(f"エラー: テキストファイル '{QUIZ_TXT_FILE}' が見つかりません。")
        return

    if not os.path.exists(DATABASE_FILE):
        logger.error(f"エラー: データベース '{DATABASE_FILE}' が見つかりません。先に 'flask run' でDBを作成してください。")
        return

    try:
        conn = sqlite3.connect(DATABASE_FILE)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # 外部キー制約を有効化（データの整合性を保つため）
        cursor.execute("PRAGMA foreign_keys = ON")
        
    except sqlite3.Error as e:
        logger.error(f"データベース接続エラー: {e}")
        return

    # --- 1. マスターユーザーのIDを取得 ---
    try:
        cursor.execute("SELECT id FROM users WHERE username = ?", (master_username,))
        user_row = cursor.fetchone()
        if not user_row:
            logger.error(f"エラー: 指定されたユーザー '{master_username}' が見つかりません。")
            conn.close()
            return
        creator_id = user_row['id']
        logger.info(f"作成者ID '{creator_id}' を取得しました。")
    except sqlite3.Error as e:
        logger.error(f"ユーザーIDの取得中にエラー: {e}")
        conn.close()
        return

    # --- 2. 既存の問題データと成績データをクリア ---
    # ★★★ ここが重要です：ユーザーは消さずに、問題と成績だけ消します ★★★
    try:
        # 先に成績(results)を消さないと、外部キー制約で問題(questions)が消せません
        logger.info("既存の成績データ(results)をクリアしています...")
        cursor.execute("DELETE FROM results")
        
        # IDの連番をリセットしたい場合は sqlite_sequence も操作しますが、通常はDELETEだけでOK
        logger.info("既存の問題データ(questions)をクリアしています...")
        cursor.execute("DELETE FROM questions")
        
        # IDを1から振り直したい場合は以下の2行のコメントを外してください
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='results'")
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='questions'")
        
        conn.commit()
        logger.info("テーブルのクリア完了。ユーザーデータは保持されています。")
        
    except sqlite3.Error as e:
        logger.error(f"データ削除中にエラー: {e}")
        conn.close()
        return

    # --- 3. テキストファイルから問題を読み込み ---
    try:
        with open(QUIZ_TXT_FILE, 'r', encoding='utf-8') as f:
            lines = [line.strip() for line in f.readlines() if line.strip() and line.strip() != '---' and line.strip() != '```']
    except Exception as e:
        logger.error(f"テキストファイルの読み込み中にエラー: {e}")
        conn.close()
        return

    questions_to_insert = []
    line_index = 0

    # 複数行の選択肢を正しく読み込むロジック
    while line_index < len(lines):
        line = lines[line_index]
        
        if line.startswith('承知いたしました') or line.startswith('**'):
            line_index += 1
            continue

        if line.isdigit():
            current_question = {}
            line_index += 1 
            
            try:
                # 1. ジャンル
                current_question["genre"] = lines[line_index]
                line_index += 1
                # 2. 問題文
                current_question["title"] = lines[line_index]
                line_index += 1
                # 3. 選択肢 (4行)
                choices_list = []
                for _ in range(4):
                    choices_list.append(lines[line_index])
                    line_index += 1
                current_question["choices"] = ":".join(choices_list)
                # 4. 正解
                current_question["answer"] = lines[line_index]
                line_index += 1
                # 5. 解説
                current_question["explanation"] = lines[line_index]
                line_index += 1

                questions_to_insert.append(current_question)
                
            except IndexError:
                logger.warning(f"問題番号 {line} の周辺でデータの形式が不正です。インポートを中断します。")
                break
        else:
            line_index += 1

    if not questions_to_insert:
        logger.warning("インポートする質問が見つかりませんでした。")
        conn.close()
        return
        
    # --- 4. データベースに登録 ---
    try:
        for q_data in questions_to_insert:
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
        logger.info(f"成功: {len(questions_to_insert)} 件の質問をインポートしました。ユーザーデータはそのままです。")
    except sqlite3.Error as e:
        logger.error(f"データ挿入エラー: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("エラー: 作成者となるユーザー名を指定してください。")
        print("使い方: python3 flask_api/import_quiz_data.py <username>")
        sys.exit(1)
    
    master_username_arg = sys.argv[1]
    import_data_from_txt(master_username_arg)