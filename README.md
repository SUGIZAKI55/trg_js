# Sugi-Tech Quiz Project (trg_js)

このプロジェクトは、NestJS（バックエンド）と React (Vite)（フロントエンド）を分離したモノレポ構成のクイズ学習プラットフォームです。

**✨ Phase 2 実装完了**: 一括削除、CSVエクスポート、問題複製、ジャンル管理機能を実装しました。

## 1. 構成概要

| 項目 | 技術 |
| :--- | :--- |
| **Frontend** | React (Vite) + TypeScript |
| **Backend** | NestJS + TypeORM |
| **Database** | PostgreSQL (trg_js_db) |
| **認証** | JWT (passport-jwt) |

## 2. ディレクトリ構造

```text
.
├── backend/                     # バックエンド (NestJS)
│   ├── src/
│   │   ├── auth/              # 認証ロジック (JWT, Strategy, Guards)
│   │   ├── companies/         # 企業管理 (マルチテナント対応)
│   │   ├── entities/          # DBテーブル定義 (TypeORM Entity)
│   │   │   ├── user.entity.ts
│   │   │   ├── question.entity.ts
│   │   │   ├── learning-log.entity.ts
│   │   │   ├── genre.entity.ts        # ✨ Phase 2D: 新規
│   │   │   └── ...
│   │   ├── learning-logs/     # 学習ログ管理
│   │   ├── questions/         # クイズ問題管理 (Phase 2A-C: 拡張)
│   │   ├── genres/            # ✨ Phase 2D: ジャンル管理 (新規)
│   │   ├── users/             # ユーザー管理 (CRUD, DTO)
│   │   └── main.ts            # サーバー起動エントリーポイント (port 3000)
│   ├── .env                   # PostgreSQL接続設定
│   ├── .env.example           # サンプル環境設定
│   ├── seed.ts                # テストデータ投入スクリプト
│   └── package.json
├── frontend/                   # フロントエンド (Vite + React)
│   ├── src/
│   │   ├── components/        # UIコンポーネント
│   │   │   ├── QuestionManager.tsx    # ✨ Phase 2: 拡張版
│   │   │   ├── QuestionEditModal.tsx  # モーダル編集
│   │   │   ├── QuestionPreview.tsx    # リアルタイムプレビュー
│   │   │   └── ...
│   │   ├── contexts/          # AuthContext (ログイン状態保持)
│   │   ├── App.tsx            # ルーティング定義 (React Router)
│   │   └── main.tsx           # アプリ起動エントリーポイント
│   └── vite.config.ts         # Vite設定 (APIプロキシ含む)
├── .claude/
│   ├── launch.json            # 開発サーバー起動設定
│   └── plans/                 # 実装計画ドキュメント
└── README.md
```

## 3. セットアップ

### 前提環境

- **Node.js**: v16 以上
- **PostgreSQL**: v12 以上（インストール済み）
- **Git**: バージョン管理用

### PostgreSQL 初期設定

```bash
# PostgreSQL クライアントでログイン
psql -U postgres

# データベース・ユーザー作成
CREATE DATABASE trg_js_db;
CREATE USER trg_user WITH PASSWORD 'trg_password_123';
GRANT ALL PRIVILEGES ON DATABASE trg_js_db TO trg_user;
ALTER SCHEMA public OWNER TO trg_user;

# 接続確認
\c trg_js_db trg_user
```

### 依存関係のインストール

```bash
# バックエンド
cd backend && npm install

# フロントエンド
cd frontend && npm install
```

### 環境設定

```bash
# バックエンド .env ファイル
cp backend/.env.example backend/.env

# 内容確認 (既に設定済み)
cat backend/.env
```

### テストデータ投入

```bash
cd backend
npx ts-node seed.ts
# 出力: "Seeding completed!"
```

### 開発サーバーの起動

```bash
# ターミナル1: バックエンド (http://localhost:3000)
cd backend && npm run start:dev

# ターミナル2: フロントエンド (http://localhost:5173)
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

## 6. Phase 2 実装機能 ✨

### 実装完了した機能

#### Phase 2A: 一括削除機能
- **Backend**: `POST /api/questions/batch-delete`
  - 複数の問題IDを配列で受け取り一括削除
  - 権限チェック（該当企業のみ）
  - 削除件数をレスポンスで返却

- **Frontend**: QuestionManager に一括削除UI
  - チェックボックスで複数選択
  - ヘッダーに「全選択」チェックボックス
  - 選択数を表示するバッジ
  - 削除前に確認ダイアログを表示

#### Phase 2B: CSV エクスポート機能
- **Backend**: `GET /api/questions/export/csv?genre=&type=`
  - ジャンル・タイプでフィルタ可能
  - CSV形式で生成（適切なエスケープ処理済み）
  - Content-Type と Content-Disposition ヘッダー設定

- **Frontend**: QuestionManager に CSV出力ボタン
  - フィルタバーに「📥 CSV」ボタン
  - 現在のフィルタ条件を反映
  - ブラウザ自動ダウンロード

#### Phase 2C: 問題複製機能
- **Backend**: `POST /api/questions/:id/duplicate`
  - 既存問題をコピー
  - ID をリセット（新規作成）
  - カスタムタイトル指定可能（デフォルト: 元の題名 + "(コピー)")
  - 同じ企業に保存

- **Frontend**: QuestionManager テーブルに複製ボタン
  - 各行に「📋 複製」ボタン（編集・削除と並列）
  - 複製時にタイトル入力ダイアログを表示
  - 新規作成後、テーブル自動更新

#### Phase 2D: ジャンル管理機能
- **Backend**: GenresModule（新規実装）
  - `GET /api/genres` - ジャンル一覧取得
  - `POST /api/genres` - ジャンル作成
  - `PATCH /api/genres/:id` - ジャンル更新
  - `DELETE /api/genres/:id` - ジャンル削除（未使用のみ）
  - 権限ベースアクセス制御
  - Genre エンティティ作成

- **Frontend**: 準備完了
  - API インテグレーション準備
  - UI フレームワークは後続実装

### テスト結果

全 Phase 2 機能は **curlテストで検証済み**:

```bash
# テスト概要
✅ 一括削除: 複数問題ID削除 → 2件削除確認
✅ CSV出力: 問題をCSV形式で出力 → 正確なデータ確認
✅ 複製: 問題を複製 → ID 5 → ID 6 で新規作成確認
✅ ジャンル: CREATE, READ, UPDATE, DELETE 全機能動作確認
```

詳細なテストログは `git log` でコミット `1c6d86d` を参照してください。

## 7. API エンドポイント一覧

### 認証
- `POST /api/auth/login` - ログイン

### 問題管理
- `GET /api/questions` - 問題一覧（自社 + 共通ライブラリ）
- `GET /api/questions/common` - 共通ライブラリのみ
- `PATCH /api/questions/:id` - 問題更新
- `DELETE /api/questions/:id` - 問題削除（単一）
- `POST /api/questions/:id/copy` - 共通ライブラリ → 自社にコピー
- `POST /api/questions/:id/duplicate` - 問題複製 **(Phase 2C)**
- `GET /api/questions/export/csv` - CSV エクスポート **(Phase 2B)**
- `POST /api/questions/batch-delete` - 一括削除 **(Phase 2A)**
- `GET /api/questions/genres` - ユーザーが利用可能なジャンル一覧

### ジャンル管理 (Phase 2D)
- `GET /api/genres` - ジャンル一覧
- `POST /api/genres` - ジャンル作成（ADMIN 以上）
- `PATCH /api/genres/:id` - ジャンル更新（ADMIN 以上）
- `DELETE /api/genres/:id` - ジャンル削除（MASTER のみ）

### ユーザー管理
- `GET /api/users` - ユーザー一覧
- `POST /api/users` - ユーザー作成

### 学習ログ
- `GET /api/learning-logs` - 学習ログ一覧
- `POST /api/learning-logs` - 学習結果記録

## 8. 開発者向け情報

### テストユーザー（seed.ts で生成）

| ユーザー名 | パスワード | 権限 | 用途 |
| :--- | :--- | :--- | :--- |
| `master` | `admin123` | MASTER | システム全体管理 |
| `superadmin_a` | `admin123` | SUPER_ADMIN | 企業 A 管理者 |
| `manager_sales` | `admin123` | ADMIN | 営業部管理 |
| `staff_01` | `admin123` | USER | 一般学習者 |

### テスト企業

| 企業名 | ID | 用途 |
| :--- | :--- | :--- |
| SugiTech Master | 1 | マスター用 |
| Client Corp A | 5 | テスト用 |

### コミット履歴

```
1c6d86d - Phase 2 機能実装：一括削除、CSVエクスポート、問題複製、ジャンル管理
```

## 9. 次のステップ

### Option 1: 本番環境デプロイ準備
- 環境変数管理（.env ファイルの秘密化）
- データベースマイグレーション戦略
- セキュリティ設定の確認
- CI/CD パイプラインの構築

### Phase 2D フロントエンド完成
- GenreManager コンポーネント作成
- UI統合テスト
- 権限別UIの表示/非表示

### 今後の拡張可能な機能
- 高度な分析ダッシュボード
- リアルタイム通知
- マルチ言語対応
- モバイルアプリ化
