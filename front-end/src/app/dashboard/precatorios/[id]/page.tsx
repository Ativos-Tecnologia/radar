'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { ArrowLeft, FileText } from 'lucide-react';

interface PrecatorioDetail {
  id: string;
  npu: string;
  processoOriginario?: string | null;
  natureza: 'ALIMENTAR' | 'COMUM' | 'OUTROS';
  fonte?: string | null;
  ordemCronologica?: string | null;
  anoLoa?: number | null;
  dataLoa?: string | null;
  dataTransmissao?: string | null;
  valorAcao?: number | null;
  advogadosDevedora?: string | null;
  advogadosCredora?: string | null;
  observacoes?: string | null;
  dataAtualizacao?: string | null;
  ente: { id: string; nome: string };
  tribunal: { id: string; nome: string; sigla: string };
  precatorioEventos: { id: string; data: string; valor: number; tipo: string }[];
}

const naturezaLabels = {
  ALIMENTAR: 'Alimentar',
  COMUM: 'Comum',
  OUTROS: 'Outros',
} as const;

export default function PrecatorioDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [data, setData] = useState<PrecatorioDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.precatorios
      .get(params.id as string)
      .then(setData)
      .catch((err) => setError(err.message || 'Erro ao carregar precatório'))
      .finally(() => setLoading(false));
  }, [params.id]);

  const formatCurrency = (value?: number | null) =>
    value != null
      ? Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : '—';

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleDateString('pt-BR') : '—';

  const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString('pt-BR') : '—';

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
        <div className="max-w-4xl mx-auto">
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200">
            {error || 'Precatório não encontrado'}
          </div>
          <button
            onClick={() => router.push('/dashboard/precatorios')}
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/precatorios')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{data.npu}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {data.ente.nome} • {data.tribunal.sigla} - {data.tribunal.nome}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Informações gerais</h2>
          </div>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Processo originário</dt>
              <dd className="text-gray-900 dark:text-gray-100">{data.processoOriginario || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Natureza</dt>
              <dd className="text-gray-900 dark:text-gray-100">{naturezaLabels[data.natureza]}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Fonte</dt>
              <dd className="text-gray-900 dark:text-gray-100">{data.fonte || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Ordem cronológica</dt>
              <dd className="text-gray-900 dark:text-gray-100">{data.ordemCronologica || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Ano LOA</dt>
              <dd className="text-gray-900 dark:text-gray-100">{data.anoLoa ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Valor da ação</dt>
              <dd className="text-gray-900 dark:text-gray-100">{formatCurrency(data.valorAcao)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Data LOA</dt>
              <dd className="text-gray-900 dark:text-gray-100">{formatDate(data.dataLoa)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Data de transmissão</dt>
              <dd className="text-gray-900 dark:text-gray-100">{formatDate(data.dataTransmissao)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Advogados (devedora)</dt>
              <dd className="text-gray-900 dark:text-gray-100">{data.advogadosDevedora || '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Advogados (credora)</dt>
              <dd className="text-gray-900 dark:text-gray-100">{data.advogadosCredora || '—'}</dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-sm text-gray-500 dark:text-gray-400">Observações</dt>
              <dd className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {data.observacoes || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-gray-500 dark:text-gray-400">Última atualização</dt>
              <dd className="text-gray-900 dark:text-gray-100">{formatDateTime(data.dataAtualizacao)}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Eventos</h2>
          {data.precatorioEventos.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Nenhum evento registrado.</p>
          ) : (
            <div className="space-y-3">
              {data.precatorioEventos.map((evento) => (
                <div
                  key={evento.id}
                  className="flex flex-wrap items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3"
                >
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(evento.data).toLocaleDateString('pt-BR')}</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {Number(evento.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                      {evento.tipo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
