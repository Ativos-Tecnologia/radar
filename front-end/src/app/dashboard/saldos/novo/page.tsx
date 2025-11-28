'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { EnteHierarchySelect } from '@/components/ente-hierarchy-select';
import { api } from '@/lib/api';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';

interface EnteOption {
  id: string;
  nome: string;
  regime?: 'ESPECIAL' | 'COMUM';
  entePrincipal?: { id: string | null } | null;
}

interface LancamentoForm {
  etiqueta: string;
  contaI: string;
  contaII: string;
}

export default function NovoSaldoPage() {
  const router = useRouter();
  const [entes, setEntes] = useState<EnteOption[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    enteId: '',
    regime: 'ESPECIAL' as 'ESPECIAL' | 'COMUM',
    competencia: '',
    observacoes: '',
  });
  const [lancamentos, setLancamentos] = useState<LancamentoForm[]>([
    { etiqueta: 'Conta vinculada principal', contaI: '', contaII: '' },
  ]);

  const selectedEnte = useMemo(
    () => entes.find((e) => e.id === formData.enteId),
    [entes, formData.enteId]
  );

  useEffect(() => {
    if (selectedEnte?.regime) {
      setFormData((prev) => ({ ...prev, regime: selectedEnte.regime! }));
    }
  }, [selectedEnte]);

  useEffect(() => {
    api.entes
      .getAll()
      .then(setEntes)
      .catch(() => setMessage({ type: 'error', text: 'Erro ao carregar entes' }));
  }, []);

  const handleLancamentoChange = (index: number, field: keyof LancamentoForm, value: string) => {
    setLancamentos((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addLancamento = () => setLancamentos((prev) => [...prev, { etiqueta: '', contaI: '', contaII: '' }]);
  const removeLancamento = (index: number) => setLancamentos((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const principal = lancamentos[0];
      await api.saldos.create({
        enteId: formData.enteId,
        etiqueta: principal.etiqueta || undefined,
        regime: formData.regime,
        contaI: Number(principal.contaI || 0),
        contaII: Number(principal.contaII || 0),
        competencia: new Date(formData.competencia).toISOString(),
        observacoes: formData.observacoes,
      });
      setMessage({ type: 'success', text: 'Saldo registrado com sucesso!' });
      setTimeout(() => router.push('/dashboard/saldos'), 1200);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao registrar saldo' });
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Novo Saldo</h1>
            <p className="text-gray-600 dark:text-gray-400">Registre o saldo em conta vinculada</p>
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
                <input
                  type="text"
                  readOnly
                  value={
                    formData.regime === 'ESPECIAL'
                      ? 'Especial'
                      : formData.regime === 'COMUM'
                      ? 'Comum'
                      : ''
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Selecione um ente para ver o regime"
                />
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Contas vinculadas</h2>
              <button
                type="button"
                onClick={addLancamento}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>

            <div className="space-y-4">
              {lancamentos.map((lancamento, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Etiqueta</label>
                    <input
                      type="text"
                      value={lancamento.etiqueta}
                      onChange={(e) => handleLancamentoChange(index, 'etiqueta', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conta I (R$)</label>
                    <input
                      type="number"
                      value={lancamento.contaI}
                      onChange={(e) => handleLancamentoChange(index, 'contaI', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min={0}
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conta II (R$)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={lancamento.contaII}
                        onChange={(e) => handleLancamentoChange(index, 'contaII', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min={0}
                        step="0.01"
                      />
                      <button
                        type="button"
                        onClick={() => removeLancamento(index)}
                        className="p-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled={lancamentos.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
              <Save className="w-5 h-5" /> {loading ? 'Salvando...' : 'Salvar saldo'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
