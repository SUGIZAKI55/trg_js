import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Doughnut } from 'react-chartjs-2'; // ドーナツグラフをインポート

// APIから受け取る生データの型
interface ResultData {
  session_id: string;
  is_correct: boolean;
  timestamp: string;
}

// セッションごとに集計したデータの型
interface QuizRun {
  total: number;
  correct: number;
  timestamp: string;
}

const MyResults: React.FC = () => {
  const [runs, setRuns] = useState<Record<string, QuizRun>>({});
  const [overallStats, setOverallStats] = useState({ total: 0, correct: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyResults = async () => {
      try {
        const res = await axios.get<ResultData[]>('/api/user/my_results', {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        
        // --- データを集計 ---
        const quizRuns: Record<string, QuizRun> = {};
        let totalAll = 0;
        let correctAll = 0;
        
        res.data.forEach((r) => {
          totalAll++;
          if (r.is_correct) correctAll++;
          
          if (!quizRuns[r.session_id]) {
            quizRuns[r.session_id] = { total: 0, correct: 0, timestamp: r.timestamp };
          }
          quizRuns[r.session_id].total++;
          if (r.is_correct) quizRuns[r.session_id].correct++;
        });

        setRuns(quizRuns);
        setOverallStats({ total: totalAll, correct: correctAll });
        
      } catch (err) {
        setError('成績の読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchMyResults();
  }, [auth?.token]);

  if (loading) return <div className="container mt-5 text-center"><h2>読み込み中...</h2></div>;
  if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;

  // グラフ用のデータ
  const chartData = {
    labels: ['正解', '不正解'],
    datasets: [{
      data: [overallStats.correct, overallStats.total - overallStats.correct],
      backgroundColor: ['#28a745', '#dc3545'], // 緑と赤
      borderColor: ['#1e1e1e'],
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    plugins: {
      legend: { labels: { color: '#e4e6eb' } }, // 凡例の文字色
      title: { display: true, text: '総合成績', color: '#e4e6eb', font: { size: 16 } },
    }
  };

  return (
    <div style={{ width: '90%', margin: '0 auto', marginTop: '2rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">あなたの成績</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
          ダッシュボードに戻る
        </button>
      </div>

      {/* --- グラフエリア --- */}
      <div className="card shadow mb-4">
        <div className="card-body d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          {overallStats.total > 0 ? (
            <div style={{ width: '100%', maxWidth: '250px' }}>
              <Doughnut data={chartData} options={chartOptions} />
            </div>
          ) : (
            <p>まだ解答履歴がありません。</p>
          )}
        </div>
      </div>

      {/* --- 成績一覧テーブル --- */}
      <div className="card shadow">
        <div className="card-body">
          <h5 className="card-title">受験履歴 (セッションごと)</h5>
          <div className="table-responsive">
            <table className="table table-dark table-striped table-hover">
              <thead className="thead-dark">
                <tr>
                  <th>受験日時</th>
                  <th>正解数</th>
                  <th>問題数</th>
                  <th>正解率</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(runs).length > 0 ? (
                  Object.entries(runs)
                    // タイムスタンプで降順（新しい順）にソート
                    .sort(([, runA], [, runB]) => new Date(runB.timestamp).getTime() - new Date(runA.timestamp).getTime())
                    .map(([sessionId, run]) => (
                      <tr key={sessionId}>
                        <td>{new Date(run.timestamp).toLocaleString()}</td>
                        <td>{run.correct} 問</td>
                        <td>{run.total} 問</td>
                        <td>{((run.correct / run.total) * 100).toFixed(0)} %</td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center">データがありません</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyResults;