// ★ ReactNode を追加しました
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// 認証情報の型定義
interface AuthState {
  token: string | null;
  username: string | null;
  role: string | null; // 'master' | 'admin' | 'staff' など
}

// Contextの型定義
interface AuthContextType {
  auth: AuthState | null;
  login: (token: string, username: string, role: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ★ children の型定義に ReactNode を使用
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // アプリ起動時にローカルストレージからログイン情報を復元
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');

    if (token && username && role) {
      setAuth({ token, username, role });
    }
    setLoading(false);
  }, []);

  // ログイン処理: 3つの情報を受け取って保存
  const login = (token: string, username: string, role: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    localStorage.setItem('role', role);
    setAuth({ token, username, role });
  };

  // ログアウト処理: 情報を全て削除
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};