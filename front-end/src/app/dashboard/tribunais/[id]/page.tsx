'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { ArrowLeft, Scale, FileText } from 'lucide-react';

const tipoLabels: Record<string, string> = {
  TJ: 'Tribunal de Justiça',
  TRT: 'Tribunal Regional do Trabalho',
  TRF: 'Tribunal Regional Federal',
  TST: 'Tribunal Superior do Trabalho',
  TSE: 'Tribunal Superior Eleitoral',
  STF: 'Supremo Tribunal Federal',
  STJ: 'Superior Tribunal de Justiça',
};

interface TribunalDetail {
  id: string;
  nome: string;
  sigla: string;
  tipo: string;
  uf: string | null;
  regiao: number | null;
  observacoes: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function VisualizarTribunalPage() {
  const params = useParams();
  const router = useRouter();
  const [tribunal, setTribunal] = useState<TribunalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTribunal();
  }, [params.id]);

  const loadTribunal = async () => {
    try {
      setLoading(true);
      const data = await api.tribunais.get(params.id as string);
      setTribunal(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar tribunal');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !tribunal) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
            {error || 'Tribunal não encontrado'}
          </div>
          <button
            onClick={() => router.push('/dashboard/tribunais')}
            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-900 dark:text-blue-400"
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/tribunais')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tribunal.nome}</h1>
              <p className="text-gray-600 dark:text-gray-400">Visualização detalhada</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/dashboard/tribunais/${tribunal.id}/editar`)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Scale className="w-5 h-5" /> Editar
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Informações Gerais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sigla</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{tribunal.sigla}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Tipo</p>
              <p className="text-lg text-gray-900 dark:text-white">{tipoLabels[tribunal.tipo]}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">UF</p>
              <p className="text-gray-900 dark:text-white">{tribunal.uf || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Região</p>
              <p className="text-gray-900 dark:text-white">{tribunal.regiao ? `${tribunal.regiao}ª Região` : '-'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${tribunal.ativo ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                {tribunal.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            {tribunal.observacoes && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Observações</p>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                  {tribunal.observacoes}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Criado em</p>
          <p className="text-gray-900 dark:text-white">{formatDate(tribunal.createdAt)}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Atualizado em</p>
          <p className="text-gray-900 dark:text-white">{formatDate(tribunal.updatedAt)}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
