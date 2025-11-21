'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { Save, ArrowLeft } from 'lucide-react';

const tipoOptions = [
  { value: 'TJ', label: 'Tribunal de Justiça' },
  { value: 'TRT', label: 'Tribunal Regional do Trabalho' },
  { value: 'TRF', label: 'Tribunal Regional Federal' },
  { value: 'TST', label: 'Tribunal Superior do Trabalho' },
  { value: 'TSE', label: 'Tribunal Superior Eleitoral' },
  { value: 'STF', label: 'Supremo Tribunal Federal' },
  { value: 'STJ', label: 'Superior Tribunal de Justiça' },
];

const ufOptions = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

export default function EditarTribunalPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    sigla: '',
    tipo: 'TJ',
    uf: '',
    regiao: '',
    observacoes: '',
    ativo: true,
  });

  useEffect(() => {
    load();
  }, [params.id]);

  const load = async () => {
    try {
      setLoadingData(true);
      const data = await api.tribunais.get(params.id as string);
      setFormData({
        nome: data.nome,
        sigla: data.sigla,
        tipo: data.tipo,
        uf: data.uf || '',
        regiao: data.regiao ? String(data.regiao) : '',
        observacoes: data.observacoes || '',
        ativo: data.ativo,
      });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao carregar tribunal' });
    } finally {
      setLoadingData(false);
    }
  };

  const showRegiao = formData.tipo === 'TRT' || formData.tipo === 'TRF';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload: any = {
        nome: formData.nome,
        sigla: formData.sigla,
        tipo: formData.tipo,
        ativo: formData.ativo,
      };
      if (formData.uf) payload.uf = formData.uf;
      if (formData.observacoes) payload.observacoes = formData.observacoes;
      if (showRegiao && formData.regiao) payload.regiao = Number(formData.regiao);

      await api.tribunais.update(params.id as string, payload);
      setMessage({ type: 'success', text: 'Tribunal atualizado!' });
      setTimeout(() => router.push('/dashboard/tribunais'), 1000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar tribunal' });
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
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/tribunais')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Tribunal</h1>
            <p className="text-gray-600 dark:text-gray-400">Atualize os dados conforme necessário</p>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome *</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sigla *</label>
                <input
                  type="text"
                  value={formData.sigla}
                  onChange={(e) => setFormData({ ...formData, sigla: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo *</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {tipoOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">UF</label>
                <select
                  value={formData.uf}
                  onChange={(e) => setFormData({ ...formData, uf: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {ufOptions.map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
              {showRegiao && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Região *</label>
                  <input
                    type="number"
                    value={formData.regiao}
                    onChange={(e) => setFormData({ ...formData, regiao: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    min={1}
                    max={24}
                    required={showRegiao}
                  />
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  rows={3}
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
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tribunal ativo</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/tribunais')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >Cancelar</button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
