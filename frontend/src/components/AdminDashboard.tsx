import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  // ユーザーの役割に応じてボタンを表示
  const renderButtons = () => {
    if (!auth) return null;

    return (
      <div className="dashboard-button-grid">
        {/* マスター権限のボタン */}
        {auth.role === 'master' && (
          <button
            className="btn btn-success dashboard-button"
            onClick={() => navigate('/register_company')}
          >
            企業・管理者登録
          </button>
        )}

        {/* 管理者権限のボタン */}
        {auth.role === 'admin' && (
          <button
            className="btn btn-primary dashboard-button"
            onClick={() => navigate('/create_user')}
          >
            受講者登録
          </button>
        )}

        {/* 共通のボタン */}
        <button
          className="btn btn-secondary dashboard-button"
          onClick={() => navigate('/users')}
        >
          ユーザー一覧
        </button>

        {/* マスター権限のボタン */}
        {auth.role === 'master' && (
          <button
            className="btn btn-info dashboard-button"
            onClick={() => navigate('/q_list')}
          >
            問題管理
          </button>
        )}

        {/* 管理者権限のボタン */}
        {auth.role === 'admin' && (
          <button
            className="btn btn-secondary dashboard-button"
            onClick={() => navigate('/view')}
          >
            テスト結果
          </button>
        )}

        <button
          className="btn btn-danger dashboard-button"
          onClick={() => logout()}
        >
          ログアウト
        </button>
      </div>
    );
  };

  return (
    <div className="container">
      <h1 className="text-center">ようこそ、{auth?.username}さん (管理者)</h1>
      <p className="text-center text-muted">管理者専用のダッシュボードです。</p>
      <div className="tab">
        {renderButtons()}
      </div>
    </div>
  );
};

export default AdminDashboard;