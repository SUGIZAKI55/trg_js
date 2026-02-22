# Sugi-Tech Quiz Project (trg_js)

このプロジェクトは、NestJS（バックエンド）と React (Vite)（フロントエンド）を分離したモノレポ構成のクイズ学習プラットフォームです。

## 1. 構成概要

| 項目 | 技術 |
| :--- | :--- |
| **Frontend** | React (Vite) + TypeScript |
| **Backend** | NestJS + TypeORM |
| **Database** | SQLite (`backend/sugizaki_v2.db`) |
| **認証** | JWT (passport-jwt) |

## 2. ディレクトリ構造

```text
.
├── backend/                  # バックエンド (NestJS)
│   ├── src/
│   │   ├── auth/            # 認証ロジック (JWT, Strategy, Guards)
│   │   ├── companies/       # 企業管理 (マルチテナント対応)
│   │   ├── entities/        # DBテーブル定義 (TypeORM Entity)
│   │   ├── learning-logs/   # 学習ログ管理
│   │   ├── questions/       # クイズ問題管理
│   │   ├── users/           # ユーザー管理 (CRUD, DTO)
│   │   └── main.ts          # サーバー起動エントリーポイント (port 3000)
│   └── sugizaki_v2.db       # データベース本体
├── frontend/                 # フロントエンド (Vite + React)
│   ├── src/
│   │   ├── components/      # UIコンポーネント
│   │   ├── contexts/        # AuthContext (ログイン状態保持)
│   │   ├── App.tsx          # ルーティング定義 (React Router)
│   │   └── main.tsx         # アプリ起動エントリーポイント
│   └── vite.config.ts       # Vite設定 (APIプロキシ含む)
├── .claude/
│   └── launch.json          # 開発サーバー起動設定
└── README.md
```

## 3. セットアップ

### 依存関係のインストール

```bash
# バックエンド
cd backend && npm install

# フロントエンド
cd frontend && npm install
```

### 開発サーバーの起動

```bash
# バックエンド (http://localhost:3000)
cd backend && npm run start:dev

# フロントエンド (http://localhost:5173)
cd frontend && npm run dev
```

Claude Code を使用している場合は `.claude/launch.json` の設定からサーバーを起動できます。

## 4. 権限（Role）設計

`App.tsx` にて定義されている権限別のアクセス制御です。

| 権限 (Role) | 対象者 | 主要なアクセス可能ルート |
| :--- | :--- | :--- |
| **MASTER** | システム所有者 | 全ルート、企業登録 (`/register_company`) |
| **ADMIN / SUPER_ADMIN** | 企業管理者 | 管理者ダッシュボード、ユーザー一覧、問題管理 |
| **USER** | 一般学習者 | 学習者ダッシュボード、クイズ実行、自己分析 |

## 5. ルーティング詳細 (App.tsx)

### 一般ユーザー用

| パス | 説明 |
| :--- | :--- |
| `/dashboard` | メイン画面 |
| `/genre` → `/question` → `/kekka` | クイズ学習フロー |
| `/my_results` | 学習履歴 |
| `/my_analysis` | 自己分析 |

### 管理者・マスター用

| パス | 説明 |
| :--- | :--- |
| `/admin` | 管理用ダッシュボード |
| `/users`, `/register_staff` | ユーザー・スタッフ管理 |
| `/q_list`, `/create_question`, `/admin/bulk` | 問題管理（一括登録含む） |
| `/admin/logs` | システム操作ログ監視 |
| `/register_company` | **(MASTER限定)** 企業の新規発行 |
