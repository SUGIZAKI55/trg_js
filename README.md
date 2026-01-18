# Sugi-Tech Quiz Project (trg_js)

このプロジェクトは、NestJS（バックエンド）と React (Vite)（フロントエンド）を分離したモノレポ構成のクイズ学習プラットフォームです。

## 1. 構成概要
- **Frontend**: React (Vite) + TypeScript
- **Backend**: NestJS + SQLite (Prisma/TypeORM等)
- **Database**: SQLite (`sugizaki_v2.db`)

## 2. ディレクトリ構造

```text
.
├── backend/                  # バックエンド (NestJS)
│   ├── src/
│   │   ├── auth/            # 認証ロジック (JWT, Strategy, Guards)
│   │   ├── users/           # ユーザー管理 (CRUD, DTO)
│   │   ├── companies/       # 企業管理 (マルチテナント対応)
│   │   ├── questions/       # クイズ問題管理
│   │   ├── entities/        # DBテーブル定義 (Entity)
│   │   └── main.ts          # サーバー起動エントリーポイント
│   └── sugizaki_v2.db       # データベース本体
├── frontend/                 # フロントエンド (Vite + React)
│   ├── src/
│   │   ├── components/      # UIコンポーネント
│   │   ├── contexts/        # AuthContext (ログイン状態保持)
│   │   ├── App.tsx          # ルーティング定義 (React Router)
│   │   └── main.tsx         # アプリ起動エントリーポイント
└── README.md
```
## 2. ディレクトリ構造詳細
```
.
├── backend
│   ├── eslint.config.mjs
│   ├── nest-cli.json
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   ├── seed.ts
│   ├── src
│   │   ├── app.controller.spec.ts
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   ├── auth
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── local-auth.guard.ts
│   │   │   └── local.strategy.ts
│   │   ├── companies
│   │   │   ├── companies.controller.ts
│   │   │   ├── companies.module.ts
│   │   │   └── companies.service.ts
│   │   ├── entities
│   │   │   ├── company.entity.ts
│   │   │   ├── course.entity.ts
│   │   │   ├── department.entity.ts
│   │   │   ├── learning-log.entity.ts
│   │   │   ├── question.entity.ts
│   │   │   ├── section.entity.ts
│   │   │   └── user.entity.ts
│   │   ├── main.ts
│   │   ├── questions
│   │   │   ├── dto
│   │   │   │   └── create-question.dto.ts
│   │   │   ├── questions.controller.ts
│   │   │   ├── questions.module.ts
│   │   │   └── questions.service.ts
│   │   └── users
│   │       ├── create-user.dto.ts
│   │       ├── dto
│   │       │   └── create-user.dto.ts
│   │       ├── users.controller.ts
│   │       ├── users.module.ts
│   │       └── users.service.ts
│   ├── sugizaki_v2.db
│   ├── test
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   ├── tsconfig.build.json
│   └── tsconfig.json
├── frontend
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   │   └── vite.svg
│   ├── README.md
│   ├── src
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── assets
│   │   │   └── react.svg
│   │   ├── components
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── BulkRegister.tsx
│   │   │   ├── CreateQuestion.tsx
│   │   │   ├── DeveloperFlow.tsx
│   │   │   ├── GenreSelect.tsx
│   │   │   ├── LearnerAnalysis.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── LogViewer.tsx
│   │   │   ├── MyAnalysis.tsx
│   │   │   ├── MyResults.tsx
│   │   │   ├── Navbar.tsx
│   │   │   ├── QuestionManager_aoki.tsx
│   │   │   ├── QuestionManager.tsx
│   │   │   ├── QuizQuestion.tsx
│   │   │   ├── QuizResults.tsx
│   │   │   ├── RegisterCompany.tsx
│   │   │   ├── RegisterStaff.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── TestResults.tsx
│   │   │   ├── UserDashboard.tsx
│   │   │   └── UserList.tsx
│   │   ├── contexts
│   │   │   └── AuthContext.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── tsconfig.app.json
│   ├── tsconfig.app.tsbuildinfo
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
└── README.md
```

## 3. 権限（Role）設計
`App.tsx` にて定義されている権限別のアクセス制御です。

| 権限 (Role) | 対象者 | 主要なアクセス可能ルート |
| :--- | :--- | :--- |
| **MASTER** | システム所有者 | 全ルート、企業登録 (`/register_company`) |
| **ADMIN / SUPER_ADMIN** | 企業管理者 | 管理者ダッシュボード、ユーザー一覧、問題管理 |
| **USER** | 一般学習者 | 学習者ダッシュボード、クイズ実行、自己分析 |

## 4. ルーティング詳細 (App.tsx)
### 一般ユーザー用
- `/dashboard` : メイン画面
- `/genre` -> `/question` -> `/kekka` : クイズ学習フロー
- `/my_results`, `/my_analysis` : 学習履歴・分析

### 管理者・マスター用
- `/admin` : 管理用ダッシュボード
- `/users`, `/register_staff` : ユーザー・スタッフ管理
- `/q_list`, `/create_question`, `/admin/bulk` : 問題管理（一括登録含む）
- `/admin/logs` : システム操作ログ監視
- `/register_company` : **(MASTER限定)** 企業の新規発行
```