import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// Chart.js を使う場合は、main.tsxでグローバル登録が必要です
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { Doughnut } from 'react-chartjs-2';
// ChartJS.register(ArcElement, Tooltip, Legend);

const QuizResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // QuizQuestion画面から渡された結果データを取得
  const { results, total } = location.state as { results: boolean[], total: number };

  const correctCount = results.filter(Boolean).length;
  const score = total > 0 ? ((correctCount / total) * 100).toFixed(0) : 0;

  // // ドーナツチャート用のデータ (Chart.jsを導入する場合)
  // const chartData = {
  //   labels: ['正解', '不正解'],
  //   datasets: [{
  //     data: [correctCount, total - correctCount],
  //     backgroundColor: ['#28a745', '#dc3545'],
  //   }],
  // };

  return (
    <div className="container mt-5 text-center" style={{ maxWidth: '600px' }}>
      <div className="card">
        <div className="card-header"><h1>クイズ結果</h1></div>
        <div className="card-body">
          <h2 className="display-4">{score} <span className="h5">点</span></h2>
          <h3>{correctCount} / {total} 問 正解！</h3>
          
          {/* Chart.jsを導入した場合の表示エリア */}
          {/* <div style={{ maxWidth: '250px', margin: '20px auto' }}>
            <Doughnut data={chartData} />
          </div> */}

          <div className="mt-4">
            <button className="btn btn-primary mr-2" onClick={() => navigate('/genre')}>
              もう一度挑戦する
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              ダッシュボードに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;