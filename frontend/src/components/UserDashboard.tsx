import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const UserDashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  
  // ★ここで定義されている loading をちゃんと使うように修正
  const [loading, setLoading] = useState(true);
  const [genreStats, setGenreStats] = useState<Record<string, number>>({});
  const [reviewCount, setReviewCount] = useState(0);
  const [loadingEasy, setLoadingEasy] = useState(false);

  const isAdminOrMaster = auth && (auth.role === 'admin' || auth.role === 'master');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/user/dashboard_data', {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setGenreStats(res.data.genre_stats);
        setReviewCount(res.data.review_count);
      } catch (err) {
        console.error("ダッシュボードデータの取得失敗:", err);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchData();
  }, [auth?.token]);

  const handleWeakFocus = async () => {
    const sortedGenres = Object.entries(genreStats).sort(([, a], [, b]) => a - b);
    if (sortedGenres.length === 0) { alert("まだ学習データがありません。"); return; }
    const weakGenre = sortedGenres[0][0];
    try {
      const res = await axios.get('/api/quiz/start', {
        params: { genre: weakGenre, count: 10 },
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      navigate('/question', { state: { questions: res.data, session_id: `weak-${Date.now()}` } });
    } catch (err) { alert("問題取得エラー"); }
  };

  const handleReviewMode = async () => {
    try {
      const res = await axios.get('/api/quiz/review', { headers: { Authorization: `Bearer ${auth?.token}` } });
      navigate('/question', { state: { questions: res.data, session_id: `review-${Date.now()}` } });
    } catch (err) { alert("復習対象なし"); }
  };

  const handleEasyMode = async () => {
    setLoadingEasy(true);
    try {
      const res = await axios.get('/api/quiz/start_easy', { params: { count: 10 }, headers: { Authorization: `Bearer ${auth?.token}` } });
      navigate('/question', { state: { questions: res.data, session_id: `easy-${Date.now()}` } });
    } catch (err) { alert("問題取得エラー"); } finally { setLoadingEasy(false); }
  };

  // ★追加: ロード中の表示（これでloading変数が使われることになる）
  if (loading) {
    return <div className="container mt-5 text-center">読み込み中...</div>;
  }

  const radarData = {
    labels: Object.keys(genreStats),
    datasets: [{
      label: 'ジャンル別正解率 (%)',
      data: Object.values(genreStats),
      backgroundColor: 'rgba(74, 144, 226, 0.2)',
      borderColor: 'rgba(74, 144, 226, 1)',
      borderWidth: 1,
    }],
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { stepSize: 20, backdropColor: 'transparent', color: '#888' },
        pointLabels: { color: '#333', font: { size: 12, weight: 'bold' } },
        grid: { color: '#ddd' },
        angleLines: { color: '#eee' }
      },
    },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="text-center mb-4">
        <h1>ようこそ、{auth?.username}さん</h1>
        <p className="text-muted">あなたの学習状況</p>
      </div>

      <div className="card shadow mb-5">
        <div className="card-body d-flex justify-content-center">
          {Object.keys(genreStats).length > 0 ? (
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <Radar data={radarData} options={radarOptions as any} />
            </div>
          ) : (
            <div className="py-5 text-muted">学習データがありません。クイズに挑戦しましょう！</div>
          )}
        </div>
      </div>

      <div className="dashboard-button-grid">
        <button className="btn btn-primary dashboard-button" onClick={() => navigate('/genre')}>
          簿記クイズを開始
        </button>
        <button className="btn btn-success dashboard-button" onClick={handleEasyMode} disabled={loadingEasy}>
          🔰 ウォームアップ
          <div style={{fontSize: '0.8rem', marginTop: '5px'}}>正解率が高い問題を優先</div>
        </button>
        <button className="btn btn-danger dashboard-button" onClick={handleWeakFocus} disabled={Object.keys(genreStats).length === 0}>
          ⚡️ 苦手ジャンル特訓
          <div style={{fontSize: '0.8rem', marginTop: '5px'}}>正解率ワースト1位を攻略</div>
        </button>
        <button className="btn btn-warning dashboard-button" onClick={handleReviewMode} disabled={reviewCount === 0}>
          🔄 復習モード
          <div style={{fontSize: '0.8rem', marginTop: '5px'}}>最近の間違い: {reviewCount}問</div>
        </button>
        <button className="btn btn-info dashboard-button" onClick={() => navigate('/my_results')}>
          自分の成績を見る
        </button>
        <button className="btn btn-success dashboard-button" onClick={() => navigate('/my_analysis')}>
          📊 学習タイプ診断
          <div style={{fontSize: '0.8rem', marginTop: '5px'}}>あなたの傾向をAI分析</div>
        </button>
        {isAdminOrMaster && (
          <button className="btn btn-secondary dashboard-button" onClick={() => navigate('/admin')}>管理画面へ</button>
        )}
        <button className="btn btn-outline-danger dashboard-button" onClick={logout}>ログアウト</button>
      </div>
    </div>
  );
};

export default UserDashboard;