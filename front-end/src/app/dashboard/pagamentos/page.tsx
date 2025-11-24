'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import {
  formatISODateToBR,
  normalizeBRDateInput,
  parseBRDateToISO,
} from '@/lib/utils';
import { DollarSign, Edit, Eye, Filter, Plus, Search, Trash2 } from 'lucide-react';
import { Pagination } from '@/components/pagination';

interface Pagamento {
  id: string;
  precatorioId: string;
  dataPagamento: string;
  valor: number;
  tipo: 'PARCELA' | 'ACORDO' | 'COMPENSACAO' | 'OUTROS';
  status: 'PENDENTE' | 'PAGO' | 'CANCELADO';
  documento?: string | null;
  observacoes?: string | null;
  precatorio: {
    id: string;
    npu: string;
    ente: { id: string; nome: string };
    tribunal: { id: string; nome: string };
  };
}

const statusLabels: Record<Pagamento['status'], string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  CANCELADO: 'Cancelado',
};

const tipoLabels: Record<Pagamento['tipo'], string> = {
  PARCELA: 'Parcela',
  ACORDO: 'Acordo',
  COMPENSACAO: 'Compensação',
  OUTROS: 'Outros',
};

export default function PagamentosPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  const canEdit = user?.role === 'ADMIN' || user?.role === 'OPERADOR';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.pagamentos.getAll();
      setPagamentos(data);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao carregar pagamentos' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return pagamentos.filter((pgto) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        pgto.precatorio.npu.toLowerCase().includes(term) ||
        pgto.precatorio.ente.nome.toLowerCase().includes(term) ||
        (pgto.documento || '').toLowerCase().includes(term);

      const matchesStatus = statusFilter ? pgto.status === statusFilter : true;
      const matchesTipo = tipoFilter ? pgto.tipo === tipoFilter : true;

      const dataISO = pgto.dataPagamento.slice(0, 10);
      const startISO = dateStart ? parseBRDateToISO(dateStart) : null;
      const endISO = dateEnd ? parseBRDateToISO(dateEnd) : null;
      const matchesStart = startISO ? dataISO >= startISO : true;
      const matchesEnd = endISO ? dataISO <= endISO : true;

      return matchesSearch && matchesStatus && matchesTipo && matchesStart && matchesEnd;
    });
  }, [pagamentos, searchTerm, statusFilter, tipoFilter, dateStart, dateEnd]);

  const paginatedPagamentos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, tipoFilter, dateStart, dateEnd]);

  const deletePagamento = async (id: string, npu: string) => {
    if (!confirm(`Remover pagamento do precatório ${npu}?`)) return;

    try {
      await api.pagamentos.delete(id);
      setMessage({ type: 'success', text: 'Pagamento removido com sucesso' });
      loadData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao remover pagamento' });
    }
  };

  const formatCurrency = (value: number) =>
    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (value: string) => formatISODateToBR(value) || '—';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pagamentos</h1>
            <p className="text-gray-600 dark:text-gray-400">Controle financeiro dos precatórios</p>
          </div>
          {canEdit && (
            <button
              onClick={() => router.push('/dashboard/pagamentos/novo')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" /> Novo pagamento
            </button>
          )}
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

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por NPU, Ente ou documento"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos os status</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={tipoFilter}
              onChange={(e) => setTipoFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(tipoLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 xl:col-span-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/AAAA"
                value={dateStart}
                onChange={(e) => setDateStart(normalizeBRDateInput(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <span className="text-gray-500">a</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/AAAA"
                value={dateEnd}
                onChange={(e) => setDateEnd(normalizeBRDateInput(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark-border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Nenhum pagamento encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Precatório / Ente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedPagamentos.map((pgto) => (
                    <tr key={pgto.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{formatDate(pgto.dataPagamento)}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        <div className="font-semibold">{pgto.precatorio.npu}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">{pgto.precatorio.ente.nome}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                          {tipoLabels[pgto.tipo]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            pgto.status === 'PAGO'
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : pgto.status === 'PENDENTE'
                              ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {statusLabels[pgto.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(pgto.valor)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/pagamentos/${pgto.id}`)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => router.push(`/dashboard/pagamentos/${pgto.id}/editar`)}
                              className="text-yellow-500 hover:text-yellow-700"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => deletePagamento(pgto.id, pgto.precatorio.npu)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(filtered.length / itemsPerPage)}
                  totalItems={filtered.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              )}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> pagamento(s)
            {filtered.length !== pagamentos.length ? ` (de ${pagamentos.length})` : ''}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
