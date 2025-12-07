import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const isMaster = auth?.role === 'master';
  const [showPermissions, setShowPermissions] = useState(false);

  return (
    <div className="container-main">
      <div className="text-center mb-5">
        <h1 className="page-title">ようこそ、{auth?.username}さん</h1>
        <p className="page-subtitle">
          <span className={`role-badge ${isMaster ? 'master' : 'admin'} me-2`}>
            {isMaster ? 'マスター権限' : '管理者権限'}
          </span>
          でログイン中
        </p>
      </div>

      {/* ユーザー管理 */}
      <div className="card">
        <div className="card-header">👥 ユーザー管理</div>
        <div className="card-body">
          <div className="dashboard-grid">
            <div className="dashboard-tile" onClick={() => navigate('/register_staff')}>
              <span className="tile-icon">👤</span><span>スタッフ登録</span>
            </div>
            <div className="dashboard-tile" onClick={() => navigate('/users')}>
              <span className="tile-icon">📋</span><span>ユーザー一覧</span>
            </div>
            {isMaster && (
              <>
                <div className="dashboard-tile" onClick={() => navigate('/admin/bulk')}>
                  <span className="tile-icon">📥</span><span>一括登録</span>
                </div>
                <div className="dashboard-tile" onClick={() => navigate('/register_company')}>
                  <span className="tile-icon">🏢</span><span>企業・管理者</span>
                </div>
                <div className="dashboard-tile" onClick={() => navigate('/master/create_master')}>
                  <span className="tile-icon">🔑</span><span>マスター作成</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* クイズ管理 */}
      <div className="card">
        <div className="card-header">📚 クイズ・成績管理</div>
        <div className="card-body">
          <div className="dashboard-grid">
            <div className="dashboard-tile" onClick={() => navigate('/q_list')}>
              <span className="tile-icon">✏️</span><span>問題管理</span>
            </div>
            <div className="dashboard-tile" onClick={() => navigate('/view')}>
              <span className="tile-icon">📊</span><span>全ユーザー成績</span>
            </div>
            <div className="dashboard-tile" onClick={() => navigate('/admin/analysis')}>
              <span className="tile-icon">📈</span><span>学習傾向分析</span>
            </div>
          </div>
        </div>
      </div>

      {/* システム */}
      <div className="card">
        <div className="card-header">⚙️ システム・その他</div>
        <div className="card-body">
          <div className="dashboard-grid">
            <div className="dashboard-tile" onClick={() => setShowPermissions(true)}>
              <span className="tile-icon">🛡️</span><span>権限一覧</span>
            </div>
            <div className="dashboard-tile" onClick={() => navigate('/admin/logs')}>
              <span className="tile-icon">📜</span><span>ログ閲覧</span>
            </div>
            <div className="dashboard-tile" onClick={() => navigate('/dev/flow')}>
              <span className="tile-icon">🧩</span><span>動作フロー</span>
            </div>
            <div className="dashboard-tile" style={{borderColor:'var(--accent-error)', color:'var(--accent-error)'}} onClick={logout}>
              <span className="tile-icon">🚪</span><span>ログアウト</span>
            </div>
          </div>
        </div>
      </div>

      {/* モーダル */}
      {showPermissions && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>権限別 機能早見表</h3>
              <button className="btn-secondary btn-sm" onClick={() => setShowPermissions(false)}>×</button>
            </div>
            <div className="modal-body">
              <table className="table">
                <thead><tr><th>機能</th><th>マスター</th><th>Admin</th><th>一般</th></tr></thead>
                <tbody>
                  <tr><td>ユーザー作成</td><td>⭕️</td><td>🔺自社のみ</td><td>❌</td></tr>
                  <tr><td>一括登録</td><td>⭕️</td><td>🔺ユーザーのみ</td><td>❌</td></tr>
                  <tr><td>企業管理</td><td>⭕️</td><td>❌</td><td>❌</td></tr>
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPermissions(false)}>閉じる</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;