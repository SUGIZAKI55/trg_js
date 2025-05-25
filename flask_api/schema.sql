-- users テーブルを作成します
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- quiz_questions テーブルを作成します
CREATE TABLE quiz_questions (
    rowid INTEGER PRIMARY KEY AUTOINCREMENT,
    Q_no INTEGER,
    genre TEXT,
    title TEXT NOT NULL,
    choices TEXT,
    answer TEXT,
    explanation TEXT
);