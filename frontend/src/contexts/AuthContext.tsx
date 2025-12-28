import React, { createContext, useState, useContext, useEffect } from 'react';

// 必要な情報をすべて定義
interface AuthState {
  token: string | null;
  username: string | null;
  role: string | null;
  userId: number | null;
  companyId: number | null;
  company?: { name: string } | null;
}

interface AuthContextType {
  auth: AuthState | null;
  loading: boolean;
  login: (data: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ★修正: ここを React.ReactNode に書き換えました
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');
    const companyId = localStorage.getItem('companyId');
    const companyName = localStorage.getItem('companyName');

    if (token) {
      setAuth({
        token,
        username,
        role,
        userId: userId ? Number(userId) : null,
        companyId: companyId ? Number(companyId) : null,
        company: companyName ? { name: companyName } : null 
      });
    }
    setLoading(false);
  }, []);

  const login = (data: any) => {
    setAuth({
      token: data.token,
      username: data.username,
      role: data.role,
      userId: data.userId,
      companyId: data.companyId,
      company: data.company
    });

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    
    if (data.userId) localStorage.setItem('userId', String(data.userId));
    if (data.companyId) localStorage.setItem('companyId', String(data.companyId));
    
    if (data.company?.name) {
      localStorage.setItem('companyName', data.company.name);
    } else {
      localStorage.removeItem('companyName');
    }
  };

  const logout = () => {
    setAuth(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};