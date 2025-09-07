import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ログイン成功時に受け取るデータの型定義
interface AuthData {
  token: string;
  username: string;
  role: string;
}

// Contextが提供するデータの型定義
interface AuthContextType {
  auth: AuthData | null; // 現在の認証情報（ログインしていなければnull）
  login: (authData: AuthData) => void; // ログイン処理を行う関数
  logout: () => void; // ログアウト処理を行う関数
}

// 「認証情報」専用のContextチャンネルを作成
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// アプリ全体に認証情報を提供する司令塔コンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  // ログイン状態を管理するための変数 (State)
  const [auth, setAuth] = useState<AuthData | null>(null);
  const navigate = useNavigate(); // 画面遷移を管理するフック

  // アプリが最初に読み込まれた時に一度だけ実行される処理
  useEffect(() => {
    // ブラウザの保存領域(localStorage)から前回のログイン情報を復元する
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    if (token && username && role) {
      setAuth({ token, username, role });
    }
  }, []);

  // ログイン関数
  const login = (authData: AuthData) => {
    setAuth(authData); // ログイン状態を更新
    // 次回以降のためにブラウザに情報を保存
    localStorage.setItem('token', authData.token);
    localStorage.setItem('username', authData.username);
    localStorage.setItem('role', authData.role);
    // 役割に応じて適切なダッシュボードに移動させる
    if (authData.role === 'master' || authData.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  // ログアウト関数
  const logout = () => {
    setAuth(null); // ログイン状態をリセット
    // ブラウザから情報を削除
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login'); // ログイン画面に移動
  };

  // 司令塔が管理する値（現在のログイン状態、login関数、logout関数）を配下のコンポーネントに提供
  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// 各コンポーネントから簡単にContextを呼び出すためのショートカット関数
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}