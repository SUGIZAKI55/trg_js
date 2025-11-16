import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'
// App.css をインポート（ダークモードのスタイルシート）
import './App.css' 

// ★★★ ここからChart.jsの登録設定 ★★★
import {
  Chart as ChartJS,
  ArcElement, // ドーナツグラフ・円グラフ
  Tooltip,    // グラフにホバーした時のツールチップ
  Legend,     // 凡例
  CategoryScale, // 棒グラフ（X軸）
  LinearScale,   // 棒グラフ（Y軸）
  BarElement,    // 棒グラフの「棒」
  Title        // グラフタイトル
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);
// ★★★ 登録ここまで ★★★

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)