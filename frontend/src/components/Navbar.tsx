import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ログインしていない時や、ログイン画面では表示しない
  if (!auth?.token || location.pathname === '/login') {
    return null;
  }

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      backgroundColor: '#242424',
      borderBottom: '1px solid #444',
      marginBottom: '20px'
    }}>
      {/* 左側：ナビゲーションボタン */}
      <div style={{ display: 'flex', gap: '15px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            cursor: 'pointer', padding: '6px 12px', fontSize: '0.9rem',
            backgroundColor: '#444', color: '#fff', border: 'none', borderRadius: '4px' 
          }}
        >
          ← 戻る
        </button>

        <button 
          onClick={() => navigate('/')} 
          style={{ 
            cursor: 'pointer', padding: '6px 12px', fontSize: '0.9rem',
            backgroundColor: '#646cff', color: '#fff', border: 'none', borderRadius: '4px' 
          }}
        >
          🏠 ホーム
        </button>
      </div>

      {/* 中央：アプリ名 */}
      <div style={{ fontWeight: 'bold', color: '#aaa' }}>
        SUGIZAKI APP
      </div>

      {/* 右側：ユーザー情報とログアウト */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        
        {/* ★追加: 企業名の表示 (これがないと表示されません) */}
        {auth.company?.name && (
          <span style={{ 
            fontSize: '0.9rem', fontWeight: 'bold', 
            backgroundColor: '#1a1a1a', padding: '4px 10px', borderRadius: '4px',
            border: '1px solid #444', color: '#ddd'
          }}>
            🏢 {auth.company.name}
          </span>
        )}

        {/* ユーザー名とロールを見やすく表示 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', lineHeight: '1.2' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
            👤 {auth.username}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#888' }}>
            ({auth.role})
          </span>
        </div>

        <button 
          onClick={logout}
          style={{ 
            cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem',
            backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '4px',
            marginLeft: '10px'
          }}
        >
          ログアウト
        </button>
      </div>
    </nav>
  );
};

export default Navbar;