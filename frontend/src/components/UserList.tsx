import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// (Userインターフェースは変更なし)
interface User {
  id: number;
  username: string;
  role: string;
  company_name: string | null;
  created_at: string;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const { auth } = useAuth();
  const navigate = useNavigate();

  // (useEffectのロジックは変更なし)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setUsers(response.data);
      } catch (err) {
        setError('ユーザーの読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchUsers();
  }, [auth?.token]);

  // (handleSelectOne, handleSelectAll, handleDeleteSelected のロジックは変更なし)
  const handleSelectOne = (id: number) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(selectedUserIds.filter((userId) => userId !== id));
    } else {
      setSelectedUserIds([...selectedUserIds, id]);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(users.map((user) => user.id));
    } else {
      setSelectedUserIds([]);
    }
  };
  
  const handleDeleteSelected = () => {
    if (selectedUserIds.length === 0) return;
    if (window.confirm(`選択された ${selectedUserIds.length} 件のユーザーを本当に削除しますか？\n(※現在この機能はUIのみです)`)) {
      alert("削除機能は現在API未実装です。");
    }
  };

  // (loading/errorの表示は変更なし)
  if (loading) {
    return <div className="container mt-5 text-center"><h2>読み込み中...</h2></div>;
  }
  if (error) {
    return <div className="container mt-5 alert alert-danger">{error}</div>;
  }

  // ★★★ 修正点: 外枠のdivを "container-fluid mt-4" に変更 ★★★
  return (
    <div className="container-fluid mt-4">
      
      {/* 1. ヘッダーとパンくずリスト（ダミー） */}
      <nav aria-label="breadcrumb"> {/* mt-4は親に移動したので削除 */}
        <ol className="breadcrumb" style={{ backgroundColor: 'transparent', paddingLeft: 0 }}>
          <li className="breadcrumb-item"><a href="/admin">ダッシュボード</a></li>
          <li className="breadcrumb-item active" aria-current="page" style={{ color: '#ccc' }}>ユーザー管理</li>
        </ol>
      </nav>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">ユーザーの管理</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/admin')}>
          管理画面トップに戻る
        </button>
      </div>

      {/* 2. アクションボタン（選択時のみ有効化） */}
      <div className="mb-3">
        <button 
          className="btn btn-danger btn-sm" 
          disabled={selectedUserIds.length === 0}
          onClick={handleDeleteSelected}
        >
          選択したユーザーを削除 ({selectedUserIds.length})
        </button>
      </div>

      {/* 3. テーブル（カードを削除し、table-dark を適用） */}
      <div className="table-responsive">
        <table className="table table-dark table-striped table-hover table-bordered">
          <thead className="thead-dark">
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox"
                  className="form-check-input"
                  style={{ backgroundColor: '#444', border: '1px solid #666' }}
                  onChange={handleSelectAll}
                  checked={users.length > 0 && selectedUserIds.length === users.length}
                />
              </th>
              <th>ユーザー名</th>
              <th>役割</th>
              <th>所属企業</th>
              <th>登録日</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className={selectedUserIds.includes(user.id) ? 'table-primary' : ''}>
                  <td>
                    <input 
                      type="checkbox"
                      className="form-check-input"
                      style={{ backgroundColor: '#444', border: '1px solid #666' }}
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => handleSelectOne(user.id)}
                    />
                  </td>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>{user.company_name || 'N/A'}</td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
                  ユーザーはまだ登録されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
};

export default UserList;