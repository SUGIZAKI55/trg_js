import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // AuthContextからlogin関数を取得
  const { login } = useAuth();
  
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // API Service経由でログイン
      const res = await authApi.login(username, password);
      
      // ★デバッグ用: 取得したデータをコンソールに表示
      console.log("ログイン成功:", res.data);
      console.log("Role:", res.data.role);

      // 2. 認証状態を保存
      // Contextのlogin関数には、レスポンスデータ丸ごと(res.data)を渡す
      login(res.data);

      // 3. 権限チェック（大文字・小文字を無視して判定）
      const role = res.data.role ? String(res.data.role).toUpperCase() : '';
      const adminRoles = ['MASTER', 'SUPER_ADMIN', 'ADMIN'];

      if (adminRoles.includes(role)) {
        console.log("管理者画面(/admin)へ移動");
        navigate('/admin');
      } else {
        console.log("ユーザー画面(/dashboard)へ移動");
        navigate('/dashboard');
      }

    } catch (err) {
      console.error("ログインエラー:", err);
      // エラーの詳細をコンソールに出して確認しやすくします
      if (axios.isAxiosError(err) && err.response) {
         console.error("ステータスコード:", err.response.status);
      }
      setError('ログインに失敗しました。ユーザー名/パスワードを確認してください。');
    }
  };

  return (
    <div className="container-narrow">
      <div className="text-center mb-5">
        <h1 className="page-title">Sugi-Tech Quiz</h1>
        <p className="page-subtitle">社員研修プラットフォームへようこそ</p>
      </div>

      <div className="card">
        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">ユーザー名</label>
              <input 
                className="form-control" 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="ユーザー名を入力"
              />
            </div>
            <div className="form-group">
              <label className="form-label">パスワード</label>
              <input 
                className="form-control" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="パスワードを入力"
              />
            </div>
            <button className="btn btn-primary w-100 mb-3" type="submit">ログイン</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;