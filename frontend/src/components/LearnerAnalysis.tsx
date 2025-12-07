import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Chart.jsのコンポーネント登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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
}

const LearnerAnalysis: React.FC = () => {
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const res = await axios.get('/api/user/analysis_data', {
          headers: { Authorization: `Bearer ${auth?.token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error("分析データの取得に失敗:", err);
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

  // --- データ整形 ---
  const sortedLogs = [...logs]; 

  const labels = sortedLogs.map((_, index) => `Q${index + 1}`);
  const dataPoints = sortedLogs.map((log) => log.elapsed_time || 0);
  
  // ★ 棒グラフの色分けロジック
  // 正解: 濃い水色, 不正解: 濃い赤
  const backgroundColors = sortedLogs.map((log) => 
    log.is_correct ? 'rgba(41, 182, 246, 0.8)' : 'rgba(255, 82, 82, 0.8)'
  );
  const borderColors = sortedLogs.map((log) => 
    log.is_correct ? '#0288d1' : '#d32f2f'
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: '回答時間',
        data: dataPoints,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 6, // 丸みを少し強く
        barPercentage: 0.6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // 高さを自由に調整できるようにする
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: '問題ごとの思考時間 (棒の高さ=時間 / 色=正誤)',
        font: { size: 16 },
        color: '#333',
        padding: { bottom: 20 }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const index = context.dataIndex;
            const log = sortedLogs[index];
            const result = log.is_correct ? '⭕️正解' : '❌不正解';
            return `${result} (${log.elapsed_time}秒): ${log.question_title.substring(0, 15)}...`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'かかった時間 (秒)' },
        grid: { color: '#f0f0f0' }
      },
      x: {
        title: { display: true, text: '回答順' },
        grid: { display: false }
      }
    },
  };

  return (
    <div className="container-main">
      <div className="text-center mb-5">
        <h1>📊 学習傾向分析</h1>
        <p className="text-muted">どの問題に時間をかけたかが一目でわかります</p>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>思考時間の比較</span>
          <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
            <span className="me-3" style={{ color: '#29b6f6' }}>■ 正解 (Blue)</span>
            <span style={{ color: '#ff5252' }}>■ 不正解 (Red)</span>
          </div>
        </div>
        <div className="card-body">
          {logs.length > 0 ? (
            <div style={{ height: '400px', width: '100%' }}>
              <Bar data={chartData} options={options} />
            </div>
          ) : (
            <p className="text-center text-muted py-5">
              まだデータが足りません。<br/>クイズを解くとここに分析結果が表示されます。
            </p>
          )}
        </div>
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          ダッシュボードに戻る
        </button>
      </div>
    </div>
  );
};

export default LearnerAnalysis;