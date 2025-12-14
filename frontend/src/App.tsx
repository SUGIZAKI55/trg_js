import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import UserList from './components/UserList';
import RegisterCompany from './components/RegisterCompany'; 
import QuestionManager from './components/QuestionManager'; 
import TestResults from './components/TestResults'; 
import GenreSelect from './components/GenreSelect';
import QuizQuestion from './components/QuizQuestion';
import QuizResults from './components/QuizResults';
import RegisterStaff from './components/RegisterStaff';
import CreateQuestion from './components/CreateQuestion';
import LogViewer from './components/LogViewer'; 
import MyResults from './components/MyResults'; 
import DeveloperFlow from './components/DeveloperFlow'; 
import MyAnalysis from './components/MyAnalysis';
import LearnerAnalysis from './components/LearnerAnalysis';
import BulkRegister from './components/BulkRegister'; 

import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { auth } = useAuth();

  // ★修正: 権限を大文字に統一して判定する（NestJS対応）
  const role = auth?.role ? String(auth.role).toUpperCase() : '';
  
  // 管理者権限を持つロール（MASTER, SUPER_ADMIN, ADMIN）
  const isAdminOrMaster = ['MASTER', 'SUPER_ADMIN', 'ADMIN'].includes(role);
  
  // マスターのみの権限
  const isMaster = role === 'MASTER';
  
  return (
    <div style={{ width: '80%', margin: '0 auto', paddingTop: '2rem' }}>
      <Routes>
        {/* --- ログイン・新規登録ルート --- */}
        <Route path="/login" element={auth ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={auth ? <Navigate to="/" /> : <Signup />} />
        
        {/* --- 認証が必要なルート --- */}
        <Route path="/dashboard" element={auth ? <UserDashboard /> : <Navigate to="/login" />} />
        <Route path="/my_results" element={auth ? <MyResults /> : <Navigate to="/login" />} />
        <Route path="/my_analysis" element={auth ? <MyAnalysis /> : <Navigate to="/login" />} />
        
        {/* --- クイズ機能のルート --- */}
        <Route path="/genre" element={auth ? <GenreSelect /> : <Navigate to="/login" />} />
        <Route path="/question" element={auth ? <QuizQuestion /> : <Navigate to="/login" />} />
        <Route path="/kekka" element={auth ? <QuizResults /> : <Navigate to="/login" />} />
        
        {/* --- 管理者用のルート --- */}
        <Route path="/admin" element={isAdminOrMaster ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/users" element={isAdminOrMaster ? <UserList /> : <Navigate to="/login" />} />
        
        {/* ★修正: Master権限判定を新しい変数(isMaster)に変更 */}
        <Route path="/register_company" element={isMaster ? <RegisterCompany /> : <Navigate to="/login" />} />
        
        <Route path="/q_list" element={isAdminOrMaster ? <QuestionManager /> : <Navigate to="/login" />} />
        <Route path="/view" element={isAdminOrMaster ? <TestResults /> : <Navigate to="/login" />} />
        <Route path="/register_staff" element={isAdminOrMaster ? <RegisterStaff /> : <Navigate to="/login" />} />
        <Route path="/create_question" element={isAdminOrMaster ? <CreateQuestion /> : <Navigate to="/login" />} />
        <Route path="/admin/logs" element={isAdminOrMaster ? <LogViewer /> : <Navigate to="/login" />} />
        <Route path="/dev/flow" element={isAdminOrMaster ? <DeveloperFlow /> : <Navigate to="/login" />} />
        <Route path="/admin/analysis" element={isAdminOrMaster ? <LearnerAnalysis /> : <Navigate to="/login" />} />
        <Route path="/admin/bulk" element={isAdminOrMaster ? <BulkRegister /> : <Navigate to="/login" />} />

        {/* --- デフォルトルート --- */}
        {/* ここで管理者なら /admin へ、一般なら /dashboard へ振り分け */}
        <Route
          path="*"
          element={
            auth ? (
              isAdminOrMaster ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;