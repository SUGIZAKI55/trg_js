import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, RadialLinearScale, Filler, Tooltip, Legend);

const MyAnalysis: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/user/analysis_data', { headers: { Authorization: `Bearer ${auth?.token}` } });
        setLogs(res.data);
      } finally { setLoading(false); }
    };
    if (auth?.token) fetchData();
  }, [auth?.token]);

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