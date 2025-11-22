'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { FileText, Plus, Search, Edit, Trash2, Eye, CloudUpload } from 'lucide-react';
import { PrecatoriosImportDialog } from './import-dialog';

interface Precatorio {
  id: string;
  npu: string;
  processoOriginario?: string | null;
  natureza: 'ALIMENTAR' | 'COMUM' | 'OUTROS';
  fonte?: string | null;
  ordemCronologica?: string | null;
  anoLoa?: number | null;
  valorAcao?: number | null;
  dataAtualizacao?: string | null;
  ente: { id: string; nome: string };
  tribunal: { id: string; nome: string; sigla: string };
}

const naturezaLabels: Record<Precatorio['natureza'], string> = {
  ALIMENTAR: 'Alimentar',
  COMUM: 'Comum',
  OUTROS: 'Outros',
};

export default function PrecatoriosPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [precatorios, setPrecatorios] = useState<Precatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [naturezaFilter, setNaturezaFilter] = useState('');
  const [anoFilter, setAnoFilter] = useState('');
  const [importOpen, setImportOpen] = useState(false);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'OPERADOR';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await api.precatorios.getAll();
      setPrecatorios(data);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao carregar precatórios' });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return precatorios.filter((precatorio) => {
      const matchesSearch =
        precatorio.npu.toLowerCase().includes(searchTerm.toLowerCase()) ||
        precatorio.ente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (precatorio.tribunal.nome + precatorio.tribunal.sigla).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesNatureza = naturezaFilter ? precatorio.natureza === naturezaFilter : true;
      const matchesAno = anoFilter ? String(precatorio.anoLoa ?? '') === anoFilter : true;
      return matchesSearch && matchesNatureza && matchesAno;
    });
  }, [precatorios, searchTerm, naturezaFilter, anoFilter]);

  const deletePrecatorio = async (id: string, npu: string) => {
    if (!confirm(`Deseja remover o precatório ${npu}?`)) return;

    try {
      await api.precatorios.delete(id);
      setMessage({ type: 'success', text: 'Precatório removido com sucesso' });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao remover precatório' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Precatórios</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie os precatórios cadastrados</p>
          </div>
          {canEdit && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setImportOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
              >
                <CloudUpload className="w-5 h-5" /> Importar planilha
              </button>
              <button
                onClick={() => router.push('/dashboard/precatorios/novo')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-5 h-5" /> Novo Precatório
              </button>
            </div>
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

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por NPU, ente ou tribunal"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={naturezaFilter}
              onChange={(e) => setNaturezaFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todas as naturezas</option>
              {Object.entries(naturezaLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={anoFilter}
              onChange={(e) => setAnoFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos os anos LOA</option>
              {[...new Set(precatorios.map((p) => p.anoLoa).filter(Boolean) as number[])]
                .sort((a, b) => b - a)
                .map((ano) => (
                  <option key={ano} value={String(ano)}>
                    {ano}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Nenhum precatório encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      NPU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tribunal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Natureza
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ano LOA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Valor ação
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filtered.map((precatorio) => (
                    <tr key={precatorio.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 font-mono text-sm text-blue-600 dark:text-blue-300">
                        {precatorio.npu}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{precatorio.ente.nome}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {precatorio.tribunal.sigla} - {precatorio.tribunal.nome}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                          {naturezaLabels[precatorio.natureza]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {precatorio.anoLoa ?? '—'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                        {precatorio.valorAcao
                          ? Number(precatorio.valorAcao).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            })
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/precatorios/${precatorio.id}`)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => router.push(`/dashboard/precatorios/${precatorio.id}/editar`)}
                              className="text-yellow-500 hover:text-yellow-700"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => deletePrecatorio(precatorio.id, precatorio.npu)}
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
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> registro(s)
            {filtered.length !== precatorios.length ? ` (de ${precatorios.length})` : ''}
          </p>
        </div>
      </div>

      <PrecatoriosImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          fetchData();
          setMessage({ type: 'success', text: 'Importação concluída! Atualizamos a listagem.' });
        }}
      />
    </DashboardLayout>
  );
}
