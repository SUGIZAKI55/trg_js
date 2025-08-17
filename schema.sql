-- users テーブル: IF NOT EXISTS を使い、データが存在すれば削除しない
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    -- ★★★ 追加: ユーザー登録日時を記録するカラム ★★★
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- quiz_questions テーブルも同様に、IF NOT EXISTS を使用
CREATE TABLE IF NOT EXISTS quiz_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    Q_no INTEGER,
    genre TEXT NOT NULL,
    title TEXT NOT NULL,
    choices TEXT NOT NULL,
    answer TEXT NOT NULL,
    explanation TEXT
);