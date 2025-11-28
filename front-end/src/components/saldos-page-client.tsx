"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender, type ColumnDef } from "@tanstack/react-table";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth } from "@/contexts/auth-context";
import { PiggyBank, Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import { Pagination } from "@/components/pagination";
import { useEnte } from "@/contexts/ente-context";
import { useSaldosQuery, useDeleteSaldoMutation } from "@/hooks/use-saldos";

interface Saldo {
  id: string;
  etiqueta?: string | null;
  regime: "ESPECIAL" | "COMUM";
  contaI: number;
  contaII: number;
  competencia: string;
  observacoes?: string | null;
  ente: { id: string; nome: string };
}

const regimeLabels: Record<Saldo["regime"], string> = {
  ESPECIAL: "Especial",
  COMUM: "Comum",
};

export function SaldosPageClient() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { enteAtual } = useEnte();
  const { data: saldos = [], isLoading } = useSaldosQuery();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [competenciaFilter, setCompetenciaFilter] = useState("");
  const [regimeFilter, setRegimeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sorting, setSorting] = useState<{
    id: string;
    desc: boolean;
  }[]>([]);

  const deleteSaldoMutation = useDeleteSaldoMutation();

  const canEdit = user?.role === "ADMIN" || user?.role === "OPERADOR";

  const filtered = useMemo(() => {
    return saldos.filter((saldo) => {
      const matchesEnte = enteAtual ? saldo.ente.id === enteAtual.id : true;
      const matchesSearch =
        saldo.ente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (saldo.etiqueta || "").toLowerCase().includes(searchTerm.toLowerCase());
      const competencia = new Date(saldo.competencia).toISOString().slice(0, 7);
      const matchesCompetencia = competenciaFilter ? competencia === competenciaFilter : true;
      const matchesRegime = regimeFilter ? saldo.regime === regimeFilter : true;
      return matchesEnte && matchesSearch && matchesCompetencia && matchesRegime;
    });
  }, [saldos, enteAtual, searchTerm, competenciaFilter, regimeFilter]);

  const paginatedSaldos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, competenciaFilter, regimeFilter]);

  const deleteSaldo = async (id: string, enteNome: string) => {
    if (!confirm(`Remover saldo de ${enteNome}?`)) return;

    try {
      await deleteSaldoMutation.mutateAsync(id);
      setMessage({ type: "success", text: "Saldo removido com sucesso" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Erro ao remover saldo" });
    }
  };

  const columns = useMemo<ColumnDef<Saldo>[]>(
    () => [
      {
        id: "ente",
        header: "Ente",
        accessorFn: (row) => row.ente.nome,
        cell: ({ row }) => (
          <span className="text-sm text-gray-900 dark:text-white">{row.original.ente.nome}</span>
        ),
      },
      {
        id: "etiqueta",
        header: "Etiqueta",
        accessorKey: "etiqueta",
        cell: ({ row }) => (
          <span className="text-sm text-gray-900 dark:text-white">{row.original.etiqueta || "—"}</span>
        ),
      },
      {
        id: "regime",
        header: "Regime",
        accessorKey: "regime",
        cell: ({ row }) => (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
            {regimeLabels[row.original.regime]}
          </span>
        ),
      },
      {
        id: "competencia",
        header: "Competência",
        accessorKey: "competencia",
        cell: ({ row }) => (
          <span className="text-sm text-gray-900 dark:text-white">
            {new Date(row.original.competencia).toLocaleDateString("pt-BR", {
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        id: "contaI",
        header: "Conta I",
        accessorKey: "contaI",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {Number(row.original.contaI).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        ),
      },
      {
        id: "contaII",
        header: "Conta II",
        accessorKey: "contaII",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {Number(row.original.contaII).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        ),
      },
      {
        id: "acoes",
        header: "Ações",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/dashboard/saldos/${row.original.id}`)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Eye className="w-5 h-5" />
            </button>
            {canEdit && (
              <button
                onClick={() => router.push(`/dashboard/saldos/${row.original.id}/editar`)}
                className="text-yellow-500 hover:text-yellow-700"
              >
                <Edit className="w-5 h-5" />
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => deleteSaldo(row.original.id, row.original.ente.nome)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [canEdit, deleteSaldo, isAdmin, router],
  );

  const table = useReactTable({
    data: paginatedSaldos,
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Saldos em Conta Vinculada</h1>
            <p className="text-gray-600 dark:text-gray-400">Controle os saldos por ente e competência</p>
          </div>
          {canEdit && (
            <button
              onClick={() => router.push("/dashboard/saldos/novo")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" /> Novo Saldo
            </button>
          )}
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"
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
                placeholder="Buscar por ente ou etiqueta"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <input
              type="month"
              value={competenciaFilter}
              onChange={(e) => setCompetenciaFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Competência"
            />
            <select
              value={regimeFilter}
              onChange={(e) => setRegimeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Todos os regimes</option>
              {Object.entries(regimeLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <PiggyBank className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Nenhum saldo encontrado
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
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
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
            Total: <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> registro(s)
            {filtered.length !== saldos.length ? ` (de ${saldos.length})` : ""}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
