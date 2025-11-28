"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginRequest } from '@/services/auth.service';

interface User {
  id: string;
  nomeCompleto: string;
  email: string;
  role: 'ADMIN' | 'OPERADOR' | 'VISUALIZADOR';
  departamento?: string;
  fotoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  isAdmin: boolean;
  isOperador: boolean;
  isVisualizador: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await loginRequest(email, senha);
    
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAdmin: user?.role === 'ADMIN',
    isOperador: user?.role === 'OPERADOR',
    isVisualizador: user?.role === 'VISUALIZADOR',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
