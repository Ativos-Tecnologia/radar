'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { Scale, Plus, Search, Edit, Trash2, Eye } from 'lucide-react';

interface Tribunal {
  id: string;
  nome: string;
  sigla: string;
  tipo: string;
  uf: string | null;
  regiao: number | null;
  ativo: boolean;
}

const tipoLabels: Record<string, string> = {
  TJ: 'Tribunal de Justiça',
  TRT: 'Tribunal Regional do Trabalho',
  TRF: 'Tribunal Regional Federal',
  TST: 'Tribunal Superior do Trabalho',
  TSE: 'Tribunal Superior Eleitoral',
  STF: 'Supremo Tribunal Federal',
  STJ: 'Superior Tribunal de Justiça',
};

export default function TribunaisPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [tribunais, setTribunais] = useState<Tribunal[]>([]);
  const [filteredTribunais, setFilteredTribunais] = useState<Tribunal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'OPERADOR';

  useEffect(() => {
    loadTribunais();
  }, []);

  useEffect(() => {
    filterTribunais();
  }, [searchTerm, filterTipo, tribunais]);

  const loadTribunais = async () => {
    try {
      setLoading(true);
      const data = await api.tribunais.getAll();
      setTribunais(data);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao carregar tribunais',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTribunais = () => {
    let filtered = tribunais;

    if (searchTerm) {
      filtered = filtered.filter(
        (tribunal) =>
          tribunal.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tribunal.sigla.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterTipo) {
      filtered = filtered.filter((tribunal) => tribunal.tipo === filterTipo);
    }

    setFilteredTribunais(filtered);
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o tribunal "${nome}"?`)) {
      return;
    }

    try {
      await api.tribunais.delete(id);
      setMessage({ type: 'success', text: 'Tribunal excluído com sucesso!' });
      loadTribunais();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao excluir tribunal',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tribunais
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gerencie os tribunais do sistema
            </p>
          </div>
          {canEdit && (
            <button
              onClick={() => router.push('/dashboard/tribunais/novo')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Tribunal
            </button>
          )}
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

        {/* Filtros */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou sigla..."
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
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Carregando...
            </div>
          ) : filteredTribunais.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum tribunal encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Sigla
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      UF/Região
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTribunais.map((tribunal) => (
                    <tr
                      key={tribunal.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Scale className="w-5 h-5 text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {tribunal.nome}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {tribunal.sigla}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                          {tribunal.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {tribunal.regiao ? `${tribunal.regiao}ª Região` : tribunal.uf || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            tribunal.ativo
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {tribunal.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/tribunais/${tribunal.id}`)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Visualizar"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => router.push(`/dashboard/tribunais/${tribunal.id}/editar`)}
                              className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => handleDelete(tribunal.id, tribunal.nome)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Excluir"
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
            </div>
          )}
        </div>

        {/* Resumo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: <span className="font-semibold text-gray-900 dark:text-white">{filteredTribunais.length}</span> tribunal(is)
            {searchTerm || filterTipo ? ` (filtrado de ${tribunais.length})` : ''}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
