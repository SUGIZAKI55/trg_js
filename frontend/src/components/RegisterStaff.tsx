import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RegisterStaff: React.FC = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff'); // デフォルトは'staff'
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 権限をチェック
  const isMaster = auth?.role === 'master';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!auth?.token) {
      setError('認証エラー。再度ログインしてください。');
      return;
    }

    try {
      // 管理者用の作成APIを呼び出す
      await axios.post(
        '/api/admin/create_user',
        { username, password, role }, // role も一緒に送信
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      
      setSuccess(`ユーザー「${username}」を「${role}」として登録しました。`);
      // 成功したらフォームをリセット
      setUsername('');
      setPassword('');
      setRole('staff');

    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || '登録に失敗しました。');
      } else {
        setError('予期せぬエラーが発生しました。');
      }
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="text-center mb-4">スタッフ新規登録</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">ユーザー名:</label>
          <input
            type="text"
            className="form-control"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">パスワード:</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="role">権限:</label>
          <select
            id="role"
            className="form-control"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="staff">スタッフ (一般)</option>
            <option value="admin">管理者</option>
            {/* マスターのみがマスターを作成できる */}
            {isMaster && <option value="master">マスター</option>}
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          この内容で登録
        </button>
      </form>
      <div className="text-center mt-3">
        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
          管理ダッシュボードに戻る
        </button>
      </div>
    </div>
  );
};

export default RegisterStaff;