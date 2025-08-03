-- users テーブルが存在すれば削除し、新しく作成
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' -- ★追加: ユーザーのロール（権限）カラム
);

-- quiz_questions テーブルが存在すれば削除し、新しく作成
DROP TABLE IF EXISTS quiz_questions;
CREATE TABLE quiz_questions (
    rowid INTEGER PRIMARY KEY AUTOINCREMENT,
    Q_no INTEGER, -- 問題番号（任意、テキストファイルからインポート用）
    genre TEXT NOT NULL,
    title TEXT NOT NULL,
    choices TEXT NOT NULL, -- 例: "選択肢1:選択肢2:選択肢3"
    answer TEXT NOT NULL,  -- 例: "正解1:正解2" (複数正解対応)
    explanation TEXT       -- 解説
);