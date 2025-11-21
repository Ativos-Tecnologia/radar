'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/contexts/auth-context';
import { Users, Building2, FileText, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      icon: Users,
      label: 'Usuários',
      value: '-',
      color: 'bg-blue-500',
      visible: user?.role === 'ADMIN',
    },
    {
      icon: Building2,
      label: 'Entes',
      value: '-',
      color: 'bg-green-500',
      visible: true,
    },
    {
      icon: FileText,
      label: 'Precatórios',
      value: '-',
      color: 'bg-purple-500',
      visible: true,
    },
    {
      icon: DollarSign,
      label: 'Pagamentos',
      value: '-',
      color: 'bg-orange-500',
      visible: true,
    },
  ];

  const visibleStats = stats.filter(stat => stat.visible);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Bem-vindo(a), {user?.nomeCompleto}
          </p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleStats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Informações do sistema */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informações do Sistema
          </h2>
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
              <span className="text-gray-900 dark:text-white font-medium">
                {user?.departamento || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Próximos passos */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            🚀 Próximos Passos
          </h2>
          <ul className="space-y-2 text-blue-800 dark:text-blue-200">
            {user?.role === 'ADMIN' && (
              <li>• Acesse <strong>Usuários</strong> para gerenciar o time</li>
            )}
            <li>• Cadastre os <strong>Entes</strong> no sistema</li>
            <li>• Importe ou cadastre <strong>Precatórios</strong></li>
            <li>• Acompanhe os <strong>Pagamentos</strong></li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
