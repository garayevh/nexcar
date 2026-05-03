'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from './api';

interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: { full_name: string; email: string; password: string; phone: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('nexcar_token');
    const u = localStorage.getItem('nexcar_user');
    if (t && u) {
      setToken(t);
      setUser(JSON.parse(u));
    }
    setLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    const data = await authApi.login(phone, password);
    const userData = { id: data.user_id, name: data.name, phone, role: data.role };
    localStorage.setItem('nexcar_token', data.access_token);
    localStorage.setItem('nexcar_user', JSON.stringify(userData));
    setToken(data.access_token);
    setUser(userData);
  };

  const register = async (formData: { full_name: string; email: string; password: string; phone: string }) => {
    const data = await authApi.register(formData);
    const userData = { id: data.user_id, name: data.name, phone: formData.phone, role: data.role };
    localStorage.setItem('nexcar_token', data.access_token);
    localStorage.setItem('nexcar_user', JSON.stringify(userData));
    setToken(data.access_token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('nexcar_token');
    localStorage.removeItem('nexcar_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
