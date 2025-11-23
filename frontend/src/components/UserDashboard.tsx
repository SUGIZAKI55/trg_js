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

// Chart.jsの登録（既にmain.tsxで登録済みなら不要ですが、念のため）
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const UserDashboard: React.FC = () => {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [genreStats, setGenreStats] = useState<Record<string, number>>({});
  const [reviewCount, setReviewCount] = useState(0);

  const isAdminOrMaster = auth && (auth.role === 'admin' || auth.role === 'master');

  // データ取得
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

  // 1. 苦手ジャンル集中モード
  const handleWeakFocus = async () => {
    // 正解率が一番低いジャンルを探す
    const sortedGenres = Object.entries(genreStats).sort(([, a], [, b]) => a - b);
    if (sortedGenres.length === 0) {
      alert("まだ学習データがありません。まずは「簿記クイズを開始」から始めましょう！");
      return;
    }
    const weakGenre = sortedGenres[0][0]; // 一番低いジャンル名

    try {
      const res = await axios.get('/api/quiz/start', {
        params: { genre: weakGenre, count: 10 },
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      const questions = res.data;
      const session_id = `weak-${Date.now()}-${auth?.username}`;
      navigate('/question', { state: { questions, session_id } });
    } catch (err) {
      alert("問題の取得に失敗しました。");
    }
  };

  // 2. 復習モード
  const handleReviewMode = async () => {
    try {
      const res = await axios.get('/api/quiz/review', {
        headers: { Authorization: `Bearer ${auth?.token}` },
      });
      const questions = res.data;
      const session_id = `review-${Date.now()}-${auth?.username}`;
      navigate('/question', { state: { questions, session_id } });
    } catch (err) {
      alert("復習対象の問題が見つかりませんでした。");
    }
  };

  // レーダーチャートのデータ
  const radarData = {
    labels: Object.keys(genreStats),
    datasets: [
      {
        label: 'ジャンル別正解率 (%)',
        data: Object.values(genreStats),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20, backdropColor: 'transparent' }, // 目盛りを見やすく
        pointLabels: { color: '#e4e6eb', font: { size: 12 } }, // ラベルの色
        grid: { color: '#444' } // グリッド線の色
      },
    },
    plugins: {
      legend: { display: false },
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <div className="text-center mb-4">
        <h1>ようこそ、{auth?.username}さん</h1>
        <p className="text-muted">あなたの学習状況</p>
      </div>

      {/* --- レーダーチャートエリア --- */}
      <div className="card shadow mb-5">
        <div className="card-body d-flex justify-content-center">
          {Object.keys(genreStats).length > 0 ? (
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <Radar data={radarData} options={radarOptions} />
            </div>
          ) : (
            <div className="py-5 text-muted">
              まだデータがありません。<br/>クイズを解くとここに分析が表示されます。
            </div>
          )}
        </div>
      </div>

      {/* --- アクションボタンエリア --- */}
      <div className="dashboard-button-grid">
        {/* 通常のクイズ */}
        <button
          className="btn btn-primary dashboard-button"
          onClick={() => navigate('/genre')}
        >
          クイズを開始
        </button>

        {/* 苦手克服 (赤) */}
        <button
          className="btn btn-danger dashboard-button"
          onClick={handleWeakFocus}
          disabled={Object.keys(genreStats).length === 0}
        >
          ⚡️ 苦手ジャンル特訓
          <div style={{fontSize: '0.8rem', marginTop: '5px'}}>
            正解率ワースト1位を集中攻略
          </div>
        </button>

        {/* 復習モード (黄色) */}
        <button
          className="btn btn-warning dashboard-button"
          onClick={handleReviewMode}
          disabled={reviewCount === 0}
        >
          🔄 復習モード
          <div style={{fontSize: '0.8rem', marginTop: '5px'}}>
            最近の間違い: {reviewCount}問
          </div>
        </button>

        <button
          className="btn btn-info dashboard-button"
          onClick={() => navigate('/my_results')}
        >
          自分の成績を見る
        </button>
        
        {/* ★★★ 追加: 自己分析ボタン ★★★ */}
        <button
          className="btn btn-success dashboard-button"
          onClick={() => navigate('/my_analysis')}
        >
          📊 学習タイプ診断
          <div style={{fontSize: '0.8rem', marginTop: '5px'}}>
            あなたの傾向をAI分析
          </div>
        </button>

        {isAdminOrMaster && (
          <button
            className="btn btn-secondary dashboard-button"
            onClick={() => navigate('/admin')}
          >
            管理画面へ
          </button>
        )}

        <button
          className="btn btn-outline-danger dashboard-button"
          onClick={logout}
        >
          ログアウト
        </button>
      </div>
    </div>
  );
};

export default UserDashboard;