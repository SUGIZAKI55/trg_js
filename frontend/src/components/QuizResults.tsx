import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const QuizResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // QuizQuestionから渡されるデータの形を定義
  // results: [{ questionId: number, isCorrect: boolean }]
  const state = location.state as { score?: number, results?: { isCorrect: boolean }[] };

  // スコアの取得（直接計算するか、渡されたスコアを使う）
  const score = state?.score ?? (state?.results 
    ? Math.round((state.results.filter(r => r.isCorrect).length / state.results.length) * 100) 
    : 0);

  const correctCount = state?.results ? state.results.filter(r => r.isCorrect).length : 0;
  const total = state?.results ? state.results.length : 0;

  const isPass = score >= 70;

  return (
    <div className="container mt-5 text-center text-light" style={{ maxWidth: '600px' }}>
      <div className="card bg-dark border-secondary shadow-lg overflow-hidden" style={{ borderRadius: '20px' }}>
        <div className="card-header border-secondary py-4 bg-dark">
          <h1 className="h3 text-secondary uppercase m-0">Quiz Result</h1>
        </div>
        
        <div className="card-body p-5">
          {/* スコア表示部分 */}
          <div className="mb-4">
            <div className="display-1 fw-bold text-primary mb-0">{score}</div>
            <div className="text-muted fs-4">POINTS</div>
          </div>

          <h2 className={`display-6 fw-bold mb-4 ${isPass ? 'text-success' : 'text-danger'}`}>
            {isPass ? '🎉 合格！' : '😢 不合格'}
          </h2>

          {/* 正解数の内訳がある場合のみ表示 */}
          {total > 0 && (
            <div className="mb-4 text-secondary">
              <span className="fs-4">{correctCount}</span> / <span className="fs-5">{total} 問正解</span>
            </div>
          )}

          {/* プログレスバー */}
          <div className="progress bg-dark border border-secondary mb-5" style={{ height: '12px', borderRadius: '10px' }}>
            <div 
              className={`progress-bar progress-bar-striped progress-bar-animated ${isPass ? 'bg-success' : 'bg-danger'}`} 
              style={{ width: `${score}%` }}
            />
          </div>

          <div className="d-grid gap-3">
            <button className="btn btn-primary btn-lg fw-bold py-3 shadow-sm" onClick={() => navigate('/genre')}>
              もう一度挑戦する
            </button>
            <button className="btn btn-outline-light py-2" onClick={() => navigate('/dashboard')}>
              ダッシュボードに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;