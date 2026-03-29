import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { learningLogsApi } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Chart.js コンポーネント登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface AnalysisLog {
  timestamp: string;
  question_title: string;
  is_correct: boolean;
  elapsed_time: number | null;
  genre: string;
  user: {
    id: number;
    username: string;
    company: any;
  };
  question_id: number;
}

const AdminAnalysis: React.FC = () => {
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const res = await learningLogsApi.getAnalysisData();
        setLogs(res.data);
      } catch (err) {
        console.error('分析データの取得に失敗:', err);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchAnalysisData();
  }, [auth?.token]);

  if (loading) {
    return (
      <div className="container-main text-center">
        <h2>データ分析中...</h2>
      </div>
    );
  }

  // --- フィルタリングロジック ---
  const filteredLogs = logs.filter((log) => {
    // ジャンルフィルタ
    if (selectedGenre !== 'all' && log.genre !== selectedGenre) return false;

    // 期間フィルタ
    if (selectedPeriod !== 'all') {
      const logDate = new Date(log.timestamp);
      const today = new Date();
      let daysAgo = 0;

      if (selectedPeriod === '7') daysAgo = 7;
      else if (selectedPeriod === '30') daysAgo = 30;

      const cutoffDate = new Date(today);
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

      if (logDate < cutoffDate) return false;
    }

    return true;
  });

  // --- 統計計算 ---
  const totalLogs = filteredLogs.length;
  const correctLogs = filteredLogs.filter((log) => log.is_correct).length;
  const overallAccuracy = totalLogs > 0 ? ((correctLogs / totalLogs) * 100).toFixed(1) : '0.0';

  // --- ジャンル別分析 ---
  const genreStats: Record<
    string,
    { total: number; correct: number; accuracy: number }
  > = {};
  filteredLogs.forEach((log) => {
    if (!genreStats[log.genre]) {
      genreStats[log.genre] = { total: 0, correct: 0, accuracy: 0 };
    }
    genreStats[log.genre].total++;
    if (log.is_correct) genreStats[log.genre].correct++;
  });

  Object.keys(genreStats).forEach((genre) => {
    genreStats[genre].accuracy =
      (genreStats[genre].correct / genreStats[genre].total) * 100;
  });

  const genreLabels = Object.keys(genreStats);
  const genreAccuracies = Object.values(genreStats).map((s) => s.accuracy);

  const genreChartData = {
    labels: genreLabels,
    datasets: [
      {
        label: '正答率 (%)',
        data: genreAccuracies,
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const genreChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: 'ジャンル別の正答率',
        font: { size: 14 },
        color: '#333',
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.parsed.y.toFixed(1)}%`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: { display: true, text: '正答率 (%)' },
      },
    },
  };

  // --- ユーザー別分析 ---
  const userStats: Record<
    string,
    { total: number; correct: number; accuracy: number; username: string }
  > = {};
  filteredLogs.forEach((log) => {
    const userId = log.user.id.toString();
    if (!userStats[userId]) {
      userStats[userId] = {
        total: 0,
        correct: 0,
        accuracy: 0,
        username: log.user.username,
      };
    }
    userStats[userId].total++;
    if (log.is_correct) userStats[userId].correct++;
  });

  Object.keys(userStats).forEach((userId) => {
    userStats[userId].accuracy =
      (userStats[userId].correct / userStats[userId].total) * 100;
  });

  const userArray = Object.entries(userStats).map(([id, stats]) => ({
    id,
    ...stats,
  }));
  userArray.sort((a, b) => b.accuracy - a.accuracy);

  // --- 正答率分布（統計） ---
  const accuracyDistribution = [0, 0, 0, 0, 0]; // 0-20, 20-40, 40-60, 60-80, 80-100
  userArray.forEach((user) => {
    if (user.accuracy < 20) accuracyDistribution[0]++;
    else if (user.accuracy < 40) accuracyDistribution[1]++;
    else if (user.accuracy < 60) accuracyDistribution[2]++;
    else if (user.accuracy < 80) accuracyDistribution[3]++;
    else accuracyDistribution[4]++;
  });

  const distributionChartData = {
    labels: [
      '0-20%',
      '20-40%',
      '40-60%',
      '60-80%',
      '80-100%',
    ],
    datasets: [
      {
        label: 'ユーザー数',
        data: accuracyDistribution,
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(54, 162, 235, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.7,
      },
    ],
  };

  const distributionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: '正答率分布（ユーザー数）',
        font: { size: 14 },
        color: '#333',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'ユーザー数' },
      },
    },
  };

  // --- 利用可能なジャンル一覧 ---
  const availableGenres = Array.from(new Set(logs.map((log) => log.genre)));

  // --- ユーザー別テーブルデータ ---
  const userTableData = userArray.slice(0, 10); // 上位10ユーザーを表示

  return (
    <div className="container-main">
      <div className="text-center mb-5">
        <h1>📊 学習傾向分析（全体分析）</h1>
        <p className="text-muted">全ユーザーの学習進捗を一目で把握できます</p>
      </div>

      {/* --- 統計サマリー --- */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">総ログ数</h5>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2196F3' }}>
                {totalLogs}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">全体正答率</h5>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
                {overallAccuracy}%
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">ユーザー数</h5>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF9800' }}>
                {Object.keys(userStats).length}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title">ジャンル数</h5>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#9C27B0' }}>
                {genreLabels.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- フィルタコントロール --- */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">フィルター設定</div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label>ジャンル:</label>
              <select
                className="form-control"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
              >
                <option value="all">すべて</option>
                {availableGenres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label>期間:</label>
              <select
                className="form-control"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="all">全期間</option>
                <option value="7">最近7日間</option>
                <option value="30">最近30日間</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* --- グラフセクション --- */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              {genreLabels.length > 0 ? (
                <div style={{ height: '350px' }}>
                  <Bar data={genreChartData} options={genreChartOptions} />
                </div>
              ) : (
                <p className="text-center text-muted">データがありません</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              {accuracyDistribution.some((v) => v > 0) ? (
                <div style={{ height: '350px' }}>
                  <Bar data={distributionChartData} options={distributionChartOptions} />
                </div>
              ) : (
                <p className="text-center text-muted">データがありません</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- ユーザー別成績テーブル --- */}
      <div className="card shadow-sm mb-4">
        <div className="card-header">ユーザー別学習進捗 (上位10ユーザー)</div>
        <div className="card-body">
          {userTableData.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>順位</th>
                    <th>ユーザー名</th>
                    <th>正答数 / 総数</th>
                    <th>正答率</th>
                  </tr>
                </thead>
                <tbody>
                  {userTableData.map((user, index) => (
                    <tr key={user.id}>
                      <td>
                        <strong>#{index + 1}</strong>
                      </td>
                      <td>{user.username}</td>
                      <td>
                        {user.correct} / {user.total}
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 'bold',
                            color:
                              user.accuracy >= 80
                                ? '#4CAF50'
                                : user.accuracy >= 60
                                ? '#FF9800'
                                : '#F44336',
                          }}
                        >
                          {user.accuracy.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted">ユーザーデータがありません</p>
          )}
        </div>
      </div>

      {/* --- 戻るボタン --- */}
      <div className="text-center mt-4">
        <button className="btn btn-secondary" onClick={() => navigate('/admin')}>
          ダッシュボードに戻る
        </button>
      </div>
    </div>
  );
};

export default AdminAnalysis;
