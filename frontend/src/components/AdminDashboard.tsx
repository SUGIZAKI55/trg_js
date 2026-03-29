import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  // ★判定を強化：大文字小文字に関わらず 'master' なら true にする
  const userRole = auth?.role ? String(auth.role).toUpperCase() : '';
  const isMaster = userRole === 'MASTER';

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

      {/* ★ MASTER専用セクション（判定をisMasterに変更） */}
      {isMaster && (
        <div className="card" style={{ borderColor: '#e67e22', borderLeftWidth: '5px', marginBottom: '2rem' }}>
          <div className="card-header" style={{ color: '#e67e22', fontWeight: 'bold', borderBottom: '1px solid #444' }}>
            🏢 システム管理 (MASTER専用)
          </div>
          <div className="card-body">
            <div className="dashboard-grid">
              <div className="dashboard-tile" 
                   style={{ border: '2px solid #e67e22' }}
                   onClick={() => navigate('/register_company')}>
                <span className="tile-icon">🏢</span><span>企業・管理者登録</span>
              </div>
              <div className="dashboard-tile" onClick={() => navigate('/master/create_master')}>
                <span className="tile-icon">🔑</span><span>マスター作成</span>
              </div>
              <div className="dashboard-tile" onClick={() => navigate('/admin/bulk')}>
                <span className="tile-icon">📥</span><span>データ一括登録</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
          </div>
        </div>
      </div>

      {/* クイズ・成績管理 */}
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

      {/* システム・その他 */}
      <div className="card">
        <div className="card-header">⚙️ システム・その他</div>
        <div className="card-body">
          <div className="dashboard-grid">
            <div className="dashboard-tile" onClick={() => navigate('/admin/roles')}>
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

      {/* モーダル等は省略（既存のものを維持してください） */}
    </div>
  );
};

export default AdminDashboard;