import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2'; // 棒グラフをインポート

// APIから受け取る生データの型
interface ResultData {
  username: string;
  is_correct: boolean;
  company_name: string | null;
}

// ユーザーごとに集計したデータの型
interface UserStats {
  total: number;
  correct: number;
  company: string;
}

const TestResults: React.FC = () => {
  const [userStats, setUserStats] = useState<Record<string, UserStats>>({});
  const [overallStats, setOverallStats] = useState({ total: 0, correct: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllResults = async () => {
      try {
        const res = await axios.get<ResultData[]>('/api/admin/results', {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });

        // --- データをユーザーごとに集計 ---
        const stats: Record<string, UserStats> = {};
        let totalAll = 0;
        let correctAll = 0;
        
        res.data.forEach((r) => {
          totalAll++;
          if (r.is_correct) correctAll++;
          
          if (!stats[r.username]) {
            stats[r.username] = { total: 0, correct: 0, company: r.company_name || 'N/A' };
          }
          stats[r.username].total++;
          if (r.is_correct) stats[r.username].correct++;
        });

        setUserStats(stats);
        setOverallStats({ total: totalAll, correct: correctAll });

      } catch (err) {
        setError('全ユーザーの成績読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchAllResults();
  }, [auth?.token]);

  if (loading) return <div className="container mt-5 text-center"><h2>読み込み中...</h2></div>;
  if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;

  // グラフ用のデータ（ユーザー別平均点）
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
      backgroundColor: 'rgba(54, 162, 235, 0.6)', // 青
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  };

  const chartOptions = {
    scales: {
      y: { min: 0, max: 100, ticks: { color: '#e4e6eb' } }, // Y軸は0-100%
      x: { ticks: { color: '#e4e6eb' } },
    },
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'ユーザー別 平均正解率', color: '#e4e6eb', font: { size: 16 } },
    }
  };

  return (
    <div style={{ width: '90%', margin: '0 auto', marginTop: '2rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2 mb-0">全ユーザーのテスト結果</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/admin')}>
          管理画面に戻る
        </button>
      </div>

      {/* --- グラフエリア --- */}
      <div className="card shadow mb-4">
        <div className="card-body">
          {Object.keys(userStats).length > 0 ? (
            <Bar data={chartData} options={chartOptions as any} /> // as any で型エラーを回避
          ) : (
            <p className="text-center">まだ解答履歴がありません。</p>
          )}
        </div>
      </div>

      {/* --- ユーザー別成績一覧テーブル --- */}
      <div className="card shadow">
        <div className="card-body">
          <h5 className="card-title">ユーザー別 総合成績</h5>
          <div className="table-responsive">
            <table className="table table-dark table-striped table-hover">
              <thead className="thead-dark">
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
                    // 正解率で降順（高い順）にソート
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