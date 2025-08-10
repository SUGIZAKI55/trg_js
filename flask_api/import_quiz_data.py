# trg_js/flask_api/import_quiz_data.py

import sqlite3
import os
import sys
import logging
import json

logger = logging.getLogger(__name__)

script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.join(script_dir, '..')
DATABASE_FILE = os.path.join(project_root, 'sugizaki.db')
QUIZ_TXT_FILE = os.path.join(project_root, 'quiz_questions.txt')

def import_data_from_txt():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    logger.info(f"データインポート開始: DB='{DATABASE_FILE}', TXT='{QUIZ_TXT_FILE}'")

    if not os.path.exists(QUIZ_TXT_FILE):
        logger.error(f"エラー: テキストファイル '{QUIZ_TXT_FILE}' が見つかりません。")
        print(f"エラー: テキストファイル '{QUIZ_TXT_FILE}' が見つかりません。")
        return

    # ★修正: get_db_connectionのインポートを削除し、直接接続を試みる
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        conn.row_factory = sqlite3.Row
    except sqlite3.Error as e:
        logger.error(f"データベース接続エラー: {e}")
        print(f"エラー: データベース接続に失敗しました: {e}")
        return

    cursor = conn.cursor()
    
    try:
        cursor.execute("DELETE FROM quiz_questions")
        conn.commit()
        logger.info("既存の 'quiz_questions' テーブルのデータをクリアしました。")
        print("既存のデータをクリアしました。")
    except sqlite3.Error as e:
        logger.error(f"既存データクリアエラー: {e}")
        print(f"エラー: 既存データクリアエラー: {e}")
        conn.close()
        return

    questions_to_insert = []
    
    try:
        with open(QUIZ_TXT_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        logger.error(f"テキストファイルの読み込み中にエラーが発生しました: {e}")
        print(f"エラー: テキストファイルの読み込みに失敗しました: {e}")
        conn.close()
        return

    current_question = {}
    line_index = 0
    while line_index < len(lines):
        line = lines[line_index].strip()
        if line.isdigit() and line:
            if current_question and "Q_no" in current_question:
                questions_to_insert.append(current_question)
            
            current_question = {"Q_no": int(line)}
            line_index += 1
            
            fields = ["genre", "title", "choices", "answer", "explanation"]
            for field in fields:
                if line_index < len(lines):
                    current_question[field] = lines[line_index].strip()
                    line_index += 1
                else:
                    current_question[field] = ""
        else:
            line_index += 1

    if current_question and "Q_no" in current_question and current_question not in questions_to_insert:
         questions_to_insert.append(current_question)
    
    if not questions_to_insert:
        logger.warning("No questions found to import from the text file.")
        print("警告: テキストファイルからインポートする質問が見つかりませんでした。")
        conn.close()
        return

    try:
        for q_data in questions_to_insert:
            cursor.execute("""
                INSERT INTO quiz_questions (Q_no, genre, title, choices, answer, explanation)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                q_data.get("Q_no"),
                q_data.get("genre", ""),
                q_data.get("title", ""),
                q_data.get("choices", ""),
                q_data.get("answer", ""),
                q_data.get("explanation", "")
            ))
        conn.commit()
        logger.info(f"成功: {len(questions_to_insert)} 件の質問をデータベースにインポートしました。")
        print(f"成功: {len(questions_to_insert)} 件の質問をデータベースにインポートしました。")
    except sqlite3.Error as e:
        logger.error(f"データ挿入エラー: {e}")
        print(f"エラー: データ挿入エラー: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == '__main__':
    import_data_from_txt()