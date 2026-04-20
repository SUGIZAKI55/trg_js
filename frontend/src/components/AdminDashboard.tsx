import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminDashboard: React.FC = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();

  // ★判定を強化：大文字小文字に関わらず 'master' なら true にする
  const userRole = auth?.role ? String(auth.role).toUpperCase() : '';
  const isMaster = userRole === 'MASTER';

  // サイドバーの状態管理
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // 統計情報の状態管理
  const [dashboardStats, setDashboardStats] = React.useState({
    totalUsers: 0,
    activeUsers: 0,
    completionRate: 0,
    averageScore: 0,
    atRiskUsers: 0
  });
  const [statsLoading, setStatsLoading] = React.useState(true);

  // 統計データ取得
  React.useEffect(() => {
    const fetchStats = async () => {
      if (!auth?.token) {
        setStatsLoading(false);
        return;
      }
      try {
        const res = await fetch('http://localhost:3000/api/users/dashboard_data', {
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardStats(data);
        }
      } catch (err) {
        console.error('統計情報の取得に失敗:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    if (auth?.token) {
      fetchStats();
    }
  }, [auth?.token]);

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuNavigate = () => {
    setSidebarOpen(false);  // メニュー選択時にサイドバーを閉じる
  };

  return (
    <div className="admin-layout">
      {/* ハンバーガーアイコン（モバイルのみ表示） */}
      <div className="hamburger-icon" onClick={handleToggleSidebar}>
        ☰
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onNavigate={handleMenuNavigate}
      />
      <div className="admin-main-content">
        <div className="container-main">
          {/* 統計情報カード */}
          {!statsLoading && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-label">総ユーザー数</div>
                <div className="stat-value">{dashboardStats.totalUsers}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-label">今月アクティブ</div>
                <div className="stat-value">{dashboardStats.activeUsers}</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-label">学習完了率</div>
                <div className="stat-value">{dashboardStats.completionRate}<span className="stat-unit">%</span></div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-label">平均スコア</div>
                <div className="stat-value">{dashboardStats.averageScore}<span className="stat-unit">%</span></div>
              </div>
            </div>
          )}

          {statsLoading && (
            <div style={{ textAlign: 'center', marginBottom: '2rem', color: '#a8c7fa' }}>
              読み込み中...
            </div>
          )}

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
              </div>
            </div>
          </div>

          {/* モーダル等は省略（既存のものを維持してください） */}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;