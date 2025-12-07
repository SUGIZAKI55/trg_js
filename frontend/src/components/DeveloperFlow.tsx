import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DeveloperFlow: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(null);
  const navigate = useNavigate();
  const flows = [
    { id: '1', title: 'ログイン', steps: ['React: Post /login', 'Flask: Check DB', 'Flask: Return Token'] },
    { id: '2', title: 'ユーザー一覧', steps: ['React: Get /users', 'Flask: Select * Users', 'React: Render Table'] },
    { id: '3', title: 'クイズ', steps: ['React: Post /submit', 'Flask: Check Answer', 'Flask: Save Result'] },
  ];

  return (
    <div className="container-main" style={{maxWidth:'800px'}}>
      <div className="text-center mb-5">
        <h1 className="page-title">動作フロー</h1>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin')}>戻る</button>
      </div>

      {flows.map(f => (
        <div key={f.id} className="card" style={{marginBottom:'16px'}}>
          <div className="card-header" onClick={() => setOpenId(openId===f.id?null:f.id)} style={{cursor:'pointer'}}>
            {f.title} <span>{openId===f.id?'▲':'▼'}</span>
          </div>
          {openId === f.id && (
            <div className="card-body">
              {f.steps.map((s, i) => <div key={i} style={{padding:'8px', borderBottom:'1px dashed #444'}}>{s}</div>)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
export default DeveloperFlow;