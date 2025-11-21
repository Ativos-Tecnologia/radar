'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { ArrowLeft, Edit, Building2, FileText } from 'lucide-react';

interface Ente {
  id: string;
  nome: string;
  cnpj: string | null;
  tipo: string;
  uf: string | null;
  ativo: boolean;
  observacoes: string | null;
  entePrincipal?: {
    id: string;
    nome: string;
    tipo: string;
  } | null;
  entesVinculados?: Array<{
    id: string;
    nome: string;
    tipo: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const tipoLabels: Record<string, string> = {
  MUNICIPIO: 'Município',
  ESTADO: 'Estado',
  UNIAO: 'União',
  AUTARQUIA: 'Autarquia',
  FUNDACAO: 'Fundação',
  EMPRESA_PUBLICA: 'Empresa Pública',
  SOCIEDADE_ECONOMIA_MISTA: 'Sociedade de Economia Mista',
};

export default function VisualizarEntePage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [ente, setEnte] = useState<Ente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'OPERADOR';

  useEffect(() => {
    loadEnte();
  }, [params.id]);

  const loadEnte = async () => {
    try {
      setLoading(true);
      const data = await api.entes.get(params.id as string);
      setEnte(data);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar ente');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (error || !ente) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-4 rounded-lg">
            {error || 'Ente não encontrado'}
          </div>
          <button
            onClick={() => router.push('/dashboard/entes')}
            className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para lista
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard/entes')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {ente.nome}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Detalhes do ente público
              </p>
            </div>
          </div>
          {canEdit && (
            <button
              onClick={() => router.push(`/dashboard/entes/${ente.id}/editar`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-5 h-5" />
              Editar
            </button>
          )}
        </div>

        {/* Status Badge */}
        <div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              ente.ativo
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}
          >
            {ente.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </div>

        {/* Informações Básicas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Informações Básicas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Nome
              </label>
              <p className="text-gray-900 dark:text-white">{ente.nome}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                CNPJ
              </label>
              <p className="text-gray-900 dark:text-white">{ente.cnpj || '-'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Tipo
              </label>
              <span className="inline-flex px-2 py-1 text-sm font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {tipoLabels[ente.tipo]}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                UF
              </label>
              <p className="text-gray-900 dark:text-white">{ente.uf || '-'}</p>
            </div>
          </div>
        </div>

        {/* Relacionamentos */}
        {(ente.entePrincipal || (ente.entesVinculados && ente.entesVinculados.length > 0)) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Relacionamentos
              </h2>
            </div>

            {ente.entePrincipal && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Ente Principal
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {ente.entePrincipal.nome}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {tipoLabels[ente.entePrincipal.tipo]}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {ente.entesVinculados && ente.entesVinculados.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Entes Vinculados ({ente.entesVinculados.length})
                </label>
                <div className="space-y-2">
                  {ente.entesVinculados.map((vinculado) => (
                    <div
                      key={vinculado.id}
                      className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {vinculado.nome}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {tipoLabels[vinculado.tipo]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Observações */}
        {ente.observacoes && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Observações
              </h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {ente.observacoes}
            </p>
          </div>
        )}

        {/* Metadados */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Criado em:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {formatDate(ente.createdAt)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Atualizado em:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {formatDate(ente.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
