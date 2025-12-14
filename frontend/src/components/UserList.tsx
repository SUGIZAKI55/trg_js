import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ユーザーデータの型定義（NestJSから返ってくるデータに合わせる）
interface Company {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  role: string;
  company: Company | null;
  department: Department | null;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // NestJSのAPIを叩く
      const res = await axios.get('http://localhost:3000/api/users');
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error('ユーザー取得エラー:', err);
      setError('データの取得に失敗しました。バックエンドが起動しているか確認してください。');
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">読み込み中...</div>;
  if (error) return <div className="alert alert-danger text-center mt-5">{error}</div>;

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>ユーザー一覧</h2>
        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
          管理画面に戻る
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="thead-light">
              <tr>
                <th>ID</th>
                <th>ユーザー名</th>
                <th>権限</th>
                <th>所属会社</th>
                <th>部署</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td className="fw-bold">{user.username}</td>
                  <td>
                    <span className={`badge ${user.role === 'MASTER' ? 'bg-danger' : 'bg-primary'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.company ? user.company.name : '-'}</td>
                  <td>{user.department ? user.department.name : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;