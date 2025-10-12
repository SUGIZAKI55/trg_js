import { createContext, useState, useContext, useEffect } from 'react';
// エラーの原因だったReactNodeを type-only import に分離します
import type { ReactNode } from 'react';

// 認証データの型定義
interface Auth {
  token: string;
  username: string;
  role: string;
}

// Contextが提供する値の型定義
interface AuthContextType {
  auth: Auth | null;
  login: (authData: Auth) => void;
  logout: () => void;
}

// Contextの作成
const AuthContext = createContext<AuthContextType | null>(null);

// Contextを提供するためのProviderコンポーネント
export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(null);

  // --- ログイン状態を永続化させる処理 ---
  // コンポーネントが最初に読み込まれた時、localStorageから認証情報を復元する
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        setAuth(JSON.parse(storedAuth));
      } catch (e) {
        console.error("Failed to parse auth data from localStorage", e);
        localStorage.removeItem('auth');
      }
    }
  }, []);

  // ログイン処理
  const login = (authData: Auth) => {
    setAuth(authData);
    // ログイン情報をlocalStorageに保存
    localStorage.setItem('auth', JSON.stringify(authData));
  };

  // ログアウト処理
  const logout = () => {
    setAuth(null);
    // localStorageからログイン情報を削除
    localStorage.removeItem('auth');
  };

  const value = { auth, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Contextを簡単に利用するためのカスタムフック
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}