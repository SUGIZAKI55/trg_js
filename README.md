# SUGIZAKIアプリ 開発マニュアル

このアプリは「バックエンド（NestJS）」と「フロントエンド（React）」の2つが連携して動きます。
開発時は、以下の手順でそれぞれ別のターミナルを開いて起動してください。

## 1. バックエンド（サーバー・データベース）の起動
* **役割**: データの保存、読み出し、ログイン処理など
* **URL**: http://localhost:3000

### 起動手順
1.  ターミナルを開く
2.  以下のコマンドを実行
    ```bash
    cd backend
    npm run start:dev
    ```
3.  緑色の文字で `Nest application successfully started` と出れば成功！
    *(このターミナルは閉じずにそのままにしておく)*

---

## 2. フロントエンド（画面）の起動
* **役割**: ユーザーが見る画面の表示
* **URL**: http://localhost:5173

### 起動手順
1.  **新しいターミナル（タブ）** を開く（Macなら `Command + T`）
2.  以下のコマンドを実行
    ```bash
    cd frontend
    npm run dev
    ```
3.  `Local: http://localhost:5173/` と出れば成功！
    *(このターミナルも閉じずにそのままにしておく)*

---

## 3. ブラウザで確認
Chromeなどのブラウザで以下のアドレスにアクセスしてください。
[http://localhost:5173](http://localhost:5173)

---

## 4. 終了方法
起動している各ターミナルで `Ctrl + C` を押すと停止します。

## 📅 開発ロードマップ (Roadmap)

### 完了した機能 (Done)
- [x] **バックエンド刷新 (NestJS)**: Pythonコードを全削除し、TypeScript(NestJS)へ完全移行
- [x] **データベース構築**: SQLite + TypeORM でのリレーション構築
- [x] **認証機能 (Auth)**: JWTを使ったログイン・権限管理 (MASTER / ADMIN)
- [x] **会社管理機能 (Company)**: 会社の一覧表示・新規登録

### 現在開発中 (In Progress)
- [ ] **ユーザー(社員)登録機能**: 作成した会社に紐づくユーザーを作成する
- [ ] **ユーザー一覧表示**: 所属会社や部署を含めた一覧表示

### 今後の予定 (Todo)
- [ ] **クイズ・問題管理機能**: 問題の作成・編集API
- [ ] **学習履歴ログ**: 受講結果の保存と可視化

---

## 🔑 テスト用アカウント・データ (Test Data)

### 1. 初期データ (Seed Data)
データベース初期化(`npm run seed`)時に自動作成されるデータです。
**パスワードは全ユーザー共通**: `admin123`

| 役割 | ユーザーID | パスワード | 所属 |
| :--- | :--- | :--- | :--- |
| **システム管理者 (Master)** | `master` | `admin123` | SugiTech Master |
| **企業管理者 (Client Admin)** | `superadmin_a` | `admin123` | Client Corp A |
| **部署マネージャー** | `manager_sales` | `admin123` | Client Corp A |
| **一般スタッフ** | `staff_01` | `admin123` | Client Corp A |

### 2. 動作確認用データ (Manual Test)
画面から手動で登録するテストユーザーの予定データです。

#### 👤 一般スタッフ作成テスト
* **画面**: スタッフ登録画面 (/register_staff)
* **ユーザーID**: `sugi_staff`
* **パスワード**: `password123` (※手入力で設定)
* **権限**: 一般 (staff)
* **所属会社**: 株式会社スギテック