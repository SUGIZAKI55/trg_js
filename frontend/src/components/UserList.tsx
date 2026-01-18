import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  username: string;
  role: string;
  company?: { name: string };
  department?: { name: string };
}

const UserList: React.FC = () => {
  const { auth } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  // ユーザー一覧を取得する関数
  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/users', {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      setError('データの取得に失敗しました。');
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchUsers();
    }
  }, [auth]);

  // 削除処理
  const handleDelete = async (id: number, username: string) => {
    if (!window.confirm(`ユーザー「${username}」を削除してもよろしいですか？`)) return;

    try {
      await axios.delete(`http://localhost:3000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      alert('削除に成功しました');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert('削除に失敗しました。');
    }
  };

  // ★Roleバッジのスタイルを決定する関数
  const getRoleBadgeStyle = (role: string) => {
    const r = role ? role.toUpperCase() : 'USER';
    
    let backgroundColor = '#6c757d'; // デフォルト：グレー (USER)
    let color = '#fff';
    let boxShadow = 'none';

    switch (r) {
      case 'MASTER':
        backgroundColor = '#FFD700'; // 金
        color = '#000';              // MASTERは黒文字で見やすく
        boxShadow = '0 0 8px rgba(255, 215, 0, 0.4)';
        break;
      case 'SUPER_ADMIN':
        backgroundColor = '#FF4B2B'; // 赤
        break;
      case 'ADMIN':
        backgroundColor = '#3498db'; // 青
        break;
    }

    return {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: 'bold' as const,
      display: 'inline-block',
      textAlign: 'center' as const,
      minWidth: '100px',
      backgroundColor,
      color,
      boxShadow
    };
  };

  return (
    <div className="container-main">
      <h2 className="page-title">ユーザー管理</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #444', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>ユーザー名</th>
              <th style={{ padding: '12px' }}>権限 (Role)</th>
              <th style={{ padding: '12px' }}>所属企業</th>
              <th style={{ padding: '12px' }}>部署</th>
              <th style={{ padding: '12px' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '12px' }}>{user.id}</td>
                <td style={{ padding: '12px' }}>{user.username}</td>
                <td style={{ padding: '12px' }}>
                  {/* ★動的スタイルバッジ */}
                  <span style={getRoleBadgeStyle(user.role)}>
                    {user.role?.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  {user.company?.name || <span style={{ color: '#ff4d4d' }}>未所属</span>}
                </td>
                <td style={{ padding: '12px' }}>{user.department?.name || '-'}</td>
                <td style={{ padding: '12px' }}>
                  <button 
                    onClick={() => handleDelete(user.id, user.username)}
                    style={{
                      padding: '4px 12px',
                      backgroundColor: 'transparent',
                      color: '#ff4d4d',
                      border: '1px solid #ff4d4d',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;