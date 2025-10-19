import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
// ★★★ 1. `Link` を react-router-dom からインポートします ★★★
import { useNavigate, Link } from 'react-router-dom';

// 認証データの型
interface AuthData {
  token: string;
  username: string;
  role: string;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ★★★ 2. ログインに成功したらダッシュボードに飛ばすようにします ★★★
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      const response = await axios.post<AuthData>('/api/auth/login', {
        username,
        password,
      });
      login(response.data); // Contextに認証情報をセット
      
      // ログイン成功後、強制的にダッシュボードへ移動
      // (App.tsxのリダイレクトがうまく機能しない場合のため)
      navigate('/dashboard'); 

    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'ログインに失敗しました。');
      } else {
        setError('予期せぬエラーが発生しました。');
      }
    }
  };

  return (
    <div className="container" style={{ maxWidth: '500px' }}>
      <h2 className="text-center mb-4">ログイン</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      
      {/* ★★★ 3. 登録成功時のメッセージを表示するロジック (おまけ) ★★★ */}
      {/* (この機能は現在 `Maps` の state を使っていないのでコメントアウト)
        {location.state?.message && (
          <div className="alert alert-success">{location.state.message}</div>
        )} 
      */}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">ユーザー名:</label>
          <input type="text" className="form-control" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">パスワード:</label>
          <input type="password" className="form-control" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary btn-block">
          ログイン
        </button>
      </form>
      
      {/* ★★★ 4. 新規登録画面へのリンクをここに追加します ★★★ */}
      <div className="text-center mt-3">
        <p>
          アカウントをお持ちではありませんか？ <Link to="/signup">新規登録</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;