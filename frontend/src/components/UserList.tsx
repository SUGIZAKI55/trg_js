import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  role: string;
  company_name: string | null;
  created_at: string;
}

interface Company {
  id: number;
  name: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const navigate = useNavigate();
  const isMaster = auth?.role === 'master';

  // --- モーダル制御 ---
  const [showModal, setShowModal] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<string>('');

  useEffect(() => {
    fetchUsers();
    if (isMaster) {
      fetchCompanies();
    }
  }, [isMaster]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('/api/master/companies', {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setCompanies(res.data);
    } catch (err) {
      console.error("企業リスト取得失敗", err);
    }
  };

  const openCompanyModal = (user: User) => {
    setTargetUser(user);
    setSelectedCompany(user.company_name || '');
    setShowModal(true);
  };

  const handleCompanyUpdate = async () => {
    if (!targetUser) return;
    try {
      await axios.post('/api/admin/update_user_company',
        { user_id: targetUser.id, company_name: selectedCompany },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      alert(`所属を「${selectedCompany || '無所属'}」に変更しました。`);
      setShowModal(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "変更に失敗しました。");
    }
  };

  const handlePasswordChange = async (userId: number, username: string) => {
    const newPass = window.prompt(`ユーザー「${username}」の新しいパスワードを入力してください:`);
    if (newPass === null) return;
    if (newPass.length < 4) {
      alert("パスワードは4文字以上にしてください。");
      return;
    }
    try {
      await axios.post('/api/admin/reset_password', 
        { user_id: userId, new_password: newPass },
        { headers: { Authorization: `Bearer ${auth?.token}` } }
      );
      alert("パスワードを変更しました。");
    } catch (err) {
      alert("変更に失敗しました。");
    }
  };

  if (loading) {
    return (
      <div className="container mt-5" style={{ maxWidth: '1200px' }}>
        <div className="card">
          <div className="card-body text-center">
            <h2>読み込み中...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ width: '95%', maxWidth: '1200px', margin: '0 auto', marginTop: '2rem' }}>
      
      <div className="card shadow-lg">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="mb-0 h4">ユーザー管理</h2>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin')}>
            戻る
          </button>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive" style={{ border: 'none', borderRadius: '0' }}>
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th style={{paddingLeft: '30px'}}>ID</th>
                  <th>ユーザー名</th>
                  <th>役割</th>
                  <th>所属企業</th>
                  <th>登録日</th>
                  <th style={{ width: '220px', paddingRight: '30px' }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={{paddingLeft: '30px'}}>{user.id}</td>
                    <td style={{ fontWeight: 'bold', color: '#003366' }}>{user.username}</td>
                    <td>
                      <span className={`badge ${user.role === 'master' ? 'bg-danger' : user.role === 'admin' ? 'bg-primary' : 'bg-secondary'}`}
                            style={{ padding: '5px 10px', borderRadius: '10px', color: '#fff' }}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.company_name || <span className="text-muted small">(無所属)</span>}</td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td style={{paddingRight: '30px'}}>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-warning btn-sm" 
                          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                          onClick={() => handlePasswordChange(user.id, user.username)}
                        >
                          🔑 Pass
                        </button>
                        
                        {isMaster && (
                          <button 
                            className="btn btn-info btn-sm" 
                            style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                            onClick={() => openCompanyModal(user)}
                          >
                            🏢 所属
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- 所属変更モーダル --- */}
      {showModal && targetUser && (
        <div className="modal" style={{ 
          display: 'block', 
          position: 'fixed', 
          top: 0, left: 0, 
          width: '100%', height: '100%', 
          zIndex: 9999, 
          backgroundColor: 'rgba(0,50,100,0.5)', 
          backdropFilter: 'blur(5px)', 
          overflow: 'auto'
        }}>
          <div className="modal-dialog modal-dialog-centered" style={{ marginTop: '10vh' }}>
            <div className="modal-content shadow-lg" style={{ borderRadius: '24px', border: 'none' }}>
              <div className="modal-header bg-light border-bottom-0" style={{ borderRadius: '24px 24px 0 0', padding: '25px' }}>
                <h5 className="modal-title text-primary font-weight-bold">所属企業の変更</h5>
              </div>
              <div className="modal-body p-5 bg-white">
                <p className="mb-4 text-center" style={{ fontSize: '1.1rem' }}>
                  ユーザー <strong>{targetUser.username}</strong> の<br/>新しい所属を選択してください。
                </p>
                <div className="form-group">
                  <label className="form-label">企業名</label>
                  <select
                    className="form-select"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    style={{ fontSize: '1.1rem', padding: '15px' }}
                  >
                    <option value="">(無所属)</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.name}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="modal-footer bg-white border-top-0 justify-content-center pb-4" style={{ borderRadius: '0 0 24px 24px' }}>
                <button 
                  className="btn btn-secondary me-3" 
                  onClick={() => setShowModal(false)}
                  style={{ minWidth: '120px' }}
                >
                  キャンセル
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleCompanyUpdate}
                  style={{ minWidth: '120px' }}
                >
                  変更を保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;