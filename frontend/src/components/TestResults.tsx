import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { adminApi } from '../services/api';

interface ResultData {
  username: string;
  is_correct: boolean;
  company_name: string | null;
}

interface UserStats {
  total: number;
  correct: number;
  company: string;
}

const TestResults: React.FC = () => {
  const [userStats, setUserStats] = useState<Record<string, UserStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllResults = async () => {
      try {
        const res = await adminApi.getResults();

        const stats: Record<string, UserStats> = {};

        res.data.forEach((r: ResultData) => {
          if (!stats[r.username]) {
            stats[r.username] = { total: 0, correct: 0, company: r.company_name || 'N/A' };
          }
          stats[r.username].total++;
          if (r.is_correct) stats[r.username].correct++;
        });

        setUserStats(stats);

      } catch (err) {
        setError('全ユーザーの成績読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchAllResults();
  }, [auth?.token]);

  if (loading) return <div className="container mt-5 text-center">読み込み中...</div>;
  if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;

  // グラフ用のデータ
  const chartLabels = Object.keys(userStats);
  const chartDataPoints = chartLabels.map(username => {
    const stats = userStats[username];
    return stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
  });

  const chartData = {
    labels: chartLabels,
    datasets: [{
      label: '平均正解率 (%)',
      data: chartDataPoints,
      backgroundColor: 'rgba(74, 144, 226, 0.6)', // テーマカラー(青)に合わせ調整
      borderColor: 'rgba(74, 144, 226, 1)',
      borderWidth: 1,
    }],
  };

  const chartOptions = {
    scales: {
      y: { min: 0, max: 100, ticks: { color: '#444' } },
      x: { ticks: { color: '#444' } },
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'ユーザー別 平均正解率', color: '#444', font: { size: 16 } },
    }
  };

  return (
    <div className="container" style={{ maxWidth: '1140px', marginTop: '2rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">全ユーザーのテスト結果</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/admin')}>
          管理画面に戻る
        </button>
      </div>

      <div className="card shadow mb-4">
        <div className="card-body">
          {Object.keys(userStats).length > 0 ? (
            <Bar data={chartData} options={chartOptions as any} />
          ) : (
            <p className="text-center">まだ解答履歴がありません。</p>
          )}
        </div>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <h5 className="card-title mb-3">ユーザー別 総合成績</h5>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ユーザー名</th>
                  <th>所属企業</th>
                  <th>総正解数</th>
                  <th>総解答数</th>
                  <th>総正解率</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(userStats).length > 0 ? (
                  Object.entries(userStats)
                    .sort(([, statsA], [, statsB]) => 
                      ((statsB.correct / statsB.total) || 0) - ((statsA.correct / statsA.total) || 0)
                    )
                    .map(([username, stats]) => (
                      <tr key={username}>
                        <td>{username}</td>
                        <td>{stats.company}</td>
                        <td>{stats.correct} 問</td>
                        <td>{stats.total} 問</td>
                        <td>
                          {stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(0) : 0} %
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">データがありません</td>
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

export default TestResults;