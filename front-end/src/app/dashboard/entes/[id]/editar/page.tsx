'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { Save, ArrowLeft } from 'lucide-react';

interface EnteForm {
  nome: string;
  cnpj: string;
  tipo: string;
  uf: string;
  entePrincipalId: string;
  observacoes: string;
  ativo: boolean;
}

const tipoOptions = [
  { value: 'MUNICIPIO', label: 'Município' },
  { value: 'ESTADO', label: 'Estado' },
  { value: 'UNIAO', label: 'União' },
  { value: 'AUTARQUIA', label: 'Autarquia' },
  { value: 'FUNDACAO', label: 'Fundação' },
  { value: 'EMPRESA_PUBLICA', label: 'Empresa Pública' },
  { value: 'SOCIEDADE_ECONOMIA_MISTA', label: 'Sociedade de Economia Mista' },
];

const ufOptions = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function EditarEntePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [entes, setEntes] = useState<any[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<EnteForm>({
    nome: '',
    cnpj: '',
    tipo: 'MUNICIPIO',
    uf: '',
    entePrincipalId: '',
    observacoes: '',
    ativo: true,
  });

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoadingData(true);
      const [enteData, entesData] = await Promise.all([
        api.entes.get(params.id as string),
        api.entes.getAll(),
      ]);

      setFormData({
        nome: enteData.nome,
        cnpj: enteData.cnpj || '',
        tipo: enteData.tipo,
        uf: enteData.uf || '',
        entePrincipalId: enteData.entePrincipal?.id || '',
        observacoes: enteData.observacoes || '',
        ativo: enteData.ativo,
      });

      // Filtrar entes para não mostrar o próprio ente como opção de ente principal
      setEntes(entesData.filter((e: any) => e.id !== params.id));
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao carregar dados',
      });
    } finally {
      setLoadingData(false);
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData({ ...formData, cnpj: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const dataToSend: any = {
        nome: formData.nome,
        tipo: formData.tipo,
        ativo: formData.ativo,
      };

      if (formData.cnpj) {
        dataToSend.cnpj = formData.cnpj;
      }

      if (formData.uf) {
        dataToSend.uf = formData.uf;
      }

      if (formData.entePrincipalId) {
        dataToSend.entePrincipalId = formData.entePrincipalId;
      }

      if (formData.observacoes) {
        dataToSend.observacoes = formData.observacoes;
      }

      await api.entes.update(params.id as string, dataToSend);
      setMessage({ type: 'success', text: 'Ente atualizado com sucesso!' });
      
      setTimeout(() => {
        router.push('/dashboard/entes');
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao atualizar ente',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/entes')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Editar Ente
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Atualize as informações do ente público
            </p>
          </div>
        </div>

        {/* Mensagens */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Informações Básicas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Ex: Município de São Paulo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  CNPJ
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={handleCNPJChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {tipoOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  UF
                </label>
                <select
                  value={formData.uf}
                  onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {ufOptions.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ente Principal
                </label>
                <select
                  value={formData.entePrincipalId}
                  onChange={(e) => setFormData({ ...formData, entePrincipalId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Nenhum (Ente Principal)</option>
                  {entes.map((ente) => (
                    <option key={ente.id} value={ente.id}>
                      {ente.nome}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Selecione se este ente está vinculado a outro
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Informações adicionais..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ente ativo
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/entes')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
