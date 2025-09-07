import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // これをインポート

// ログイン成功時に受け取るデータの型
interface AuthData {
  token: string;
  username: string;
  role: string;
}

// 親から渡されていた onLoginSuccess は不要になったので削除
function Login() {
  const { login } = useAuth(); // Contextからlogin関数を取得
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      const response = await axios.post<AuthData>('/api/auth/login', {
        username,
        password,
      });
      // Contextが持つ中央のlogin関数を呼び出す
      login(response.data);

    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || 'ログインに失敗しました。');
      } else {
        setError('予期せぬエラーが発生しました。');
      }
    }
  };

  return (
    // 見た目(JSX)の部分は変更ありません
    <div className="container" style={{ maxWidth: '500px' }}>
      <h2 className="text-center mb-4">ログイン</h2>
      {error && <div className="alert alert-danger">{error}</div>}
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
    </div>
  );
}

export default Login;