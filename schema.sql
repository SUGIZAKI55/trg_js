-- users テーブル: データを永続化するため、毎回削除しないように修正
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' -- ★追加: ユーザーのロール（権限）カラム
);

-- quiz_questions テーブルも初回起動時のみ作成する
CREATE TABLE IF NOT EXISTS quiz_questions (
    rowid INTEGER PRIMARY KEY AUTOINCREMENT,
    Q_no INTEGER, -- 問題番号（任意、テキストファイルからインポート用）
    genre TEXT NOT NULL,
    title TEXT NOT NULL,
    choices TEXT NOT NULL, -- 例: "選択肢1:選択肢2:選択肢3"
    answer TEXT NOT NULL,  -- 例: "正解1:正解2" (複数正解対応)
    explanation TEXT       -- 解説
);
