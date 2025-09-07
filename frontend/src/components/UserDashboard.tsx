import { useAuth } from '../contexts/AuthContext';

function UserDashboard() {
  const { auth, logout } = useAuth();
  return (
    <div className="container">
      <h1>ようこそ、{auth?.username}さん</h1>
      <p>ユーザー専用のダッシュボードです。</p>
      <button onClick={logout} className="btn btn-danger">ログアウト</button>
    </div>
  );
}
export default UserDashboard;