import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ResultView: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // stateからスコアを取得。直接URLを叩いた場合などは0点とする。
  const score = state?.score ?? 0;

  // 合否判定（例：70点以上で合格）
  const isPass = score >= 70;

  return (
    <div className="container mt-5 text-center text-light">
      <div className="card bg-dark border-secondary shadow-lg p-5 mx-auto" style={{ maxWidth: '600px', borderRadius: '20px' }}>
        <h2 className="text-secondary mb-4">Quiz Completed!</h2>
        
        <div className="mb-4">
          <div className="display-1 fw-bold text-primary mb-0">{score}</div>
          <p className="text-muted fs-4">POINTS</p>
        </div>

        <div className={`display-5 fw-bold mb-5 ${isPass ? 'text-success' : 'text-danger'}`}>
          {isPass ? '🎉 合格です！' : '😢 次は頑張りましょう'}
        </div>

        {/* スコアバー */}
        <div className="progress bg-secondary mb-5" style={{ height: '12px', borderRadius: '10px' }}>
          <div 
            className={`progress-bar progress-bar-striped progress-bar-animated ${isPass ? 'bg-success' : 'bg-danger'}`} 
            style={{ width: `${score}%` }}
          />
        </div>

        <div className="row g-3">
          <div className="col-12">
            <button 
              className="btn btn-primary btn-lg w-100 fw-bold py-3" 
              onClick={() => navigate('/genre')}
            >
              もう一度解く
            </button>
          </div>
          <div className="col-12">
            <button 
              className="btn btn-outline-light w-100 py-2" 
              onClick={() => navigate('/dashboard')}
            >
              ダッシュボードへ戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultView;