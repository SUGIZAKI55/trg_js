import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';

const BulkRegister: React.FC = () => {
  const [mode, setMode] = useState<'user' | 'company'>('user');
  const [csvText, setCsvText] = useState('');
  const [result, setResult] = useState<any>(null);
  const { auth } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const endpoint = mode === 'user' ? '/admin/bulk_users' : '/master/bulk_companies';
      const res = await apiClient.post(endpoint, { csv_text: csvText });
      setResult(res.data);
      if (!res.data.errors.length) setCsvText('');
    } catch { alert("送信失敗"); }
  };

  return (
    <div className="container-narrow">
      <div className="text-center mb-5">
        <h1 className="page-title">一括登録ツール</h1>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin')}>戻る</button>
      </div>

      <div className="card">
        <div className="card-header">
          {auth?.role === 'master' && (
            <div style={{display:'flex', gap:'10px'}}>
              <button className={`btn btn-sm ${mode==='user'?'btn-primary':'btn-secondary'}`} onClick={() => setMode('user')}>ユーザー</button>
              <button className={`btn btn-sm ${mode==='company'?'btn-primary':'btn-secondary'}`} onClick={() => setMode('company')}>企業</button>
            </div>
          )}
        </div>
        <div className="card-body">
          <div className="alert alert-info">
            {mode === 'user' ? '書式: ユーザー名, パスワード, 権限, 企業名' : '書式: 企業名 (1行1社)'}
          </div>
          <textarea 
            className="form-control mb-4" 
            rows={10} 
            value={csvText} 
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={mode === 'user' ? "user1,pass1,staff,CorpA..." : "CorpA\nCorpB..."} 
            style={{fontFamily:'monospace'}}
          />
          <button className="btn btn-primary w-100" onClick={handleSubmit} disabled={!csvText}>登録実行</button>
          
          {result && (
            <div className={`alert ${result.errors.length ? 'alert-error' : 'alert-success'} mt-3`}>
              {result.message}
              {result.errors.map((e:string, i:number) => <div key={i}>{e}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default BulkRegister;