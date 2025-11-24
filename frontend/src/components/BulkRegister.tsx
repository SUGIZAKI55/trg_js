import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BulkRegister: React.FC = () => {
  const [mode, setMode] = useState<'user' | 'company'>('user');
  const [csvText, setCsvText] = useState('');
  const [result, setResult] = useState<{ message: string; errors: string[] } | null>(null);
  const { auth } = useAuth();
  const navigate = useNavigate();
  const isMaster = auth?.role === 'master';

  const handleSubmit = async () => {
    if (!csvText.trim()) return;
    setResult(null);

    try {
      const endpoint = mode === 'user' ? '/api/admin/bulk_users' : '/api/master/bulk_companies';
      const res = await axios.post(endpoint, 
        { csv_text: csvText },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      setResult(res.data);
      if (res.data.errors.length === 0) {
        setCsvText(''); // 全成功ならクリア
      }
    } catch (err) {
      alert("送信に失敗しました。");
    }
  };

  return (
    // ★★★ 修正点: maxWidthを600pxにし、margin: '0 auto' で中央寄せを強化 ★★★
    <div className="container" style={{ maxWidth: '600px', margin: '3rem auto' }}>
      
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="mb-0 h5">一括登録ツール</h2>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/admin')}>
            戻る
          </button>
        </div>
        
        <div className="card-body p-4">
          
          {/* モード切替タブ */}
          {isMaster && (
            <div className="d-flex justify-content-center mb-4">
              <div className="btn-group w-100">
                <button 
                  className={`btn ${mode === 'user' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => { setMode('user'); setResult(null); }}
                  style={{ borderRadius: '20px 0 0 20px', flex: 1 }}
                >
                  ユーザー
                </button>
                <button 
                  className={`btn ${mode === 'company' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => { setMode('company'); setResult(null); }}
                  style={{ borderRadius: '0 20px 20px 0', flex: 1 }}
                >
                  企業
                </button>
              </div>
            </div>
          )}

          <div className="alert alert-light border mb-3" style={{ backgroundColor: '#f8fbff', borderColor: '#e0e5ec', fontSize: '0.9rem' }}>
            {mode === 'user' ? (
              <>
                <strong className="text-primary">書式:</strong> ユーザー名, パスワード, 権限, 企業名<br/>
                <div className="mt-2 p-2 bg-white rounded border">
                  <code>
                    yamada, pass1234, staff, 株式会社A<br/>
                    sato, pass5678, admin, 有限会社B
                  </code>
                </div>
              </>
            ) : (
              <>
                <strong className="text-primary">書式:</strong> 企業名（1行に1社）<br/>
                <div className="mt-2 p-2 bg-white rounded border">
                  <code>
                    株式会社A<br/>
                    有限会社B
                  </code>
                </div>
              </>
            )}
          </div>

          <div className="form-group mb-4">
            <textarea
              className="form-control"
              rows={8}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={mode === 'user' ? "貼り付けてください..." : "株式会社A\n株式会社B"}
              style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6' }}
            />
          </div>

          <div className="text-center">
            <button 
              className="btn btn-primary w-100" 
              onClick={handleSubmit} 
              disabled={!csvText}
            >
              登録を実行
            </button>
          </div>

          {/* 結果表示 */}
          {result && (
            <div className="mt-4 animate-fade-in">
              <div className={`alert ${result.errors.length === 0 ? 'alert-success' : 'alert-warning'}`}>
                <h6 className="alert-heading mb-1">{result.message}</h6>
                {result.errors.length > 0 && (
                  <ul className="mb-0 pl-3 mt-2 small text-start">
                    {result.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default BulkRegister;