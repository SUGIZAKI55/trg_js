import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Radar, Scatter } from 'react-chartjs-2';

// ログデータの型
interface QuizLogEntry {
  date: string;
  name: string;
  genre: string;
  result: string;
  elapsed_time: number | null;
}

const LearnerAnalysis: React.FC = () => {
  const [allLogs, setAllLogs] = useState<QuizLogEntry[]>([]);
  const [learners, setLearners] = useState<string[]>([]);
  const [selectedLearner, setSelectedLearner] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/api/admin/logs', {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setAllLogs(res.data);
        
        // ユーザーリスト作成
        const names = Array.from(new Set(res.data.map((log: QuizLogEntry) => log.name)));
        const validNames = names.filter(n => n) as string[]; // null/undefinedを除外
        setLearners(validNames);
        if (validNames.length > 0) setSelectedLearner(validNames[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchLogs();
  }, [auth?.token]);

  if (loading) return <div className="container mt-5 text-center">分析中...</div>;

  // --- データ集計ロジック ---
  const targetLogs = allLogs.filter(log => log.name === selectedLearner);
  
  // 基本データ
  const total = targetLogs.length;
  const correctLogs = targetLogs.filter(l => l.result === '正解');
  const wrongLogs = targetLogs.filter(l => l.result !== '正解');
  const accuracy = total > 0 ? (correctLogs.length / total) * 100 : 0;

  // 平均回答時間 (秒)
  const avgTimeCorrect = correctLogs.length > 0 
    ? correctLogs.reduce((sum, l) => sum + (l.elapsed_time || 0), 0) / correctLogs.length 
    : 0;
  const avgTimeWrong = wrongLogs.length > 0
    ? wrongLogs.reduce((sum, l) => sum + (l.elapsed_time || 0), 0) / wrongLogs.length
    : 0;

  // ★★★ 診断ロジック & 根拠データ生成 ★★★
  let persona = "データ待機中";
  let description = "まだ十分なデータがありません。";
  let color = "text-secondary";
  let reasons: string[] = [];

  if (total <= 5) {
    if (total === 0) {
        description = "このユーザーのログデータが見つかりません。";
    } else {
        persona = "🔰 学習開始ステージ";
        description = "まだデータが少ないため、傾向分析はこれからです。";
        reasons.push(`現在の回答数: ${total}問`);
    }
  } else {
    if (accuracy >= 90) {
      persona = "👑 習熟マスター";
      description = "非常に高い知識レベルを持っています。弱点はほぼありません。";
      color = "text-warning";
      reasons.push(`正解率が ${accuracy.toFixed(1)}% と極めて高いです。`);
      reasons.push(`安定した回答速度で、迷いなく正解を選べています。`);
    } else if (avgTimeWrong < 3.0 && avgTimeWrong < avgTimeCorrect / 1.5) {
      persona = "⚡️ 直感型 (早とちり注意)";
      description = "わからない問題に見切りをつけるのが早すぎる傾向があります。";
      color = "text-danger";
      reasons.push(`不正解時の平均回答時間が ${avgTimeWrong.toFixed(1)}秒 と非常に高速です。`);
      reasons.push(`正解時（${avgTimeCorrect.toFixed(1)}秒）と比較して、思考時間が短すぎます。`);
      reasons.push(`問題文を最後まで読まずに回答している可能性があります。`);
    } else if (avgTimeCorrect > 15.0) {
      persona = "🐢 慎重思考型";
      description = "正解率は高いですが、回答に時間がかかっています。";
      color = "text-info";
      reasons.push(`正解するために 平均 ${avgTimeCorrect.toFixed(1)}秒 かけています。`);
      reasons.push(`知識はありますが、引き出すのに時間がかかっている状態です。`);
    } else {
      persona = "⚖️ バランス型";
      description = "学習は順調です。特定の苦手ジャンルがないか確認しましょう。";
      color = "text-success";
      reasons.push(`正解率 ${accuracy.toFixed(1)}% で安定しています。`);
      reasons.push(`極端な回答時間の偏りも見られません。`);
    }
  }

  // 散布図データ
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

  // レーダーチャートデータ (ジャンル別正解率)
  const genreStats: Record<string, { total: number; correct: number }> = {};
  targetLogs.forEach(log => {
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

  return (
    <div style={{ width: '90%', margin: '0 auto', marginTop: '2rem', paddingBottom: '5rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">学習者の傾向分析</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/admin')}>戻る</button>
      </div>

      {/* 学習者選択エリア */}
      <div className="card shadow mb-4">
        <div className="card-body d-flex align-items-center">
          <label className="form-label mb-0 me-3" style={{whiteSpace: 'nowrap'}}>分析対象:</label>
          <select 
            className="form-select" 
            value={selectedLearner} 
            onChange={(e) => setSelectedLearner(e.target.value)}
            style={{ maxWidth: '300px' }}
          >
            {learners.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
      </div>

      {/* 診断結果カード */}
      <div className="card shadow mb-5">
        <div className="card-body p-5">
          <div className="text-center">
            <h2 className="text-muted mb-3">{selectedLearner} さんのタイプ</h2>
            <h1 className={`display-4 fw-bold ${color} mb-4`}>{persona}</h1>
            <p className="lead mb-4">{description}</p>
          </div>

          <div className="card bg-light border-0 p-4 mt-4" style={{ backgroundColor: '#2a2a2a' }}>
            <h4 className="mb-3 text-center">🔍 AI診断の根拠データ</h4>
            <ul className="list-group list-group-flush" style={{ backgroundColor: 'transparent' }}>
              {reasons.map((reason, index) => (
                <li key={index} className="list-group-item" style={{ backgroundColor: 'transparent', color: '#e4e6eb', borderBottom: '1px solid #444' }}>
                  ✅ {reason}
                </li>
              ))}
            </ul>
          </div>

          <hr className="my-4" style={{ borderColor: '#555' }} />
          
          <div className="row text-center">
            <div className="col-4 border-end border-secondary">
              <small className="text-muted">総回答数</small>
              <h3>{total} 問</h3>
            </div>
            <div className="col-4 border-end border-secondary">
              <small className="text-muted">正解時 平均時間</small>
              <h3 className="text-success">{avgTimeCorrect.toFixed(1)} 秒</h3>
            </div>
            <div className="col-4">
              <small className="text-muted">不正解時 平均時間</small>
              <h3 className="text-danger">{avgTimeWrong.toFixed(1)} 秒</h3>
            </div>
          </div>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card shadow h-100">
            <div className="card-body">
              <h5 className="card-title">ジャンル別 強み・弱み (レーダーチャート)</h5>
              {Object.keys(genreStats).length > 0 ? (
                <Radar data={radarData} options={{ scales: { r: { min: 0, max: 100, ticks: { backdropColor: 'transparent' } } } }} />
              ) : <p>データ不足</p>}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card shadow h-100">
            <div className="card-body">
              <h5 className="card-title">思考時間の推移 (散布図)</h5>
              <p className="text-muted small">横軸:回答順 / 縦軸:秒数</p>
              <Scatter 
                data={scatterData} 
                options={{ scales: { y: { beginAtZero: true, title: { display: true, text: '回答時間(秒)' } } } }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnerAnalysis;