# trg_js/flask_api/db.py

from flask import g, current_app
import sqlite3
import os
import logging

logger = logging.getLogger(__name__)

def get_db():
    if 'db' not in g:
        db_path = current_app.config.get('DATABASE')
        if not db_path:
            logger.error("データベースパスが current_app.config に設定されていません。")
            raise Exception("Database path not configured.")
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db(app):
    with app.app_context():
        db = get_db()
        schema_path = os.path.join(app.root_path, 'schema.sql')
        try:
            with open(schema_path, mode='r', encoding='utf-8') as f:
                db.cursor().executescript(f.read())
            db.commit()
            logger.info("データベーススキーマが正常に初期化されました。")
        except FileNotFoundError:
            logger.error(f"エラー: schema.sql ファイルが '{schema_path}' に見つかりません。")
            raise
        except sqlite3.Error as e:
            logger.error(f"データベース初期化エラー: {e}")
            db.rollback()
            raise

def query_db(query, args=(), one=False):
    db = get_db()
    cur = db.execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def execute_db(query, args=()):
    db = get_db()
    cur = db.cursor()
    cur.execute(query, args)
    db.commit()
    cur.close()