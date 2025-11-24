import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Radar, Scatter } from 'react-chartjs-2';

interface QuizLogEntry {
  date: string;
  genre: string;
  result: string;
  elapsed_time: number | null;
}

const MyAnalysis: React.FC = () => {
  const [logs, setLogs] = useState<QuizLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/user/analysis_data', {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchData();
  }, [auth?.token]);

  if (loading) return <div className="container mt-5 text-center">診断中...</div>;

  // --- データ集計 ---
  const total = logs.length;
  const correctLogs = logs.filter(l => l.result === '正解');
  const wrongLogs = logs.filter(l => l.result !== '正解');
  const accuracy = total > 0 ? (correctLogs.length / total) * 100 : 0;

  const avgTimeCorrect = correctLogs.length > 0 
    ? correctLogs.reduce((sum, l) => sum + (l.elapsed_time || 0), 0) / correctLogs.length 
    : 0;
  const avgTimeWrong = wrongLogs.length > 0
    ? wrongLogs.reduce((sum, l) => sum + (l.elapsed_time || 0), 0) / wrongLogs.length
    : 0;

  // --- 診断ロジック ---
  let persona = "🔰 初心者チャレンジャー";
  let description = "まだデータが足りません。もっと問題を解いてみましょう！";
  let color = "text-secondary";
  let reasons: string[] = [];

  if (total <= 5) {
    reasons.push(`現在の回答数: ${total}問`);
    reasons.push(`あと ${6 - total}問 解くと、AIがあなたの傾向を分析します。`);
  } else {
    if (accuracy >= 90) {
      persona = "👑 マスター";
      description = "素晴らしい知識量です！この調子で満点を目指しましょう。";
      color = "text-warning";
      reasons.push(`正解率が ${accuracy.toFixed(1)}% と非常に高い水準です。`);
      reasons.push(`合計 ${total}問中、${correctLogs.length}問 に正解しています。`);
    } else if (avgTimeWrong < 3.0 && avgTimeWrong < avgTimeCorrect / 1.5) {
      persona = "⚡️ 直感スピードスター";
      description = "回答がとても速いですが、不正解の時は少し焦っているかも？";
      color = "text-danger";
      reasons.push(`不正解の問題を 平均 ${avgTimeWrong.toFixed(1)}秒 という速さで回答しています。`);
      reasons.push(`正解した時と比較して、考える時間が極端に短くなっています。`);
    } else if (avgTimeCorrect > 15.0) {
      persona = "🐢 じっくり思考派";
      description = "慎重に考えて答えています。正解率は高いので、スピードアップを意識してみましょう。";
      color = "text-info";
      reasons.push(`正解するために 平均 ${avgTimeCorrect.toFixed(1)}秒 じっくり時間をかけています。`);
    } else {
      persona = "⚖️ バランス型学習者";
      description = "安定したペースで学習できています。";
      color = "text-success";
      reasons.push(`正解率 ${accuracy.toFixed(1)}% で、安定して学習が進んでいます。`);
    }
  }

  // --- グラフ設定 (ダークモード解除) ---
  const scatterData = {
    datasets: [
      {
        label: '正解 (秒)',
        data: correctLogs.map((l, i) => ({ x: i + 1, y: l.elapsed_time })),
        backgroundColor: 'rgba(75, 192, 192, 1)',
      },
      {
        label: '不正解 (秒)',
        data: wrongLogs.map((l, i) => ({ x: i + 1, y: l.elapsed_time })),
        backgroundColor: 'rgba(255, 99, 132, 1)',
      },
    ],
  };

  const scatterOptions = {
    scales: {
      y: { 
        title: { display: true, text: '秒数', color: '#666' }, // ★文字色変更
        ticks: { color: '#666' }, // ★目盛り文字色変更
        grid: { color: '#eee' }   // ★グリッド線変更
      },
      x: {
        ticks: { color: '#666' },
        grid: { color: '#eee' }
      }
    },
    plugins: {
      legend: { labels: { color: '#333' } } // ★凡例文字色
    }
  };

  const genreStats: Record<string, { total: number; correct: number }> = {};
  logs.forEach(log => {
    if (!genreStats[log.genre]) genreStats[log.genre] = { total: 0, correct: 0 };
    genreStats[log.genre].total++;
    if (log.result === '正解') genreStats[log.genre].correct++;
  });

  const radarData = {
    labels: Object.keys(genreStats),
    datasets: [{
      label: 'ジャンル別正解率 (%)',
      data: Object.values(genreStats).map(s => (s.correct / s.total) * 100),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
    }],
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0, max: 100,
        ticks: { stepSize: 20, backdropColor: 'transparent', color: '#666' }, // ★目盛り文字
        pointLabels: { color: '#333', font: { size: 12, weight: 'bold' } }, // ★ラベル文字(重要)
        grid: { color: '#ddd' }, // ★グリッド線
        angleLines: { color: '#eee' } // ★放射線
      },
    },
    plugins: {
      legend: { display: false },
    }
  };

  return (
    <div style={{ width: '90%', margin: '0 auto', marginTop: '2rem', paddingBottom: '4rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">学習タイプ診断</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>戻る</button>
      </div>

      {/* 診断結果カード */}
      <div className="card shadow-sm mb-5">
        <div className="card-body p-5">
          <div className="text-center">
            <h2 className="text-muted mb-3">あなたの学習タイプは...</h2>
            <h1 className={`display-4 fw-bold ${color} mb-4`}>{persona}</h1>
            <p className="lead mb-4">{description}</p>
          </div>
          
          {/* ★背景色を白系に変更、文字色指定を削除★ */}
          <div className="card border-0 p-4 mt-4" style={{ backgroundColor: '#f8f9fa' }}>
            <h4 className="mb-3 text-center text-dark">🔍 診断の根拠データ</h4>
            <ul className="list-group list-group-flush" style={{ backgroundColor: 'transparent' }}>
              {reasons.map((reason, index) => (
                // ★文字色指定を削除、ボーダー色を薄く★
                <li key={index} className="list-group-item" style={{ backgroundColor: 'transparent', borderBottom: '1px solid #ddd' }}>
                  ✅ {reason}
                </li>
              ))}
            </ul>
          </div>

          <hr className="my-4" />
          
          <div className="row text-center">
            <div className="col-4 border-end">
              <small className="text-muted">総回答数</small>
              <h3>{total} 問</h3>
            </div>
            <div className="col-4 border-end">
              <small className="text-muted">正解時の平均時間</small>
              <h3 className="text-success">{avgTimeCorrect.toFixed(1)} 秒</h3>
            </div>
            <div className="col-4">
              <small className="text-muted">不正解時の平均時間</small>
              <h3 className="text-danger">{avgTimeWrong.toFixed(1)} 秒</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">思考時間の推移</h5>
              <Scatter data={scatterData} options={scatterOptions} />
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h5 className="card-title">得意・不得意バランス</h5>
              {Object.keys(genreStats).length > 0 ? (
                <Radar data={radarData} options={radarOptions as any} />
              ) : <p>データ不足</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAnalysis;