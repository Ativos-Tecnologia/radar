'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { EnteHierarchySelect } from '@/components/ente-hierarchy-select';
import { api } from '@/lib/api';
import { Save, ArrowLeft } from 'lucide-react';

interface EnteOption {
  id: string;
  nome: string;
  tipo: string;
  entePrincipal?: { id: string | null } | null;
}

interface EnteForm {
  nome: string;
  cnpj: string;
  tipo: string;
  uf: string;
  regime: 'ESPECIAL' | 'COMUM';
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

const regimeOptions = [
  { value: 'ESPECIAL', label: 'Especial' },
  { value: 'COMUM', label: 'Comum' },
];

const ufOptions = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function NovoEntePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [entes, setEntes] = useState<EnteOption[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState<EnteForm>({
    nome: '',
    cnpj: '',
    tipo: 'MUNICIPIO',
    uf: '',
    regime: 'ESPECIAL',
    entePrincipalId: '',
    observacoes: '',
    ativo: true,
  });

  useEffect(() => {
    loadEntes();
  }, []);

  const loadEntes = async () => {
    try {
      const data = await api.entes.getAll();
      setEntes(data);
    } catch (error) {
      console.error('Erro ao carregar entes:', error);
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
        regime: formData.regime,
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

      await api.entes.create(dataToSend);
      setMessage({ type: 'success', text: 'Ente criado com sucesso!' });
      
      setTimeout(() => {
        router.push('/dashboard/entes');
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao criar ente',
      });
    } finally {
      setLoading(false);
    }
  };

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
              Novo Ente
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Cadastre um novo ente público
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
                  Regime *
                </label>
                <select
                  value={formData.regime}
                  onChange={(e) => setFormData({ ...formData, regime: e.target.value as 'ESPECIAL' | 'COMUM' })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {regimeOptions.map((option) => (
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

              <EnteHierarchySelect
                entes={entes}
                value={formData.entePrincipalId}
                onChange={(entePrincipalId) => setFormData({ ...formData, entePrincipalId })}
                label="Ente Principal"
                helperText="Selecione o ente ao qual este estará vinculado"
                placeholder="Busque por nome ou navegue na árvore"
                allowClear
                clearLabel="Nenhum (Ente Principal)"
              />

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
              {loading ? 'Salvando...' : 'Salvar Ente'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
