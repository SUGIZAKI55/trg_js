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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // ★修正: バックエンドのURLをフルパスで指定
        const res = await axios.get('http://localhost:3000/api/users', {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error(err);
        setError('データの取得に失敗しました。バックエンドが起動しているか確認してください。');
      }
    };

    if (auth?.token) {
      fetchUsers();
    }
  }, [auth]);

  return (
    <div className="container-main">
      <h2 className="page-title">ユーザー管理</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card">
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #444', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>ID</th>
              <th style={{ padding: '10px' }}>ユーザー名</th>
              <th style={{ padding: '10px' }}>権限 (Role)</th>
              <th style={{ padding: '10px' }}>所属企業</th>
              <th style={{ padding: '10px' }}>部署</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '10px' }}>{user.id}</td>
                <td style={{ padding: '10px' }}>{user.username}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: user.role === 'MASTER' ? '#8ab4f8' : '#444',
                    color: user.role === 'MASTER' ? '#000' : '#fff',
                    fontSize: '0.85rem'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '10px' }}>{user.company?.name || '-'}</td>
                <td style={{ padding: '10px' }}>{user.department?.name || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;