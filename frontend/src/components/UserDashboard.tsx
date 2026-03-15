import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '../services/api';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { Radar } from 'react-chartjs-2';

// ChartJSの登録
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const UserDashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  
  // 状態管理
  const [loading, setLoading] = useState(true);
  const [genreStats, setGenreStats] = useState<Record<string, number>>({});
  const [reviewCount, setReviewCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      // トークンがない場合は何もしない
      if (!auth?.token) {
        setLoading(false);
        return;
      }

      try {
        const res = await usersApi.getDashboardData();
        
        setGenreStats(res.data.genre_stats);
        setReviewCount(res.data.review_count);
      } catch (error) {
        console.error("ダッシュボードデータの取得に失敗しました:", error);
      } finally {
        // 成功しても失敗してもロード中表示を消す
        setLoading(false);
      }
    };

    fetchData();
  }, [auth?.token]);

  // ローディング画面
  if (loading) {
    return <div className="text-center" style={{ marginTop: '50px' }}>読み込み中...</div>;
  }

  // チャートの設定
  const radarData = {
    labels: Object.keys(genreStats),
    datasets: [{
      label: '正解率 (%)',
      data: Object.values(genreStats),
      backgroundColor: 'rgba(138, 180, 248, 0.2)',
      borderColor: '#8ab4f8',
      borderWidth: 2,
    }],
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0, 
        max: 100,
        ticks: { display: false, backdropColor: 'transparent' },
        pointLabels: { color: '#e3e3e3', font: { size: 12 } },
        grid: { color: '#444' }, 
        angleLines: { color: '#444' }
      }
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="container-main">
      <div className="text-center mb-5">
        <h1 className="page-title">ようこそ、{auth?.username}さん</h1>
        <p className="page-subtitle">今日も学習を始めましょう！</p>
      </div>

      {/* グラフ表示エリア */}
      <div className="d-flex-center mb-5">
        <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
          <div className="card-header">📊 学習状況</div>
          <div className="card-body d-flex-center">
            {Object.keys(genreStats).length > 0 ? (
              <Radar data={radarData} options={radarOptions} />
            ) : (
              <p className="text-muted">データがまだありません</p>
            )}
          </div>
        </div>
      </div>

      {/* メニュータイル */}
      <div className="dashboard-grid">
        <div className="dashboard-tile" onClick={() => navigate('/genre')}>
          <span className="tile-icon">📝</span><span>クイズ開始</span>
        </div>
        <div className="dashboard-tile" onClick={() => navigate('/my_results')}>
          <span className="tile-icon">🏆</span><span>成績確認</span>
        </div>
        <div className="dashboard-tile" onClick={() => navigate('/my_analysis')}>
          <span className="tile-icon">🧠</span><span>タイプ診断</span>
        </div>
        <div 
          className="dashboard-tile" 
          style={{ borderColor: 'var(--accent-error)', color: 'var(--accent-error)' }} 
          onClick={logout}
        >
          <span className="tile-icon">🚪</span><span>ログアウト</span>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;