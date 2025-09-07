import { useAuth } from '../contexts/AuthContext';

function AdminDashboard() {
  const { auth, logout } = useAuth();
  return (
    <div className="container">
      <h1>ようこそ、{auth?.username}さん (管理者)</h1>
      <p>管理者専用のダッシュボードです。</p>
      <button onClick={logout} className="btn btn-danger">ログアウト</button>
    </div>
  );
}
export default AdminDashboard;