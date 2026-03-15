import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend);

interface PatternDiagnosis {
  patternType: 'balanced' | 'specialist' | 'growth' | 'improvement' | 'beginner';
  score: number;
  genreConcentration: number;
  growthRate: number;
  recommendation: string;
}

const MyAnalysis: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [diagnosis, setDiagnosis] = useState<PatternDiagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const { auth } = useAuth();
  const navigate = useNavigate();

  // パターンタイプごとの色と情報
  const patternInfo: Record<string, { color: string; icon: string }> = {
    balanced: { color: '#8ab4f8', icon: '⚖️' },
    specialist: { color: '#f28b82', icon: '🎯' },
    growth: { color: '#81c995', icon: '📈' },
    improvement: { color: '#fdd835', icon: '💪' },
    beginner: { color: '#b0bec5', icon: '🌱' },
  };

  // 診断データを読み込み
  useEffect(() => {
    const loadDiagnosis = async () => {
      if (!auth?.userId) return;
      try {
        const res = await userApi.getPatternDiagnosis(auth.userId);
        if (res.data) {
          setDiagnosis(res.data);
        } else {
          // 診断結果がない場合は新規実行
          await handleRunDiagnosis();
        }
      } catch (error) {
        console.error('Failed to load diagnosis:', error);
      }
    };

    if (auth?.token) {
      loadDiagnosis();
    }
  }, [auth?.token, auth?.userId]);

  // 分析データを読み込み
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await userApi.getAnalysis();
        setLogs(res.data);
      } finally {
        setLoading(false);
      }
    };
    if (auth?.token) fetchData();
  }, [auth?.token]);

  // 診断を実行
  const handleRunDiagnosis = async () => {
    if (!auth?.userId) return;
    setDiagnosisLoading(true);
    try {
      const res = await userApi.runPatternDiagnosis(auth.userId);
      setDiagnosis(res.data);
    } catch (error) {
      console.error('Failed to run diagnosis:', error);
    } finally {
      setDiagnosisLoading(false);
    }
  };

  if (loading) return <div className="text-center" style={{marginTop:'50px'}}>分析中...</div>;

  const genreStats: any = {};
  logs.forEach(log => {
    if (!genreStats[log.genre]) genreStats[log.genre] = { correctTime: 0, wrongTime: 0, total: 0, correct: 0 };
    genreStats[log.genre].total++;
    const time = log.elapsed_time || 0;
    if (log.is_correct) { genreStats[log.genre].correct++; genreStats[log.genre].correctTime += time; }
    else { genreStats[log.genre].wrongTime += time; }
  });

  const labels = Object.keys(genreStats);
  const stackedBarData = {
    labels,
    datasets: [
      { label: '正解(秒)', data: labels.map(g => genreStats[g].correctTime), backgroundColor: '#8ab4f8', stack: 'ts' },
      { label: '不正解(秒)', data: labels.map(g => genreStats[g].wrongTime), backgroundColor: '#f28b82', stack: 'ts' },
    ],
  };
  const stackedBarOptions = {
    responsive: true,
    scales: {
      x: { stacked: true, ticks: { color: '#e3e3e3' }, grid: { display: false } },
      y: { stacked: true, ticks: { color: '#e3e3e3' }, grid: { color: '#444' }, title: { display: true, text: '秒', color: '#aaa' } }
    },
    plugins: { legend: { labels: { color: '#e3e3e3' } } }
  };

  const radarData = {
    labels,
    datasets: [{
      label: '正解率(%)',
      data: labels.map(g => (genreStats[g].correct / genreStats[g].total) * 100),
      backgroundColor: 'rgba(138, 180, 248, 0.2)', borderColor: '#8ab4f8', borderWidth: 2,
    }]
  };
  const radarOptions = {
    scales: { r: { min: 0, max: 100, ticks: { display: false, backdropColor: 'transparent' }, pointLabels: { color: '#e3e3e3' }, grid: { color: '#444' } } },
    plugins: { legend: { display: false } }
  };

  return (
    <div className="container-main">
      <div className="text-center mb-5">
        <h1 className="page-title">学習傾向分析</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>戻る</button>
      </div>

      {/* 学習パターン診断セクション */}
      {diagnosis && (
        <div className="card" style={{ marginBottom: '30px', backgroundColor: '#1e1e1e', borderRadius: '8px' }}>
          <div className="card-header">学習パターン診断</div>
          <div className="card-body" style={{ padding: '30px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
              {/* パターンタイプバッジ */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div
                  style={{
                    backgroundColor: patternInfo[diagnosis.patternType].color,
                    color: '#000',
                    padding: '20px 30px',
                    borderRadius: '8px',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    minWidth: '200px'
                  }}
                >
                  {patternInfo[diagnosis.patternType].icon} {diagnosis.patternType}型
                </div>
              </div>

              {/* 診断スコア */}
              <div>
                <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '10px' }}>診断スコア</div>
                <div style={{ color: '#e3e3e3', fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>
                  {diagnosis.score}/100
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#333',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${diagnosis.score}%`,
                      height: '100%',
                      backgroundColor: patternInfo[diagnosis.patternType].color,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>

              {/* ジャンル集中度 */}
              <div>
                <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '10px' }}>ジャンル集中度</div>
                <div style={{ color: '#e3e3e3', fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
                  {diagnosis.genreConcentration.toFixed(1)}%
                </div>
                <div style={{ color: '#aaa', fontSize: '12px' }}>
                  {diagnosis.genreConcentration < 20
                    ? '複数分野でバランスよく学習'
                    : diagnosis.genreConcentration < 50
                    ? '複数の分野に関心あり'
                    : '特定分野への集中度が高い'}
                </div>
              </div>

              {/* 成長率 */}
              <div>
                <div style={{ color: '#aaa', fontSize: '12px', marginBottom: '10px' }}>成長率</div>
                <div style={{ color: '#e3e3e3', fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>
                  {diagnosis.growthRate > 0 ? '↑' : diagnosis.growthRate < 0 ? '↓' : '→'} {Math.abs(diagnosis.growthRate).toFixed(1)}%
                </div>
                <div style={{ color: '#aaa', fontSize: '12px' }}>
                  {diagnosis.growthRate > 0
                    ? `学習前半比で${diagnosis.growthRate.toFixed(1)}%成長中`
                    : diagnosis.growthRate < 0
                    ? `学習前半比で${Math.abs(diagnosis.growthRate).toFixed(1)}%低下`
                    : '学習前半と同等'}
                </div>
              </div>
            </div>

            {/* 推奨メッセージ */}
            <div
              style={{
                marginTop: '25px',
                padding: '20px',
                backgroundColor: 'rgba(138, 180, 248, 0.1)',
                borderLeft: `4px solid ${patternInfo[diagnosis.patternType].color}`,
                borderRadius: '4px',
                color: '#e3e3e3'
              }}
            >
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {diagnosis.recommendation}
              </div>
            </div>

            {/* 再診断ボタン */}
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <button
                className="btn btn-primary"
                onClick={handleRunDiagnosis}
                disabled={diagnosisLoading}
                style={{ minWidth: '150px' }}
              >
                {diagnosisLoading ? '診断中...' : '診断を再実行'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 既存のグラフセクション */}
      <div className="d-flex-center" style={{ gap: '20px', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: '300px' }}>
          <div className="card-header">時間消費分析</div>
          <div className="card-body"><Bar data={stackedBarData} options={stackedBarOptions} /></div>
        </div>
        <div className="card" style={{ flex: 1, minWidth: '300px' }}>
          <div className="card-header">得意バランス</div>
          <div className="card-body"><Radar data={radarData} options={radarOptions} /></div>
        </div>
      </div>
    </div>
  );
};
export default MyAnalysis;