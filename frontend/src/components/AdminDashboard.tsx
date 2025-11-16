import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const isMaster = auth?.role === 'master';
  
  // ★ 1. 統一したいボタンスタイルを定義
  const buttonStyle = {
    width: '180px',
    margin: '8px', // ボタン同士の隙間
  };

  return (
    <div>
      <div className="text-center mb-5">
        <h1>ようこそ、{auth?.username}さん</h1>
        <p className="text-danger h5">({isMaster ? 'マスター' : '管理者'}モード)</p>
        <p className="text-muted">管理者専用のダッシュボードです。</p>
      </div>

      {/* ====== ユーザー管理セクション ====== */}
      <section className="mb-5">
        <h2> ユーザー管理</h2>
        <hr />
        {/* ★ 2. .dashboard-button-grid を解除し、中央寄せの d-flex に変更 */}
        <div className="d-flex justify-content-center flex-wrap">
          {/* ↓ 管理者・マスター共通 ↓ */}
          {/* ★ 3. クラスとスタイルを統一 ★ */}
          <button className="btn btn-primary btn-sm" style={buttonStyle} onClick={() => navigate('/register_staff')}>
            スタッフ新規登録
          </button>
          <button className="btn btn-secondary btn-sm" style={buttonStyle} onClick={() => navigate('/users')}>
            ユーザー一覧
          </button>
          
          {/* ↓ マスター専用ボタンを、このセクションに統合 ↓ */}
          {isMaster && (
            <>
              <button className="btn btn-success btn-sm" style={buttonStyle} onClick={() => navigate('/register_company')}>
                企業・管理者登録
              </button>
              <button className="btn btn-outline-success btn-sm" style={buttonStyle} onClick={() => navigate('/master/create_master')}>
                新規マスター作成
              </button>
            </>
          )}
        </div>
      </section>

      {/* ====== クイズ・成績管理セクション ====== */}
      <section className="mb-5">
        <h2> クイズ・成績管理</h2>
        <hr />
        {/* ★ 2. .dashboard-button-grid を解除し、中央寄せの d-flex に変更 */}
        <div className="d-flex justify-content-center flex-wrap">
          {/* ★ 3. クラスとスタイルを統一 ★ */}
          <button className="btn btn-info btn-sm" style={buttonStyle} onClick={() => navigate('/q_list')}>
            問題管理
          </button>
          <button className="btn btn-dark btn-sm" style={buttonStyle} onClick={() => navigate('/view')}>
            全ユーザーのテスト結果
          </button>
        </div>
      </section>

      {/* ====== その他 (マスターモード) ====== */}
      <section className="mt-5 text-center">
      <h2> マスターモード</h2>
        <hr />
        {/* ★ 2. .dashboard-button-grid を解除し、中央寄せの d-flex に変更 */}
        <div className="d-flex justify-content-center flex-wrap">
            
            {/* ★ 3. クラスとスタイルを統一 ★ */}
            <button className="btn btn-warning btn-sm" style={buttonStyle} onClick={() => navigate('/admin/logs')}>
              アプリケーションログ閲覧
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