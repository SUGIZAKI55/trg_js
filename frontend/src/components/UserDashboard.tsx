import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserDashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  // ユーザーが管理者権限を持っているか確認
  const isAdminOrMaster = auth && (auth.role === 'admin' || auth.role === 'master');

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="text-center mb-5">
        <h1>ようこそ、{auth?.username}さん</h1>
        <p className="text-muted">操作を選択してください。</p>
      </div>

      {/* 機能ボタンをグリッドレイアウトで表示 */}
      <div className="dashboard-button-grid">
        {/* --- メイン機能 --- */}
        <button
          className="btn btn-primary dashboard-button"
          onClick={() => navigate('/genre')}
        >
          簿記クイズを開始
        </button>

        <button
          className="btn btn-info dashboard-button"
          onClick={() => navigate('/my_results')}
        >
          自分の成績を見る
        </button>

        {/* --- 管理者用の特別なボタン --- */}
        {isAdminOrMaster && (
          <button
            className="btn btn-secondary dashboard-button"
            onClick={() => navigate('/admin')}
          >
            管理画面へ
          </button>
        )}

        {/* --- ログアウト --- */}
        <button
          className="btn btn-danger dashboard-button"
          onClick={logout}
        >
          ログアウト
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;