"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginRequest } from '@/services/auth.service';
import { User, UserRole } from '@/types/user';
import { apiClient } from '@/lib/axios';

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

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const response = await loginRequest(email, senha);

    // Token agora é enviado via cookie HttpOnly pelo backend
    // Salvar apenas dados do usuário
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = async () => {
    // Chamar endpoint de logout para limpar cookie
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }

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
    isAdmin: user?.role === UserRole.ADMIN,
    isOperador: user?.role === UserRole.OPERADOR,
    isVisualizador: user?.role === UserRole.VISUALIZADOR,
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
