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
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement, // ★追加
  LineElement,  // ★追加
  RadialLinearScale, // ★追加 (レーダーチャート用)
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement, // ★追加
  LineElement,  // ★追加
  RadialLinearScale // ★追加
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