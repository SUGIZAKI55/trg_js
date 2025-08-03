# trg_js/flask_api/db.py

from flask import g, current_app
import sqlite3
import os
import logging # ロギングを追加

logger = logging.getLogger(__name__)

def get_db():
    """
    現在のアプリケーションコンテキストでデータベース接続を取得します。
    接続が存在しない場合は新しく作成します。
    """
    if 'db' not in g:
        # current_app.config['DATABASE'] からデータベースパスを取得
        db_path = current_app.config.get('DATABASE')
        if not db_path:
            logger.error("データベースパスが current_app.config に設定されていません。")
            raise Exception("Database path not configured.") # 設定されていない場合はエラーを発生させる
        
        g.db = sqlite3.connect(db_path)
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
        # logger.info("データベース接続を閉じました。") # 必要に応じてログ出力

def init_db(app):
    """
    データベースを初期化し、schema.sqlに基づいてテーブルを作成します。
    """
    with app.app_context():
        db = get_db()
        # schema.sql のパスを正しく指定 (app.root_path を使うことで安全に)
        # schema.sql は trg_js/ 直下にあると仮定
        schema_path = os.path.join(app.root_path, 'schema.sql')
        try:
            with open(schema_path, mode='r', encoding='utf-8') as f:
                db.cursor().executescript(f.read()) # schema.sqlの内容を読み込み、実行
            db.commit()
            logger.info("データベーススキーマが正常に初期化されました（または更新されました）。")
        except FileNotFoundError:
            logger.error(f"エラー: schema.sql ファイルが '{schema_path}' に見つかりません。データベース初期化に失敗しました。")
            # アプリケーションの起動を妨げるため、ここでは例外を再発生させることも検討
        except sqlite3.Error as e:
            logger.error(f"データベース初期化エラー: {e}")
            db.rollback() # エラー時はロールバック
            # アプリケーションの起動を妨げるため、ここでは例外を再発生させることも検討

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
    db = get_db() # 接続を確立または取得
    cur = db.execute(query, args)
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
    db = get_db() # 接続を確立または取得
    cur = db.cursor()
    cur.execute(query, args)
    db.commit() # 変更をデータベースに保存
    cur.close()