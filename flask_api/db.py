# flask_api/db.py の内容

from flask import g, current_app
import sqlite3
import os # <-- この行を追加！

def get_db():
    """
    現在のアプリケーションコンテキストでデータベース接続を取得します。
    接続が存在しない場合は新しく作成します。
    """
    if 'db' not in g:
        g.db = sqlite3.connect(current_app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row # 行を辞書のようにアクセスできるように設定
    return g.db

def close_db(e=None):
    """
    データベース接続を閉じます。
    リクエストの終了時やアプリケーションコンテキストの終了時に呼び出されます。
    """
    db = g.pop('db', None) # gから'db'を取り出し、なければNoneを返す
    if db is not None:
        db.close()

def init_db(app):
    """
    データベースを初期化し、schema.sqlに基づいてテーブルを作成します。
    """
    with app.app_context():
        db = get_db()
        # schema.sql のパスを正しく指定 (app.root_path を使うことで安全に)
        schema_path = os.path.join(app.root_path, 'schema.sql') # os.path.join を使用してパスを結合
        try:
            with open(schema_path, mode='r', encoding='utf-8') as f:
                db.cursor().executescript(f.read())
            db.commit()
            print("データベーススキーマが正常に初期化されました。")
        except FileNotFoundError:
            print(f"エラー: schema.sql ファイルが '{schema_path}' に見つかりません。")
        except sqlite3.Error as e:
            print(f"データベース初期化エラー: {e}")
            db.rollback() # エラー時はロールバック

# --- データベース操作ヘルパー関数 ---

def query_db(query, args=(), one=False):
    """
    データベースからデータをクエリするためのヘルパー関数。
    SELECT文に使用します。
    :param query: 実行するSQLクエリ文字列
    :param args: クエリのパラメータ (タプル)
    :param one: Trueの場合、結果の最初の行のみを返す（単一の結果用）
    :return: クエリ結果 (リストのリスト、または単一の行、またはNone)
    """
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def execute_db(query, args=()):
    """
    データベースに書き込み操作（INSERT, UPDATE, DELETE）を実行するためのヘルパー関数。
    変更をコミットします。
    :param query: 実行するSQLクエリ文字列
    :param args: クエリのパラメータ (タプル)
    """
    db = get_db()
    cur = db.cursor()
    cur.execute(query, args)
    db.commit() # 変更をデータベースに保存
    cur.close()