import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const isMaster = auth?.role === 'master';
  
  // ボタンのスタイル
  const buttonStyle = {
    width: '180px',
    margin: '8px',
  };

  return (
    // 中央80%レイアウト
    <div style={{ width: '80%', margin: '0 auto', paddingTop: '2rem' }}>
      <div className="text-center mb-5">
        <h1>ようこそ、{auth?.username}さん</h1>
        <p className="h5 mb-3" style={{ color: '#004D99' }}>({isMaster ? 'マスター' : '管理者'}モード)</p>
        <p className="text-muted">管理者専用のダッシュボードです。</p>
      </div>

      {/* ====== ユーザー管理セクション ====== */}
      <section className="mb-5">
        <h2>ユーザー管理</h2>
        <hr />
        <div className="d-flex justify-content-center flex-wrap">
          {/* 基本ボタン */}
          <button className="btn btn-primary btn-sm" style={buttonStyle} onClick={() => navigate('/register_staff')}>
            スタッフ新規登録
          </button>
          <button className="btn btn-secondary btn-sm" style={buttonStyle} onClick={() => navigate('/users')}>
            ユーザー一覧
          </button>
          
          {/* マスター専用ボタン */}
          {isMaster && (
            <>
              <button className="btn btn-info btn-sm" style={buttonStyle} onClick={() => navigate('/admin/bulk')}>
                📥 一括登録
              </button>
              <button className="btn btn-success btn-sm" style={buttonStyle} onClick={() => navigate('/register_company')}>
                企業・管理者登録
              </button>
              <button className="btn btn-outline-primary btn-sm" style={buttonStyle} onClick={() => navigate('/master/create_master')}>
                新規マスター作成
              </button>
            </>
          )}
        </div>
      </section>

      {/* ====== クイズ・成績管理セクション ====== */}
      <section className="mb-5">
        <h2>クイズ・成績管理</h2>
        <hr />
        <div className="d-flex justify-content-center flex-wrap">
          <button className="btn btn-info btn-sm" style={buttonStyle} onClick={() => navigate('/q_list')}>
            問題管理
          </button>
          <button className="btn btn-dark btn-sm" style={buttonStyle} onClick={() => navigate('/view')}>
            全ユーザーのテスト結果
          </button>
        </div>
      </section>

      {/* ====== その他 ====== */}
      <section className="mt-5 text-center">
        <h2>システム・その他</h2>
        <hr />
        <div className="d-flex justify-content-center flex-wrap">
            <button className="btn btn-warning btn-sm" style={buttonStyle} onClick={() => navigate('/admin/logs')}>
              サーバーログ閲覧
            </button>
            <button className="btn btn-info btn-sm" style={buttonStyle} onClick={() => navigate('/dev/flow')}>
              動作フロー確認
            </button>
            <button className="btn btn-danger btn-sm" style={buttonStyle} onClick={logout}>
              ログアウト
            </button>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;