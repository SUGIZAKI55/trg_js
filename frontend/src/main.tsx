import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';      // これをインポート
import { AuthProvider } from './contexts/AuthContext.tsx'; // これをインポート

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>  {/* Appをこれで囲む */}
      <AuthProvider> {/* さらにこれで囲む */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);