import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import UserList from './components/UserList';
import RegisterCompany from './components/RegisterCompany'; 
import QuestionManager from './components/QuestionManager'; 
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

// ★追加: 新しい成績管理画面をインポート
import LearningView from './components/LearningView'; 
import Navbar from './components/Navbar';

import { useAuth } from './contexts/AuthContext';
import './App.css';

function App() {
  const { auth } = useAuth();

  // 権限を大文字に統一して判定
  const role = auth?.role ? String(auth.role).toUpperCase() : '';
  
  // 管理者権限を持つロール（MASTER, SUPER_ADMIN, ADMIN）
  const isAdminOrMaster = ['MASTER', 'SUPER_ADMIN', 'ADMIN'].includes(role);
  
  // マスターのみの権限
  const isMaster = role === 'MASTER';
  
  return (
    <>
      <Navbar />

      {/* 修正箇所: style={{ width: '80%'... }} を削除。
        CSSで定義した .container-main を使用することで、
        最大幅 1200px での「左右中央寄せ」が自動適用されます。
      */}
      <main className="container-main">
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
          
          {/* Master権限判定 */}
          <Route path="/register_company" element={isMaster ? <RegisterCompany /> : <Navigate to="/login" />} />
          
          <Route path="/q_list" element={isAdminOrMaster ? <QuestionManager /> : <Navigate to="/login" />} />
          
          {/* ★修正: 旧 TestResults から LearningView に差し替え */}
          <Route path="/view" element={isAdminOrMaster ? <LearningView /> : <Navigate to="/login" />} />
          
          <Route path="/register_staff" element={isAdminOrMaster ? <RegisterStaff /> : <Navigate to="/login" />} />
          <Route path="/create_question" element={isAdminOrMaster ? <CreateQuestion /> : <Navigate to="/login" />} />
          <Route path="/admin/logs" element={isAdminOrMaster ? <LogViewer /> : <Navigate to="/login" />} />
          <Route path="/dev/flow" element={isAdminOrMaster ? <DeveloperFlow /> : <Navigate to="/login" />} />
          <Route path="/admin/analysis" element={isAdminOrMaster ? <LearnerAnalysis /> : <Navigate to="/login" />} />
          <Route path="/admin/bulk" element={isAdminOrMaster ? <BulkRegister /> : <Navigate to="/login" />} />

          {/* --- デフォルトルート --- */}
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
      </main>
    </>
  );
}

export default App;