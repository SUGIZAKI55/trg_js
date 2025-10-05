import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import UserList from './components/UserList';
import RegisterCompany from './components/RegisterCompany'; 
// ★★★ 追加するインポート ★★★
import QuestionManager from './components/QuestionManager'; 
import TestResults from './components/TestResults'; 

import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { auth } = useAuth();

  // 認証済みかつ管理者/マスター権限が必要なルートの権限チェックヘルパー
  const isAdminOrMaster = auth && (auth.role === 'admin' || auth.role === 'master');
  
  return (
    <Routes>
      <Route
        path="/login"
        element={auth ? <Navigate to="/" /> : <Login />}
      />
      <Route
        path="/dashboard"
        element={auth ? <UserDashboard /> : <Navigate to="/login" />}
      />
      
      {/* 管理画面のルート */}
      <Route
        path="/admin"
        element={isAdminOrMaster ? <AdminDashboard /> : <Navigate to="/login" />}
      />
      
      {/* ユーザー一覧 (管理者/マスター) */}
      <Route
        path="/users"
        element={isAdminOrMaster ? <UserList /> : <Navigate to="/login" />}
      />
      
      {/* 企業・管理者登録 (マスターのみ) */}
      <Route
        path="/register_company"
        element={auth && auth.role === 'master' ? <RegisterCompany /> : <Navigate to="/login" />}
      />
      
      {/* ★★★ 問題管理 (管理者/マスター) - /q_list に対応 ★★★ */}
      <Route
        path="/q_list"
        element={isAdminOrMaster ? <QuestionManager /> : <Navigate to="/login" />}
      />

      {/* ★★★ テスト結果 (管理者/マスター) - /view に対応 ★★★ */}
      <Route
        path="/view"
        element={isAdminOrMaster ? <TestResults /> : <Navigate to="/login" />}
      />

      {/* デフォルトルート（*）の処理 */}
      <Route
        path="*"
        element={
          auth ? (
            // ログイン済みの場合、権限に応じてダッシュボードにリダイレクト
            isAdminOrMaster ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
          ) : (
            // 未ログインの場合、ログイン画面へ
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;