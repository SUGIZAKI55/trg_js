import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. 表示したいフローのデータをここに定義します
// (今回は代表的な3つのフローを定義しました)
const flowData = [
  {
    id: 'login',
    title: '① ログイン (/login)',
    flow: [
      { actor: 'React (Login.tsx)', action: 'ユーザーが「ログイン」ボタンをクリック。' },
      { actor: 'React (Login.tsx)', action: '`axios.post("/api/auth/login")` でFlaskにAPIリクエスト。' },
      { actor: 'Flask (api.py)', action: '`@api_bp.route("/api/auth/login")` がリクエストを受け取る。' },
      { actor: 'DB (db.py)', action: '`query_db("SELECT * FROM users")` でユーザーを検索。' },
      { actor: 'Flask (api.py)', action: 'パスワードを照合し、OKなら「トークン」を発行して返す (HTTP 200)。' },
      { actor: 'React (AuthContext.tsx)', action: 'トークンを受け取り、`localStorage`に保存し、認証状態を更新。' },
      { actor: 'React (App.tsx)', action: '認証状態の変更を検知し、`/dashboard` または `/admin` へ自動遷移。' },
    ],
  },
  {
    id: 'users',
    title: '② ユーザー一覧表示 (/users)',
    flow: [
      { actor: 'React (App.tsx)', action: '`/users` へのアクセスを検知し、`UserList.tsx` を表示。' },
      { actor: 'React (UserList.tsx)', action: '`useEffect`が発動。`axios.get("/api/admin/users")` でAPIリクエスト。' },
      { actor: 'Flask (api.py)', action: '`@api_bp.route("/api/admin/users")` がリクエストを受け取る。' },
      { actor: 'DB (db.py)', action: '`query_db("SELECT * FROM users")` で全ユーザーを検索。' },
      { actor: 'Flask (api.py)', action: '全ユーザーのリストをJSONでReactに返す (HTTP 200)。' },
      { actor: 'React (UserList.tsx)', action: '`setUsers(data)` で状態を更新し、テーブルを画面に描画する。' },
    ],
  },
  {
    id: 'quiz',
    title: '③ クイズ解答 (/question)',
    flow: [
      { actor: 'React (QuizQuestion.tsx)', action: '`useEffect`で問題表示時刻 `startTime` を記録。' },
      { actor: 'React (QuizQuestion.tsx)', action: '「解答する」ボタンをクリック。`handleSubmitAnswer`が発動。' },
      { actor: 'React (QuizQuestion.tsx)', action: '`axios.post("/api/quiz/submit_answer", { startTime_iso: ... })` でAPIリクエスト。' },
      { actor: 'Flask (api.py)', action: '`@api_bp.route("/api/quiz/submit_answer")` がリクエストを受け取る。' },
      { actor: 'DB (db.py)', action: '`query_db("SELECT answer FROM questions")` で正解を取得。' },
      { actor: 'Flask (api.py)', action: 'ユーザーの解答と正解を比較し、`is_correct` を判定。' },
      { actor: 'Flask (api.py)', action: '`start_time` と現在時刻から `elapsed_time` を計算。' },
      { actor: 'Flask (log_manager.py)', action: '`log_w()` を呼び出し、詳細ログを `log.ndjson` に書き込む。' },
      { actor: 'DB (db.py)', action: '`execute_db("INSERT INTO results")` で解答結果をDBに保存。' },
      { actor: 'Flask (api.py)', action: '「正解/不正解/解説」をJSONでReactに返す (HTTP 200)。' },
      { actor: 'React (QuizQuestion.tsx)', action: '`setResult(data)` で状態を更新し、結果モーダルを表示する。' },
    ],
  },
];

// 2. アコーディオンの「部品」を定義
const AccordionItem = ({ title, flow, isOpen, onToggle }) => (
  <div className="accordion-item card shadow mb-2" style={{ backgroundColor: '#1e1e1e', borderColor: '#333' }}>
    <h2 className="card-header" id={`heading-${title}`}>
      <button
        className="btn btn-link btn-block text-left"
        type="button"
        onClick={onToggle}
        style={{ color: '#e4e6eb', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 600, width: '100%' }}
      >
        {title}
      </button>
    </h2>
    {isOpen && (
      <div className="card-body">
        <ul className="list-group list-group-flush">
          {flow.map((step, index) => (
            <li key={index} className="list-group-item" style={{ backgroundColor: '#2a2a2a', borderColor: '#444' }}>
              <strong style={{ color: '#0d6efd' }}>{step.actor}:</strong> {step.action}
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// 3. アコーディオンをまとめる「ページ」本体
const DeveloperFlow: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    // App.tsxで全体に 'width: 80%' を設定したので、
    // ここでは個別の 'style' を削除し、シンプルな 'div' にします
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">アプリケーション動作フロー</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/admin')}>
          管理画面に戻る
        </button>
      </div>
      <p className="text-muted">各機能をクリックすると、裏側で動いているソースコードとデータの流れが表示されます。</p>
      
      <div className="accordion">
        {flowData.map((item) => (
          <AccordionItem
            key={item.id}
            title={item.title}
            flow={item.flow}
            isOpen={openId === item.id}
            onToggle={() => handleToggle(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default DeveloperFlow;