import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Radar, Scatter } from 'react-chartjs-2';

// ログデータの型
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
  
  // 正解率
  const accuracy = total > 0 ? (correctLogs.length / total) * 100 : 0;

  // 平均回答時間の計算 (秒)
  const avgTimeCorrect = correctLogs.length > 0 
    ? correctLogs.reduce((sum, l) => sum + (l.elapsed_time || 0), 0) / correctLogs.length 
    : 0;
    
  const avgTimeWrong = wrongLogs.length > 0
    ? wrongLogs.reduce((sum, l) => sum + (l.elapsed_time || 0), 0) / wrongLogs.length
    : 0;

  // ★★★ タイプ診断 & 根拠生成ロジック ★★★
  let persona = "🔰 初心者チャレンジャー";
  let description = "まだデータが足りません。もっと問題を解いてみましょう！";
  let color = "text-secondary";
  let reasons: string[] = []; // ★追加: 根拠リスト

  if (total <= 5) {
    reasons.push(`現在の回答数: ${total}問`);
    reasons.push(`あと ${6 - total}問 解くと、AIがあなたの傾向を分析します。`);
  } else {
    if (accuracy >= 90) {
      // --- 簿記マスター ---
      persona = "👑 簿記マスター";
      description = "素晴らしい知識量です！この調子で満点を目指しましょう。";
      color = "text-warning";
      reasons.push(`正解率が ${accuracy.toFixed(1)}% と非常に高い水準です。`);
      reasons.push(`合計 ${total}問中、${correctLogs.length}問 に正解しています。`);
      
    } else if (avgTimeWrong < 3.0 && avgTimeWrong < avgTimeCorrect / 1.5) {
      // --- 直感スピードスター ---
      persona = "⚡️ 直感スピードスター";
      description = "回答がとても速いですが、不正解の時は少し焦っているかも？ わからない問題も「あと5秒」考えてから答えると正解率が上がります！";
      color = "text-danger";
      reasons.push(`不正解の問題を 平均 ${avgTimeWrong.toFixed(1)}秒 という速さで回答しています。`);
      reasons.push(`正解した時（平均 ${avgTimeCorrect.toFixed(1)}秒）と比べて、考える時間が極端に短くなっています。`);
      reasons.push(`「わからない」と思った瞬間に諦めてしまっている可能性があります。`);

    } else if (avgTimeCorrect > 15.0) {
      // --- じっくり思考派 ---
      persona = "🐢 じっくり思考派";
      description = "慎重に考えて答えています。正解率は高いので、自信を持って少しスピードアップを意識してみましょう。";
      color = "text-info";
      reasons.push(`正解するために 平均 ${avgTimeCorrect.toFixed(1)}秒 じっくり時間をかけています。`);
      reasons.push(`慎重さは武器ですが、試験本番の時間配分を意識するフェーズに入っています。`);

    } else {
      // --- バランス型 ---
      persona = "⚖️ バランス型学習者";
      description = "安定したペースで学習できています。苦手ジャンルを重点的に復習するとさらに伸びます！";
      color = "text-success";
      reasons.push(`正解率 ${accuracy.toFixed(1)}% で、安定して学習が進んでいます。`);
      reasons.push(`回答スピードも極端な偏りがなく、理想的です。`);
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

  // レーダーチャートデータ
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

  return (
    <div style={{ width: '90%', margin: '0 auto', marginTop: '2rem', paddingBottom: '4rem' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h2">学習タイプ診断</h1>
        <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>戻る</button>
      </div>

      {/* 診断結果カード */}
      <div className="card shadow mb-5">
        <div className="card-body p-5">
          <div className="text-center">
            <h2 className="text-muted mb-3">あなたの学習タイプは...</h2>
            <h1 className={`display-4 fw-bold ${color} mb-4`}>{persona}</h1>
            <p className="lead mb-4">{description}</p>
          </div>
          
          <div className="card bg-light border-0 p-4 mt-4" style={{ backgroundColor: '#2a2a2a' }}>
            <h4 className="mb-3 text-center">🔍 診断の根拠データ</h4>
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
          <div className="card shadow h-100">
            <div className="card-body">
              <h5 className="card-title">思考時間の推移 (散布図)</h5>
              <p className="text-muted small">横軸:回答順 / 縦軸:秒数</p>
              <Scatter 
                data={scatterData} 
                options={{ scales: { y: { title: { display: true, text: '秒数' } } } }} 
              />
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-4">
          <div className="card shadow h-100">
            <div className="card-body">
              <h5 className="card-title">得意・不得意バランス</h5>
              {Object.keys(genreStats).length > 0 ? (
                <Radar data={radarData} options={{ scales: { r: { min: 0, max: 100 } } }} />
              ) : <p>データ不足</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyAnalysis;