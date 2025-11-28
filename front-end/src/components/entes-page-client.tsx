"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Building2, Plus, Search, Edit, Trash2, Eye, Copy } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { useEntesQuery, useDeleteEnteMutation } from "@/hooks/use-entes";
import { toast } from "sonner";

interface Ente {
  id: string;
  nome: string;
  cnpj: string | null;
  tipo: string;
  uf: string | null;
  regime?: 'ESPECIAL' | 'COMUM';
  ativo: boolean;
  entePrincipal?: {
    id: string;
    nome: string;
    tipo: string;
  } | null;
  entesVinculados?: Array<{
    id: string;
    nome: string;
    tipo: string;
  }>;
}

const tipoLabels: Record<string, string> = {
  MUNICIPIO: 'Município',
  ESTADO: 'Estado',
  UNIAO: 'União',
  AUTARQUIA: 'Autarquia',
  FUNDACAO: 'Fundação',
  EMPRESA_PUBLICA: 'Empresa Pública',
  SOCIEDADE_ECONOMIA_MISTA: 'Sociedade de Economia Mista',
};

const regimeLabels: Record<string, string> = {
  ESPECIAL: 'Especial',
  COMUM: 'Comum',
};

export function EntesPageClient() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { data: entes = [], isLoading } = useEntesQuery();
  const [filteredEntes, setFilteredEntes] = useState<Ente[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  const deleteEnteMutation = useDeleteEnteMutation();

  const paginatedEntes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEntes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEntes, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEntes.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTipo]);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'OPERADOR';

  useEffect(() => {
    filterEntes();
  }, [searchTerm, filterTipo, entes]);

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success('ID copiado para a área de transferência.');
    } catch (error) {
      toast.error('Não foi possível copiar o ID.');
    }
  };

  const filterEntes = () => {
    let filtered = entes;

    if (searchTerm) {
      filtered = filtered.filter(
        (ente) =>
          ente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (ente.cnpj && ente.cnpj.includes(searchTerm))
      );
    }

    if (filterTipo) {
      filtered = filtered.filter((ente) => ente.tipo === filterTipo);
    }

    setFilteredEntes(filtered);
  };

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o ente "${nome}"?`)) {
      return;
    }

    try {
      await deleteEnteMutation.mutateAsync(id);
      toast.success('Ente excluído com sucesso!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir ente';
      toast.error(errorMessage);
    }
  };

  const columns = useMemo<ColumnDef<Ente>[]>(
    () => [
      {
        id: 'id',
        header: 'ID',
        cell: ({ row }) => (
          <button
            onClick={() => handleCopyId(row.original.id)}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-600"
            title="Copiar ID"
            aria-label="Copiar ID do ente"
          >
            <Copy className="w-4 h-4" />
          </button>
        ),
      },
      {
        id: 'nome',
        header: 'Nome',
        accessorKey: 'nome',
        cell: ({ row }) => (
          <div className="flex items-center">
            <Building2 className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{row.original.nome}</div>
              {row.original.entesVinculados && row.original.entesVinculados.length > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {row.original.entesVinculados.length} vinculado(s)
                </div>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'regime',
        header: 'Regime',
        accessorKey: 'regime',
        cell: ({ row }) => (
          <span className="text-sm text-gray-900 dark:text-white">
            {row.original.regime ? regimeLabels[row.original.regime] ?? row.original.regime : '-'}
          </span>
        ),
      },
      {
        id: 'tipo',
        header: 'Tipo',
        accessorKey: 'tipo',
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
            {tipoLabels[row.original.tipo]}
          </span>
        ),
      },
      {
        id: 'uf',
        header: 'UF',
        accessorKey: 'uf',
        cell: ({ row }) => (
          <span className="text-sm text-gray-900 dark:text-white">{row.original.uf || '-'}</span>
        ),
      },
      {
        id: 'entePrincipal',
        header: 'Ente Principal',
        accessorFn: (row) => row.entePrincipal?.nome ?? '-',
        cell: ({ row }) => (
          <span className="text-sm text-gray-900 dark:text-white">
            {row.original.entePrincipal ? row.original.entePrincipal.nome : '-'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        accessorKey: 'ativo',
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${row.original.ativo
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
              }`}
          >
            {row.original.ativo ? 'Ativo' : 'Inativo'}
          </span>
        ),
      },
      {
        id: 'acoes',
        header: 'Ações',
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => router.push(`/dashboard/entes/${row.original.id}`)}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
              title="Visualizar"
            >
              <Eye className="w-5 h-5" />
            </button>
            {(user?.role === 'ADMIN' || user?.role === 'OPERADOR') && (
              <button
                onClick={() => router.push(`/dashboard/entes/${row.original.id}/editar`)}
                className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                title="Editar"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => handleDelete(row.original.id, row.original.nome)}
                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                title="Excluir"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [handleCopyId, handleDelete, isAdmin, router, user?.role],
  );

  const table = useReactTable({
    data: paginatedEntes,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Entes</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Gerencie os entes públicos do sistema</p>
          </div>
          {canEdit && (
            <button
              onClick={() => router.push('/dashboard/entes/novo')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Ente
            </button>
          )}
        </div>


        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome ou CNPJ..."
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

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
          ) : filteredEntes.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum ente encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer select-none"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredEntes.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={filteredEntes.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onItemsPerPageChange={setItemsPerPage}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
