'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { EnteHierarchySelect } from '@/components/ente-hierarchy-select';
import { api } from '@/lib/api';
import { ArrowLeft, Save } from 'lucide-react';

interface EnteOption {
  id: string;
  nome: string;
  entePrincipal?: { id: string | null } | null;
}

const regimeOptions = [
  { value: 'ESPECIAL', label: 'Especial' },
  { value: 'COMUM', label: 'Comum' },
];

export default function EditarSaldoPage() {
  const router = useRouter();
  const params = useParams();
  const [entes, setEntes] = useState<EnteOption[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    enteId: '',
    regime: 'ESPECIAL',
    competencia: '',
    etiqueta: '',
    contaI: '',
    contaII: '',
    observacoes: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [entesData, saldo] = await Promise.all([
          api.entes.getAll(),
          api.saldos.get(params.id as string),
        ]);
        setEntes(entesData);
        setFormData({
          enteId: saldo.ente.id,
          regime: saldo.regime,
          competencia: saldo.competencia.substring(0, 7),
          etiqueta: saldo.etiqueta || '',
          contaI: String(saldo.contaI),
          contaII: String(saldo.contaII),
          observacoes: saldo.observacoes || '',
        });
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Erro ao carregar saldo' });
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await api.saldos.update(params.id as string, {
        ...formData,
        contaI: Number(formData.contaI || 0),
        contaII: Number(formData.contaII || 0),
        competencia: new Date(formData.competencia).toISOString(),
      });
      setMessage({ type: 'success', text: 'Saldo atualizado com sucesso!' });
      setTimeout(() => router.push('/dashboard/saldos'), 1200);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar saldo' });
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
            onClick={() => router.push('/dashboard/saldos')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Saldo</h1>
            <p className="text-gray-600 dark:text-gray-400">Atualize as informações do saldo</p>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnteHierarchySelect
                entes={entes}
                value={formData.enteId}
                onChange={(enteId) => setFormData({ ...formData, enteId })}
                label="Ente *"
                placeholder="Buscar ente ou navegar na hierarquia"
                helperText="Digite para filtrar ou expanda os entes vinculados"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Regime *</label>
                <select
                  value={formData.regime}
                  onChange={(e) => setFormData({ ...formData, regime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {regimeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Competência *</label>
                <input
                  type="month"
                  value={formData.competencia}
                  onChange={(e) => setFormData({ ...formData, competencia: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Etiqueta</label>
                <input
                  type="text"
                  value={formData.etiqueta}
                  onChange={(e) => setFormData({ ...formData, etiqueta: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conta I (R$) *</label>
                <input
                  type="number"
                  value={formData.contaI}
                  onChange={(e) => setFormData({ ...formData, contaI: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark;border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min={0}
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conta II (R$) *</label>
                <input
                  type="number"
                  value={formData.contaII}
                  onChange={(e) => setFormData({ ...formData, contaII: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark;border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min={0}
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/saldos')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="w-5 h-5" /> {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
