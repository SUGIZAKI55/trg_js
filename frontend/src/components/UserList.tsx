import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  role: string;
  company_name?: string;
}

const UserList: React.FC = () => {
  const { auth } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!auth?.token) {
        setError('認証トークンがありません。');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/users', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'ユーザー一覧の取得に失敗しました。');
        }

        const data: User[] = await response.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
        console.error('ユーザー一覧取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [auth]);

  if (loading) {
    return <div>読み込み中...</div>;
  }

  if (error) {
    return <div className="error-message">エラー: {error}</div>;
  }

  return (
    <div className="container">
      <h1 className="text-center mb-4">ユーザー一覧</h1>
      {users.length > 0 ? (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th>
              <th>ユーザー名</th>
              <th>役割</th>
              <th>所属企業</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>{user.company_name || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-center">ユーザーが見つかりませんでした。</p>
      )}
      <div className="text-center mt-3">
        <Link to="/admin" className="btn btn-secondary">管理画面に戻る</Link>
      </div>
    </div>
  );
};

export default UserList;