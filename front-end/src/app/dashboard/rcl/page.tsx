'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { BarChart3, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { Pagination } from '@/components/pagination';
import { useEnte } from '@/contexts/ente-context';

interface EnteSummary {
  id: string;
  nome: string;
  tipo: string;
}

interface RclItem {
  id: string;
  ano: number;
  valor: number;
  tipo: 'PREVISTO' | 'REALIZADO';
  percentual: number;
  ativo: boolean;
  observacao?: string | null;
  ente: EnteSummary;
}

const tipoLabels: Record<string, string> = {
  PREVISTO: 'Previsto',
  REALIZADO: 'Realizado',
};

export default function RclPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { enteAtual } = useEnte();
  const [rcls, setRcls] = useState<RclItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterAno, setFilterAno] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'OPERADOR';

  useEffect(() => {
    loadRcl();
  }, []);

  const loadRcl = async () => {
    try {
      setLoading(true);
      const data = await api.rcl.getAll();
      setRcls(data);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao carregar RCL' });
    } finally {
      setLoading(false);
    }
  };

  const filteredRcl = useMemo(() => {
    return rcls.filter((item) => {
      const matchesEnte = enteAtual ? item.ente.id === enteAtual.id : true;
      const matchesSearch =
        item.ente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.ano).includes(searchTerm);
      const matchesTipo = filterTipo ? item.tipo === filterTipo : true;
      const matchesAno = filterAno ? String(item.ano) === filterAno : true;
      return matchesEnte && matchesSearch && matchesTipo && matchesAno;
    });
  }, [rcls, enteAtual, searchTerm, filterTipo, filterAno]);

  const paginatedRcl = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRcl.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRcl, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredRcl.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTipo, filterAno]);

  const handleDelete = async (item: RclItem) => {
    if (!confirm(`Excluir RCL ${item.ano} (${tipoLabels[item.tipo]}) do ente ${item.ente.nome}?`)) {
      return;
    }

    try {
      await api.rcl.delete(item.id);
      setMessage({ type: 'success', text: 'Registro removido com sucesso!' });
      loadRcl();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao remover RCL' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">RCL</h1>
            <p className="text-gray-600 dark:text-gray-400">Registros de Receita Corrente Líquida por ente</p>
          </div>
          {canEdit && (
            <button
              onClick={() => router.push('/dashboard/rcl/novo')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Registro
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

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por ente ou ano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(tipoLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={filterAno}
              onChange={(e) => setFilterAno(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os anos</option>
              {[...new Set(rcls.map((item) => item.ano))]
                .sort((a, b) => b - a)
                .map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
          ) : filteredRcl.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Nenhum registro encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Ente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Ano
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      % RCL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedRcl.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{item.ente.nome}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.ente.tipo}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{item.ano}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                          {tipoLabels[item.tipo]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {item.percentual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {Number(item.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.ativo
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {item.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/rcl/${item.id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => router.push(`/dashboard/rcl/${item.id}/editar`)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(item)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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

              {filteredRcl.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredRcl.length}
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
            Total: <span className="font-semibold text-gray-900 dark:text-white">{filteredRcl.length}</span> registro(s)
            {searchTerm || filterAno || filterTipo ? ` (filtrado de ${rcls.length})` : ''}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
