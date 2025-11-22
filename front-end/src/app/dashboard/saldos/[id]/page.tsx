'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { ArrowLeft, PiggyBank } from 'lucide-react';

interface SaldoDetail {
  id: string;
  etiqueta?: string | null;
  regime: 'ESPECIAL' | 'ORDINARIO';
  contaI: number;
  contaII: number;
  competencia: string;
  observacoes?: string | null;
  createdAt: string;
  updatedAt: string;
  ente: { id: string; nome: string };
}

const regimeLabels = {
  ESPECIAL: 'Especial',
  ORDINARIO: 'Ordinário',
} as const;

export default function SaldoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<SaldoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.saldos
      .get(params.id as string)
      .then(setData)
      .catch((err) => setError(err.message || 'Erro ao carregar saldo'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const formatCurrency = (value: number) =>
    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatMonth = (value: string) =>
    new Date(value).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

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
            {error || 'Saldo não encontrado'}
          </div>
          <button
            onClick={() => router.push('/dashboard/saldos')}
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/saldos')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{data.ente.nome}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Competência: {formatMonth(data.competencia)}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <PiggyBank className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Informações</h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Etiqueta</dt>
              <dd className="text-lg text-gray-900 dark:text-white">{data.etiqueta || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Regime</dt>
              <dd className="text-lg text-gray-900 dark:text-white">{regimeLabels[data.regime]}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Conta I</dt>
              <dd className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(data.contaI)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Conta II</dt>
              <dd className="text-lg font-semibold text-gray-900 dark:text-white">{formatCurrency(data.contaII)}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm text-gray-500 dark:text-gray-400">Observações</dt>
              <dd className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{data.observacoes || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Criado em</dt>
              <dd className="text-gray-900 dark:text-gray-100">{new Date(data.createdAt).toLocaleString('pt-BR')}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Atualizado em</dt>
              <dd className="text-gray-900 dark:text-gray-100">{new Date(data.updatedAt).toLocaleString('pt-BR')}</dd>
            </div>
          </dl>
        </div>
      </div>
    </DashboardLayout>
  );
}
