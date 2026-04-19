import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
  requiresMaster?: boolean;
  exact?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const Sidebar: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = auth?.role ? String(auth.role).toUpperCase() : '';
  const isMaster = userRole === 'MASTER';

  const menuSections: MenuSection[] = [
    {
      title: '',
      items: [
        { label: 'ダッシュボード', path: '/admin', icon: '📊', exact: true },
      ],
    },
    {
      title: '📋 管理者メニュー',
      items: [
        { label: 'ユーザー一覧', path: '/users', icon: '👥' },
        { label: 'スタッフ登録', path: '/register_staff', icon: '👤' },
        { label: '企業登録', path: '/register_company', icon: '🏢', requiresMaster: true },
      ],
    },
    {
      title: '📝 問題・成績管理',
      items: [
        { label: '問題一覧', path: '/q_list', icon: '✏️' },
        { label: '問題作成', path: '/create_question', icon: '➕' },
        { label: '全ユーザー成績', path: '/view', icon: '📊' },
        { label: '学習傾向分析', path: '/admin/analysis', icon: '📈' },
        { label: 'データ一括登録', path: '/admin/bulk', icon: '📥', requiresMaster: true },
      ],
    },
    {
      title: '⚙️ システム設定',
      items: [
        { label: '権限一覧', path: '/admin/roles', icon: '🛡️' },
        { label: 'ログ閲覧', path: '/admin/logs', icon: '📜' },
        { label: '動作フロー', path: '/dev/flow', icon: '🧩' },
      ],
    },
  ];

  const isActive = (path: string, exact: boolean = false): boolean => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3 style={{ margin: 0, fontSize: '1.2rem', background: 'var(--gemini-grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}>
          Admin
        </h3>
      </div>

      <nav className="sidebar-nav">
        {menuSections.map((section, sectionIdx) => (
          <div key={sectionIdx}>
            {section.title && <div className="sidebar-nav-section">{section.title}</div>}
            {section.items.map((item) => {
              // 権限チェック：MASTER専用アイテムは MASTER のみに表示
              if (item.requiresMaster && !isMaster) {
                return null;
              }

              const active = isActive(item.path, item.exact);

              return (
                <div
                  key={item.path}
                  className={`sidebar-nav-item ${active ? 'active' : ''}`}
                  onClick={() => handleNavigate(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}

        {/* ログアウトボタン */}
        <div className="sidebar-nav-section" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}></div>
        <div
          className="sidebar-nav-item logout-btn"
          onClick={handleLogout}
        >
          <span className="nav-icon">🚪</span>
          <span className="nav-label">ログアウト</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <small style={{ color: 'var(--text-muted)' }}>
          ログイン中: {auth?.username}
        </small>
        <br />
        <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          {isMaster ? 'マスター権限' : '管理者権限'}
        </small>
      </div>
    </div>
  );
};

export default Sidebar;
