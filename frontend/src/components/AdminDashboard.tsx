import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  // 権限を分かりやすく判定するための変数
  // ★★★ 不要だった isAdmin の行をここから削除しました ★★★
  const isMaster = auth?.role === 'master';

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <div className="text-center mb-5">
        <h1>ようこそ、{auth?.username}さん</h1>
        <p className="text-danger h5">({isMaster ? 'マスター' : '管理者'}モード)</p>
        <p className="text-muted">管理者専用のダッシュボードです。</p>
      </div>

      {/* ====== ユーザー管理セクション ====== */}
      <section className="mb-5">
        <h2><i className="bi bi-people-fill"></i> ユーザー管理</h2>
        <hr />
        <div className="dashboard-button-grid">
          {/* 管理者・マスター共通 */}
          <button className="btn btn-primary dashboard-button" onClick={() => navigate('/register_staff')}>
            スタッフ新規登録
          </button>
          <button className="btn btn-secondary dashboard-button" onClick={() => navigate('/users')}>
            ユーザー一覧
          </button>
        </div>
      </section>

      {/* ====== クイズ・成績管理セクション ====== */}
      <section className="mb-5">
        <h2><i className="bi bi-card-checklist"></i> クイズ・成績管理</h2>
        <hr />
        <div className="dashboard-button-grid">
          {/* 管理者・マスター共通 */}
          <button className="btn btn-info dashboard-button" onClick={() => navigate('/q_list')}>
            問題管理
          </button>
          <button className="btn btn-dark dashboard-button" onClick={() => navigate('/view')}>
            全ユーザーのテスト結果
          </button>
        </div>
      </section>

      {/* ====== マスター専用セクション ====== */}
      {isMaster && (
        <section className="mb-5">
          <h2 className="text-success"><i className="bi bi-building"></i> マスター専用管理</h2>
          <hr />
          <div className="dashboard-button-grid">
            <button className="btn btn-success dashboard-button" onClick={() => navigate('/register_company')}>
              企業・管理者登録
            </button>
            <button className="btn btn-outline-success dashboard-button" onClick={() => navigate('/master/create_master')}>
              新規マスター作成
            </button>
          </div>
        </section>
      )}

      {/* ====== その他 ====== */}
      <section className="mt-5 text-center">
        <div className="d-flex justify-content-center flex-wrap" style={{ gap: '15px' }}>
            <button className="btn btn-warning" style={{minWidth: '200px'}} onClick={() => navigate('/dashboard')}>
              一般画面に戻る
            </button>
            <button className="btn btn-danger" style={{minWidth: '200px'}} onClick={logout}>
              ログアウト
            </button>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;