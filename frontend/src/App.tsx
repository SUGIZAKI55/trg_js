import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { auth } = useAuth(); // ログイン状態を取得

  return (
    <Routes>
      {/* URLが "/login" の場合 */}
      <Route
        path="/login"
        // ログイン済ならトップページへ、そうでなければログイン画面を表示
        element={auth ? <Navigate to="/" /> : <Login />}
      />
      {/* URLが "/dashboard" の場合 */}
      <Route
        path="/dashboard"
        // ログイン済ならユーザー用ダッシュボードを、そうでなければログイン画面へ
        element={auth ? <UserDashboard /> : <Navigate to="/login" />}
      />
      {/* URLが "/admin" の場合 */}
      <Route
        path="/admin"
        // 管理者としてログイン済なら管理者用ダッシュボードを、そうでなければログイン画面へ
        element={auth && (auth.role === 'admin' || auth.role === 'master') ? <AdminDashboard /> : <Navigate to="/login" />}
      />
      {/* 上記以外の全てのURLの場合 */}
      <Route
        path="*"
        // ログイン状態と役割に応じて、適切なページに自動で振り分ける
        element={
          auth ? (
            auth.role === 'admin' || auth.role === 'master' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;