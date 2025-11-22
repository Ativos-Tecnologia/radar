'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { formatISODateToBR, normalizeBRDateInput, parseBRDateToISO } from '@/lib/utils';
import { ArrowLeft, Save } from 'lucide-react';

interface PrecatorioOption {
  id: string;
  npu: string;
  ente: { nome: string };
}

const tipoOptions = [
  { value: 'PARCELA', label: 'Parcela' },
  { value: 'ACORDO', label: 'Acordo' },
  { value: 'COMPENSACAO', label: 'Compensação' },
  { value: 'OUTROS', label: 'Outros' },
];

const statusOptions = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'PAGO', label: 'Pago' },
  { value: 'CANCELADO', label: 'Cancelado' },
];

export default function EditarPagamentoPage() {
  const router = useRouter();
  const params = useParams();
  const [precatorios, setPrecatorios] = useState<PrecatorioOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    precatorioId: '',
    dataPagamento: '',
    valor: '',
    tipo: 'PARCELA',
    status: 'PENDENTE',
    documento: '',
    observacoes: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [precatoriosData, pagamento] = await Promise.all([
          api.precatorios.getAll(),
          api.pagamentos.get(params.id as string),
        ]);
        setPrecatorios(precatoriosData);
        setFormData({
          precatorioId: pagamento.precatorio.id,
          dataPagamento: formatISODateToBR(pagamento.dataPagamento),
          valor: String(pagamento.valor),
          tipo: pagamento.tipo,
          status: pagamento.status,
          documento: pagamento.documento || '',
          observacoes: pagamento.observacoes || '',
        });
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Erro ao carregar pagamento' });
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const dataPagamentoISO = parseBRDateToISO(formData.dataPagamento);
      if (!dataPagamentoISO) {
        throw new Error('Data do pagamento inválida. Use o formato DD/MM/AAAA.');
      }

      await api.pagamentos.update(params.id as string, {
        ...formData,
        valor: Number(formData.valor || 0),
        dataPagamento: dataPagamentoISO,
        documento: formData.documento || undefined,
        observacoes: formData.observacoes || undefined,
      });
      setMessage({ type: 'success', text: 'Pagamento atualizado com sucesso!' });
      setTimeout(() => router.push('/dashboard/pagamentos'), 1200);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar pagamento' });
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
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/pagamentos')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Pagamento</h1>
            <p className="text-gray-600 dark:text-gray-400">Atualize os dados da parcela</p>
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

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Precatório *</label>
            <select
              value={formData.precatorioId}
              onChange={(e) => setFormData({ ...formData, precatorioId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Selecione...</option>
              {precatorios.map((precatorio) => (
                <option key={precatorio.id} value={precatorio.id}>
                  {precatorio.npu} — {precatorio.ente.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data *</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/AAAA"
                value={formData.dataPagamento}
                onChange={(e) => setFormData({ ...formData, dataPagamento: normalizeBRDateInput(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valor (R$) *</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo *</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {tipoOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Documento</label>
              <input
                type="text"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
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
              onClick={() => router.push('/dashboard/pagamentos')}
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
