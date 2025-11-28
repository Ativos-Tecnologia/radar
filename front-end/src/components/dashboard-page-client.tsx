'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { useEnte } from '@/contexts/ente-context';

interface StatCard {
  icon: typeof Users;
  label: string;
  value: number | null;
  color: string;
  visible: boolean;
}

export function DashboardPageClient() {
  const { user } = useAuth();
  const { enteAtual } = useEnte();
  const [stats, setStats] = useState({
    users: null as number | null,
    entes: null as number | null,
    precatorios: null as number | null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [users, entes, precatorios] = await Promise.all([
          user?.role === 'ADMIN' ? api.users.list() : Promise.resolve([]),
          api.entes.getAll(),
          api.precatorios.getAll(),
        ]);

        const precatoriosFiltrados = enteAtual
          ? precatorios.filter((p: any) => p.ente?.id === enteAtual.id)
          : precatorios;

        setStats({
          users: user?.role === 'ADMIN' ? users.length : null,
          entes: entes.length,
          precatorios: precatoriosFiltrados.length,
        });
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user?.role, enteAtual?.id]);

  const statCards: StatCard[] = [
    {
      icon: Users,
      label: 'Usuários',
      value: stats.users,
      color: 'bg-blue-500',
      visible: user?.role === 'ADMIN',
    },
    {
      icon: Building2,
      label: 'Entes',
      value: stats.entes,
      color: 'bg-green-500',
      visible: true,
    },
    {
      icon: FileText,
      label: 'Precatórios',
      value: stats.precatorios,
      color: 'bg-purple-500',
      visible: true,
    },
  ];

  const visibleStats = statCards.filter((stat) => stat.visible);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Bem-vindo(a), {user?.nomeCompleto}</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {loading ? '...' : stat.value ?? '—'}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informações do Sistema</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Versão:</span>
              <span className="text-gray-900 dark:text-white font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Perfil:</span>
              <span className="text-gray-900 dark:text-white font-medium">{user?.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Departamento:</span>
              <span className="text-gray-900 dark:text-white font-medium">{user?.departamento || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
