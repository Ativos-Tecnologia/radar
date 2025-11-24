'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { ArrowLeft, DollarSign } from 'lucide-react';

interface PagamentoDetail {
  id: string;
  dataPagamento: string;
  valor: number;
  tipo: 'PARCELA' | 'ACORDO' | 'COMPENSACAO' | 'OUTROS';
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
  documento?: string | null;
  observacoes?: string | null;
  createdAt: string;
  updatedAt: string;
  precatorio: {
    id: string;
    npu: string;
    ente: { nome: string };
    tribunal: { nome: string };
  };
}

const statusLabels = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  CANCELADO: 'Cancelado',
} as const;

const tipoLabels = {
  PARCELA: 'Parcela',
  ACORDO: 'Acordo',
  COMPENSACAO: 'Compensação',
  OUTROS: 'Outros',
} as const;

export default function PagamentoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<PagamentoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.pagamentos
      .get(params.id as string)
      .then(setData)
      .catch((err) => setError(err.message || 'Erro ao carregar pagamento'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const formatCurrency = (value: number) =>
    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (value: string, options?: Intl.DateTimeFormatOptions) => {
    const date = new Date(value);
    // Se options incluir timeStyle, usar toLocaleString ao invés de toLocaleDateString
    if (options && 'timeStyle' in options) {
      return date.toLocaleString('pt-BR', options);
    }
    return date.toLocaleDateString('pt-BR', options);
  };

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
            {error || 'Pagamento não encontrado'}
          </div>
          <button
            onClick={() => router.push('/dashboard/pagamentos')}
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
            onClick={() => router.push('/dashboard/pagamentos')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pagamento</h1>
            <p className="text-gray-600 dark:text-gray-400">Precatório {data.precatorio.npu}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Informações gerais</h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Precatório</dt>
              <dd className="text-lg text-gray-900 dark:text-white">{data.precatorio.npu}</dd>
              <p className="text-sm text-gray-500 dark:text-gray-400">{data.precatorio.ente.nome}</p>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Tribunal</dt>
              <dd className="text-lg text-gray-900 dark:text-white">{data.precatorio.tribunal.nome}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Data</dt>
              <dd className="text-lg text-gray-900 dark:text-white">{formatDate(data.dataPagamento)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Valor</dt>
              <dd className="text-2xl font-semibold text-gray-900 dark:text-white">{formatCurrency(data.valor)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Tipo</dt>
              <dd className="text-lg text-gray-900 dark:text-white">{tipoLabels[data.tipo]}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
              <dd className="text-lg text-gray-900 dark:text-white">{statusLabels[data.status]}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Documento</dt>
              <dd className="text-gray-900 dark:text-gray-100">{data.documento || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Observações</dt>
              <dd className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{data.observacoes || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Criado em</dt>
              <dd className="text-gray-900 dark:text-gray-100">{formatDate(data.createdAt, { dateStyle: 'short', timeStyle: 'short' })}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Atualizado em</dt>
              <dd className="text-gray-900 dark:text-gray-100">{formatDate(data.updatedAt, { dateStyle: 'short', timeStyle: 'short' })}</dd>
            </div>
          </dl>
        </div>
      </div>
    </DashboardLayout>
  );
}
