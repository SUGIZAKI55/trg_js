import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- 1. 型定義 (TypeScriptのエラーを解消) ---
interface FlowStep {
  actor: string;
  action: string;
}

interface FlowData {
  id: string;
  title: string;
  flow: FlowStep[];
}

// --- 2. データ定義 ---
const flowData: FlowData[] = [
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

// --- 3. アコーディオンの「部品」コンポーネント ---
// Propsの型を定義
interface AccordionItemProps {
  title: string;
  flow: FlowStep[];
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, flow, isOpen, onToggle }) => (
  // ダークモードの直書きスタイルを削除し、App.cssのクラスを活用
  <div className="card shadow-sm mb-3" style={{ border: '1px solid #e0e5ec' }}>
    <div 
      className="card-header p-0" 
      id={`heading-${title}`} 
      style={{ backgroundColor: isOpen ? '#f0faff' : 'transparent', transition: '0.2s' }}
    >
      <button
        className="btn btn-link btn-block text-left w-100 text-decoration-none"
        type="button"
        onClick={onToggle}
        style={{ 
          textAlign: 'left', 
          fontWeight: 'bold', 
          fontSize: '1.1rem', 
          color: isOpen ? '#004D99' : '#444', // 開いているときは青、閉じているときはグレー
          padding: '15px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'none', // ボタンの影を消す
          borderRadius: '20px 20px 0 0'
        }}
      >
        <span>{title}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>
    </div>
    {isOpen && (
      <div className="card-body bg-white" style={{ borderRadius: '0 0 20px 20px' }}>
        <ul className="list-group list-group-flush" style={{ listStyle: 'none', padding: 0 }}>
          {flow.map((step, index) => (
            <li key={index} style={{ 
              padding: '12px 0', 
              borderBottom: '1px dashed #eee',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <span style={{ color: '#00ADEF', fontWeight: 'bold', marginBottom: '4px' }}>
                {step.actor}
              </span>
              <span style={{ color: '#555', paddingLeft: '10px' }}>
                {step.action}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

// --- 4. メインコンポーネント ---
const DeveloperFlow: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleToggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="container mt-4" style={{ maxWidth: '900px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">アプリケーション動作フロー</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/admin')}>
          管理画面に戻る
        </button>
      </div>
      
      <div className="alert alert-info mb-4" style={{ backgroundColor: '#f0faff', border: '1px solid #00ADEF', color: '#004D99' }}>
        <small>各機能をクリックすると、裏側で動いているソースコードとデータの流れが表示されます。</small>
      </div>
      
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