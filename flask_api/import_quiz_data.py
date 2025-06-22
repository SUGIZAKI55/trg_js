import sqlite3
import os

# データベースファイルのパスを設定
# このスクリプトが flask_api ディレクトリ内にあり、sugizaki.db も同じディレクトリにある場合
DATABASE_FILE = 'sugizaki.db' 
QUIZ_TXT_FILE = 'quiz_questions.txt'

def get_db_connection():
    """データベース接続を確立するヘルパー関数"""
    try:
        conn = sqlite3.connect(DATABASE_FILE)
        conn.row_factory = sqlite3.Row  # カラム名をキーとする辞書形式で結果を返す
        return conn
    except sqlite3.Error as e:
        print(f"データベース接続エラー: {e}")
        return None

def import_data_from_txt():
    """
    quiz_questions.txt からデータを読み込み、データベースに挿入する
    """
    if not os.path.exists(QUIZ_TXT_FILE):
        print(f"エラー: テキストファイル '{QUIZ_TXT_FILE}' が見つかりません。パスを確認してください。")
        return

    conn = get_db_connection()
    if conn is None:
        print("データベースに接続できませんでした。")
        return

    cursor = conn.cursor()
    
    # 既存のデータを削除するかどうか尋ねる (任意)
    confirm = input("既存の quiz_questions テーブルのデータをクリアしますか？ (y/N): ").lower()
    if confirm == 'y':
        try:
            cursor.execute("DELETE FROM quiz_questions")
            conn.commit()
            print("既存のデータをクリアしました。")
        except sqlite3.Error as e:
            print(f"既存データクリアエラー: {e}")
            conn.close()
            return

    # インポートするデータの準備
    questions_to_insert = []
    
    with open(QUIZ_TXT_FILE, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    current_question = {}
    line_index = 0
    while line_index < len(lines):
        line = lines[line_index].strip()

        # ID番号の行を検出 (数字のみで、かつ次の行が数字ではないことを確認して、複数行にわたるIDを避ける)
        # 0から始まる質問データ形式に特化したロジック
        if line.isdigit() and len(line) <= 5 and (line_index + 1 < len(lines) and not lines[line_index+1].strip().isdigit()):
            if current_question: # 前の質問データがあれば追加
                questions_to_insert.append(current_question)
            current_question = {"Q_no": int(line)}
            line_index += 1
            
            # IDの次の行から順番にジャンル、質問、選択肢、解答、説明を読み込む
            if line_index < len(lines):
                current_question["genre"] = lines[line_index].strip()
                line_index += 1
            if line_index < len(lines):
                current_question["title"] = lines[line_index].strip()
                line_index += 1
            if line_index < len(lines):
                current_question["choices"] = lines[line_index].strip()
                line_index += 1
            if line_index < len(lines):
                current_question["answer"] = lines[line_index].strip()
                line_index += 1
            if line_index < len(lines):
                current_question["explanation"] = lines[line_index].strip()
                line_index += 1

            # 処理が終わったら、現在の質問データを追加
            questions_to_insert.append(current_question)
            current_question = {} # 次の質問のためにリセット

        else:
            line_index += 1 # その他の行はスキップ
    
    # このパースロジックでは、最後に残った質問データの処理は不要になるはずですが、念のためコメントアウト
    # if current_question:
    #     questions_to_insert.append(current_question)

    # データベースへの挿入
    try:
        for q_data in questions_to_insert:
            # Q_no がない場合は None を挿入（データベースのAUTOINCREMENTに任せる）
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
        print(f"成功: {len(questions_to_insert)} 件の質問をデータベースにインポートしました。")

    except sqlite3.Error as e:
        print(f"データ挿入エラー: {e}")
        conn.rollback() # エラー時はロールバック
    finally:
        conn.close()

if __name__ == '__main__':
    print(f"データベースファイルパス: {os.path.abspath(DATABASE_FILE)}")
    print(f"テキストファイルパス: {os.path.abspath(QUIZ_TXT_FILE)}")
    import_data_from_txt()