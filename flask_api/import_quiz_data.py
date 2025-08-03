# trg_js/import_quiz_data.py

import sqlite3
import os
import sys
import logging # ロギングを追加

logger = logging.getLogger(__name__)

# このスクリプト (import_quiz_data.py) は flask_api ディレクトリ内にあります。
# データベースファイル (sugizaki.db) とクイズテキストファイル (quiz_questions.txt)
# は、プロジェクトのルートディレクトリ (trg_js) にあると想定してパスを構築します。

# 現在のスクリプトファイルの絶対パスを取得
script_dir = os.path.dirname(os.path.abspath(__file__))
# プロジェクトのルートディレクトリのパスを取得 (flask_api の親ディレクトリ)
project_root = os.path.join(script_dir, '..')

# データベースファイルのパスをプロジェクトルートに設定
DATABASE_FILE = os.path.join(project_root, 'sugizaki.db')
# クイズテキストファイルのパスをプロジェクトルートに設定
QUIZ_TXT_FILE = os.path.join(project_root, 'quiz_questions.txt')

def get_db_connection():
    """データベース接続を確立するヘルパー関数"""
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        conn.row_factory = sqlite3.Row  # カラム名をキーとする辞書形式で結果を返す
        return conn
    except sqlite3.Error as e:
        logger.error(f"データベース接続エラー: {e}", exc_info=True)
        print(f"エラー: データベース接続に失敗しました: {e}")
        return None

def import_data_from_txt():
    """
    quiz_questions.txt からデータを読み込み、データベースに挿入する
    """
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    
    logger.info(f"データインポート開始: DB='{DATABASE_FILE}', TXT='{QUIZ_TXT_FILE}'")

    if not os.path.exists(QUIZ_TXT_FILE):
        logger.error(f"エラー: テキストファイル '{QUIZ_TXT_FILE}' が見つかりません。パスを確認してください。")
        print(f"エラー: テキストファイル '{QUIZ_TXT_FILE}' が見つかりません。")
        return

    conn = get_db_connection()
    if conn is None:
        print("データベースに接続できませんでした。")
        return

    cursor = conn.cursor()
    
    # 既存のデータを削除するかどうか尋ねる
    confirm = input(f"既存の '{DATABASE_FILE}' の 'quiz_questions' テーブルのデータをクリアしますか？ (y/N): ").lower()
    if confirm == 'y':
        try:
            cursor.execute("DELETE FROM quiz_questions")
            conn.commit()
            logger.info("既存の 'quiz_questions' テーブルのデータをクリアしました。")
            print("既存のデータをクリアしました。")
        except sqlite3.Error as e:
            logger.error(f"既存データクリアエラー: {e}", exc_info=True)
            print(f"エラー: 既存データクリアエラー: {e}")
            conn.close()
            return

    # インポートするデータの準備
    questions_to_insert = []
    
    try:
        with open(QUIZ_TXT_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except Exception as e:
        logger.error(f"テキストファイルの読み込み中にエラーが発生しました: {e}", exc_info=True)
        print(f"エラー: テキストファイルの読み込みに失敗しました: {e}")
        conn.close()
        return

    current_question = {}
    line_index = 0
    question_counter = 0 # 正常にパースされた質問の数をカウント

    while line_index < len(lines):
        line = lines[line_index].strip()

        # ID番号の行を検出: 数字のみで、かつ空行ではないことを確認
        if line.isdigit() and line: 
            # 前の質問データがあれば追加（新しい質問IDが始まる前に前の質問を確定）
            if current_question and "Q_no" in current_question:
                questions_to_insert.append(current_question)
                question_counter += 1
                logger.debug(f"Question {current_question.get('Q_no', 'N/A')} parsed.")
            
            # 新しい質問の開始
            current_question = {"Q_no": int(line)}
            line_index += 1
            
            # 順番にジャンル、質問、選択肢、解答、説明を読み込む
            fields = ["genre", "title", "choices", "answer", "explanation"]
            for field in fields:
                if line_index < len(lines):
                    current_question[field] = lines[line_index].strip()
                    line_index += 1
                else:
                    # ファイルの終わりに達し、フィールドが足りない場合
                    current_question[field] = ""
                    logger.warning(f"Warning: Missing field '{field}' for question starting with Q_no {current_question.get('Q_no')} at end of file.")
                    
            # ここで現在の質問データを確定・追加 (ただし、次のID行で追加するため不要な場合もある)
            # このパースロジックでは、次のID行を検出した際、またはファイル終端でまとめて追加する形が一般的。
            # 今回のロジックは、ID行の直後で6行分読み込み、次のID行を待たずに即座に完結させている。
            # したがって、ID行を検出した直後に current_question を初期化し、
            # 必要なフィールドを読み込んだ後、直ちに questions_to_insert に追加する。
            
            # 既に `if current_question: questions_to_insert.append(current_question)` が
            # 新しいIDを検出した時に前の質問を追加しているので、ここでは個別の追加は不要。
            # 最後の一問だけがループ終了後に残る可能性があるので、それは後で処理。

        else:
            line_index += 1 # その他の行はスキップ（空行なども）

    # ループ終了後に残った最後の質問データがあれば追加
    if current_question and "Q_no" in current_question and current_question not in questions_to_insert:
         questions_to_insert.append(current_question)
         question_counter += 1
         logger.debug(f"Last question {current_question.get('Q_no', 'N/A')} parsed.")

    # データベースへの挿入
    if not questions_to_insert:
        print("警告: テキストファイルからインポートする質問が見つかりませんでした。ファイル形式を確認してください。")
        logger.warning("No questions found to import from the text file.")
        conn.close()
        return

    try:
        for q_data in questions_to_insert:
            q_no_val = q_data.get("Q_no") 
            
            cursor.execute("""
                INSERT INTO quiz_questions (Q_no, genre, title, choices, answer, explanation)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                q_no_val,
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
        logger.error(f"データ挿入エラー: {e}", exc_info=True)
        print(f"エラー: データ挿入エラー: {e}")
        conn.rollback() # エラー時はロールバック
    finally:
        conn.close()
        logger.info("データベース接続を閉じました。")

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    print(f"スクリプトの実行パス: {os.getcwd()}")
    print(f"データベースファイルパス (import_quiz_data.py): {os.path.abspath(DATABASE_FILE)}")
    print(f"テキストファイルパス (import_quiz_data.py): {os.path.abspath(QUIZ_TXT_FILE)}")
    
    # 実行前に、quiz_questions.txt が期待される場所 (trg_js/quiz_questions.txt) にあることを確認してください。
    # また、sugizaki.db が既に存在する場合は、上書きまたは削除される可能性があります。
    
    import_data_from_txt()