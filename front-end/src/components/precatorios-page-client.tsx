"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import { FileText, Plus, Search, Edit, Trash2, Eye, CloudUpload, Calendar, X } from "lucide-react";
import { PrecatoriosImportDialog } from "@/app/dashboard/precatorios/import-dialog";
import { Pagination } from "@/components/pagination";
import { useEnte } from "@/contexts/ente-context";
import { usePrecatoriosQuery, useDeletePrecatorioMutation } from "@/hooks/use-precatorios";

interface PrecatorioEvento {
  id: string;
  ordem: number;
  data: string;
  valor: number;
  tipo: string;
}

interface Precatorio {
  id: string;
  npu: string;
  processoOriginario?: string | null;
  natureza: "ALIMENTAR" | "COMUM" | "OUTROS";
  fonte?: string | null;
  ordemCronologica?: string | null;
  anoLoa?: number | null;
  valorAcao?: number | null;
  dataAtualizacao?: string | null;
  ente: { id: string; nome: string };
  tribunal: { id: string; nome: string; sigla: string };
  precatorioEventos?: PrecatorioEvento[];
}

const naturezaLabels: Record<Precatorio["natureza"], string> = {
  ALIMENTAR: "Alimentar",
  COMUM: "Comum",
  OUTROS: "Outros",
};

export function PrecatoriosPageClient() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { enteAtual } = useEnte();
  const { data: precatorios = [], isLoading, refetch } = usePrecatoriosQuery();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [naturezaFilter, setNaturezaFilter] = useState('');
  const [anoFilter, setAnoFilter] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const [eventosSidebarOpen, setEventosSidebarOpen] = useState(false);
  const [selectedPrecatorio, setSelectedPrecatorio] = useState<Precatorio | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  const canEdit = user?.role === "ADMIN" || user?.role === "OPERADOR";
  const deletePrecatorioMutation = useDeletePrecatorioMutation();

  const filtered = useMemo(() => {
    return precatorios.filter((precatorio) => {
      const matchesEnte = enteAtual ? precatorio.ente.id === enteAtual.id : true;
      const matchesSearch =
        precatorio.npu.toLowerCase().includes(searchTerm.toLowerCase()) ||
        precatorio.ente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (precatorio.tribunal.nome + precatorio.tribunal.sigla).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesNatureza = naturezaFilter ? precatorio.natureza === naturezaFilter : true;
      const matchesAno = anoFilter ? String(precatorio.anoLoa ?? "") === anoFilter : true;
      return matchesEnte && matchesSearch && matchesNatureza && matchesAno;
    });
  }, [precatorios, enteAtual, searchTerm, naturezaFilter, anoFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, naturezaFilter, anoFilter]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const deletePrecatorio = async (id: string, npu: string) => {
    if (!confirm(`Deseja remover o precatório ${npu}?`)) return;

    try {
      await deletePrecatorioMutation.mutateAsync(id);
      setMessage({ type: "success", text: "Precatório removido com sucesso" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Erro ao remover precatório" });
    }
  };

  const columns = useMemo<ColumnDef<Precatorio>[]>(
    () => [
      {
        id: "npu",
        header: "NPU",
        accessorKey: "npu",
        cell: ({ row }) => (
          <span className="font-mono text-sm text-blue-600 dark:text-blue-400">
            {row.original.npu}
          </span>
        ),
      },
      {
        id: "ente",
        header: "Ente",
        accessorFn: (row) => row.ente.nome,
        cell: ({ row }) => (
          <span className="text-sm text-gray-900 dark:text-white">{row.original.ente.nome}</span>
        ),
      },
      {
        id: "tribunal",
        header: "Tribunal",
        accessorFn: (row) => row.tribunal.sigla,
        cell: ({ row }) => (
          <span className="text-sm text-gray-900 dark:text-white">
            {row.original.tribunal.sigla}
          </span>
        ),
      },
      {
        id: "natureza",
        header: "Natureza",
        accessorKey: "natureza",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
            {naturezaLabels[row.original.natureza]}
          </span>
        ),
      },
      {
        id: "anoLoa",
        header: "Ano LOA",
        accessorKey: "anoLoa",
        cell: ({ row }) => (
          <span className="text-sm text-gray-900 dark:text-white">{row.original.anoLoa ?? "—"}</span>
        ),
      },
      {
        id: "valorAcao",
        header: "Valor ação",
        accessorKey: "valorAcao",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {row.original.valorAcao
              ? Number(row.original.valorAcao).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })
              : "—"}
          </span>
        ),
      },
      {
        id: "eventos",
        header: "Eventos",
        cell: ({ row }) => (
          <span className="inline-flex items-center justify-center">
            {row.original.precatorioEventos && row.original.precatorioEventos.length > 0 && (
              <button
                onClick={() => {
                  setSelectedPrecatorio(row.original);
                  setEventosSidebarOpen(true);
                }}
                className="inline-flex items-center justify-center p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-150"
                title={`${row.original.precatorioEventos.length} evento(s)`}
              >
                <Calendar className="w-5 h-5" />
                <span className="ml-1 text-xs font-semibold">
                  {row.original.precatorioEventos.length}
                </span>
              </button>
            )}
          </span>
        ),
      },
      {
        id: "acoes",
        header: "Ações",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/dashboard/precatorios/${row.original.id}`)}
              className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-150"
              title="Visualizar"
            >
              <Eye className="w-5 h-5" />
            </button>
            {canEdit && (
              <button
                onClick={() => router.push(`/dashboard/precatorios/${row.original.id}/editar`)}
                className="p-1.5 rounded-lg text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 transition-all duration-150"
                title="Editar"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => deletePrecatorio(row.original.id, row.original.npu)}
                className="p-1.5 rounded-lg text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150"
                title="Excluir"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [canEdit, deletePrecatorio, isAdmin, router],
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl rounded-full animate-pulse"></div>
                <div className="relative w-12 h-12 mx-auto mb-4 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <p className="mt-2 font-medium">Carregando...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl rounded-full animate-pulse"></div>
                <FileText className="relative w-12 h-12 mx-auto mb-4 opacity-50" />
              </div>
              <p className="mt-2 font-medium">Nenhum precatório encontrado</p>
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
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Eventos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedData.map((precatorio) => (
                    <tr
                      key={precatorio.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 group"
                    >
                      <td className="px-6 py-4 font-mono text-sm text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        {precatorio.npu}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{precatorio.ente.nome}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {precatorio.tribunal.sigla}
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
                      <td className="px-6 py-4 text-sm text-center">
                        {precatorio.precatorioEventos && precatorio.precatorioEventos.length > 0 && (
                          <button
                            onClick={() => {
                              setSelectedPrecatorio(precatorio);
                              setEventosSidebarOpen(true);
                            }}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 transition-all duration-150"
                            title={`${precatorio.precatorioEventos.length} evento(s)`}
                          >
                            <Calendar className="w-5 h-5" />
                            <span className="ml-1 text-xs font-semibold">
                              {precatorio.precatorioEventos.length}
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/precatorios/${precatorio.id}`)}
                            className="p-1.5 rounded-lg text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all duration-150"
                            title="Visualizar"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {canEdit && (
                            <button
                              onClick={() => router.push(`/dashboard/precatorios/${precatorio.id}/editar`)}
                              className="p-1.5 rounded-lg text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 transition-all duration-150"
                              title="Editar"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              onClick={() => deletePrecatorio(precatorio.id, precatorio.npu)}
                              className="p-1.5 rounded-lg text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150"
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

        {!isLoading && filtered.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filtered.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </div>
        )}
      </div>

      <PrecatoriosImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => {
          refetch();
          setMessage({ type: 'success', text: 'Importação concluída! Atualizamos a listagem.' });
        }}
      />

      {eventosSidebarOpen && selectedPrecatorio && (
        <>
          <div
            className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setEventosSidebarOpen(false)}
          />

          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-out">
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 shadow-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5" />
                    <h2 className="text-xl font-bold">Eventos do Precatório</h2>
                  </div>
                  <p className="text-sm text-blue-100 font-mono">{selectedPrecatorio.npu}</p>
                  <p className="text-xs text-blue-100 mt-1">{selectedPrecatorio.ente.nome}</p>
                </div>
                <button
                  onClick={() => setEventosSidebarOpen(false)}
                  className="p-2 hover:bg:white/20 rounded-lg transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="h-[calc(100vh-140px)] overflow-y-auto p-6 pb-32 space-y-4">
              {selectedPrecatorio.precatorioEventos && selectedPrecatorio.precatorioEventos.length > 0 ? (
                selectedPrecatorio.precatorioEventos.map((evento, index) => (
                  <div
                    key={evento.id}
                    className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow"
                  >
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                      {evento.ordem}
                    </div>

                    <div className="ml-4 space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text:white mt-1">{evento.tipo}</p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                          {new Date(evento.data).toLocaleDateString('pt-BR')}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                          {Number(evento.valor).toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">Nenhum evento cadastrado</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total de eventos:</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedPrecatorio.precatorioEventos?.length || 0}
                </span>
              </div>
              {selectedPrecatorio.precatorioEventos && selectedPrecatorio.precatorioEventos.length > 0 && (
                <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Valor total:</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {selectedPrecatorio.precatorioEventos
                      .reduce((sum, evt) => sum + Number(evt.valor), 0)
                      .toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
