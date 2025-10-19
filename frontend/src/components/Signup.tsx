import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Signup: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('パスワードが一致しません。');
      return;
    }

    try {
      await axios.post('/api/auth/signup', { username, password });
      
      // 登録成功したら、ログイン画面にメッセージ付きで移動
      navigate('/login', { 
        state: { message: '登録に成功しました。ログインしてください。' } 
      });

    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || '登録に失敗しました。');
      } else {
        setError('予期せぬエラーが発生しました。');
      }
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '500px' }}>
      <h2 className="text-center mb-4">新規登録</h2>
      {error && <div className="alert alert-danger">{error}</div>}
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
          <label htmlFor="confirmPassword">パスワード (確認):</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          /> {/* ★★★ ここにあった 'aS' を削除しました ★★★ */}
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          登録
        </button>
      </form>
      <div className="text-center mt-3">
        <p>
          既にアカウントをお持ちですか？ <Link to="/login">ログイン</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;