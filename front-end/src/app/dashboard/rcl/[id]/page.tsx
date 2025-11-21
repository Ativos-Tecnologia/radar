'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { ArrowLeft, BarChart3, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const tipoLabels: Record<string, string> = {
  PREVISTO: 'Previsto',
  REALIZADO: 'Realizado',
};

interface RclDetail {
  id: string;
  ano: number;
  valor: number;
  percentual: number;
  tipo: 'PREVISTO' | 'REALIZADO';
  ativo: boolean;
  observacao?: string | null;
  createdAt: string;
  updatedAt: string;
  ente: {
    id: string;
    nome: string;
    tipo: string;
  };
}

export default function ViewRclPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAdmin } = useAuth();
  const [data, setData] = useState<RclDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.rcl
      .get(params.id as string)
      .then(setData)
      .catch((err) => setError(err.message || 'Erro ao carregar registro'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (value: string) =>
    new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
            {error || 'Registro não encontrado'}
          </div>
          <button
            onClick={() => router.push('/dashboard/rcl')}
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/rcl')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {data.ente.nome}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Ano {data.ano} • {tipoLabels[data.tipo]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(user?.role === 'ADMIN' || user?.role === 'OPERADOR') && (
              <button
                onClick={() => router.push(`/dashboard/rcl/${data.id}/editar`)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Edit className="w-4 h-4" />
                Editar
              </button>
            )}
            {isAdmin && (
              <button
                onClick={async () => {
                  if (!confirm('Excluir este registro de RCL?')) return;
                  await api.rcl.delete(data.id);
                  router.push('/dashboard/rcl');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Informações</h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Valor</dt>
              <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(data.valor)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">% RCL</dt>
              <dd className="text-lg font-semibold text-gray-900 dark:text-white">
                {data.percentual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
              <dd>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    data.ativo
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}
                >
                  {data.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm text-gray-500 dark:text-gray-400">Observação</dt>
              <dd className="text-gray-900 dark:text-gray-200 whitespace-pre-wrap">
                {data.observacao || '—'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Criado em</p>
          <p className="text-gray-900 dark:text-white">{formatDate(data.createdAt)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Atualizado em</p>
          <p className="text-gray-900 dark:text-white">{formatDate(data.updatedAt)}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
