'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { TrendingUp, Plus, Search, ChevronDown, ChevronRight, Filter } from 'lucide-react';

interface Ente {
  id: string;
  nome: string;
  cnpj?: string;
  tipo: string;
  entePrincipal?: Ente;
  entesVinculados?: Ente[];
}

interface Aporte {
  id: string;
  enteId: string;
  ano: number;
  mes: number;
  conta1: number;
  conta2: number;
  valorRepassado: number;
  valorDisponibilizado: number;
  ente: Ente;
  createdAt: string;
  updatedAt: string;
}

interface AporteAgrupado {
  entePrincipal: Ente;
  entesFilhos: Ente[];
  anos: {
    ano: number;
    entes: {
      ente: Ente;
      meses: Aporte[];
    }[];
  }[];
}

export default function AportesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [entes, setEntes] = useState<Ente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnte, setSelectedEnte] = useState<string>('');
  const [selectedAno, setSelectedAno] = useState<string>('');
  const [expandedEntes, setExpandedEntes] = useState<Set<string>>(new Set());
  const [expandedAnos, setExpandedAnos] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'OPERADOR';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadData();
    loadEntes();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.aportes.getAll();
      setAportes(data);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao carregar aportes' });
    } finally {
      setLoading(false);
    }
  };

  const loadEntes = async () => {
    try {
      const data = await api.entes.getAll();
      setEntes(data);
    } catch (error: any) {
      console.error('Erro ao carregar entes:', error);
      setMessage({ type: 'error', text: error.message || 'Erro ao carregar entes' });
    }
  };

  const aportesAgrupados = useMemo(() => {
    let filtered = aportes;

    // Filtrar por ente (incluir filhos se for principal)
    if (selectedEnte) {
      const enteSelecionado = entes.find(e => e.id === selectedEnte);
      if (enteSelecionado) {
        const idsParaFiltrar = [selectedEnte];
        if (enteSelecionado.entesVinculados) {
          idsParaFiltrar.push(...enteSelecionado.entesVinculados.map(e => e.id));
        }
        filtered = filtered.filter((a) => idsParaFiltrar.includes(a.enteId));
      }
    }

    // Filtrar por ano
    if (selectedAno) {
      filtered = filtered.filter((a) => a.ano === parseInt(selectedAno));
    }

    // Filtrar por busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((a) => a.ente.nome.toLowerCase().includes(term));
    }

    // Agrupar por Ente Principal (pai + filhos juntos)
    const grouped: { [key: string]: AporteAgrupado } = {};

    filtered.forEach((aporte) => {
      // Determinar o ente principal
      const entePrincipalId = aporte.ente.entePrincipal?.id || aporte.enteId;
      const entePrincipal = aporte.ente.entePrincipal || aporte.ente;

      // Criar grupo se não existir
      if (!grouped[entePrincipalId]) {
        grouped[entePrincipalId] = {
          entePrincipal: entePrincipal,
          entesFilhos: entePrincipal.entesVinculados || [],
          anos: [],
        };
      }

      const grupo = grouped[entePrincipalId];

      // Encontrar ou criar grupo de ano
      let anoGroup = grupo.anos.find((a) => a.ano === aporte.ano);
      if (!anoGroup) {
        anoGroup = { ano: aporte.ano, entes: [] };
        grupo.anos.push(anoGroup);
      }

      // Encontrar ou criar grupo de ente dentro do ano
      let enteGroup = anoGroup.entes.find((e) => e.ente.id === aporte.enteId);
      if (!enteGroup) {
        enteGroup = { ente: aporte.ente, meses: [] };
        anoGroup.entes.push(enteGroup);
      }

      enteGroup.meses.push(aporte);
    });

    // Ordenar
    Object.values(grouped).forEach((grupo) => {
      // Ordenar anos (mais recente primeiro)
      grupo.anos.sort((a, b) => b.ano - a.ano);
      
      grupo.anos.forEach((anoGroup) => {
        // Ordenar entes (principal primeiro, depois filhos)
        anoGroup.entes.sort((a, b) => {
          if (a.ente.id === grupo.entePrincipal.id) return -1;
          if (b.ente.id === grupo.entePrincipal.id) return 1;
          return a.ente.nome.localeCompare(b.ente.nome);
        });

        // Ordenar meses dentro de cada ente
        anoGroup.entes.forEach((enteGroup) => {
          enteGroup.meses.sort((a, b) => a.mes - b.mes);
        });
      });
    });

    return Object.values(grouped);
  }, [aportes, entes, selectedEnte, selectedAno, searchTerm]);

  const anosDisponiveis = useMemo(() => {
    const anos = new Set<number>();
    aportes.forEach((a) => anos.add(a.ano));
    return Array.from(anos).sort((a, b) => b - a);
  }, [aportes]);

  const toggleEnte = (enteId: string) => {
    const newExpanded = new Set(expandedEntes);
    if (newExpanded.has(enteId)) {
      newExpanded.delete(enteId);
    } else {
      newExpanded.add(enteId);
    }
    setExpandedEntes(newExpanded);
  };

  const toggleAno = (key: string) => {
    const newExpanded = new Set(expandedAnos);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedAnos(newExpanded);
  };

  const getMesNome = (mes: number) => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
    ];
    return meses[mes - 1] || 'Mês inválido';
  };

  const formatCurrency = (value: number) =>
    Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatDate = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Histórico de Aportes</h1>
            <p className="text-gray-600 dark:text-gray-400">Gerencie os aportes financeiros</p>
          </div>
          {canEdit && (
            <button
              onClick={() => router.push('/dashboard/aportes/novo')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" /> Novo aporte
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

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por ente"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedEnte}
                onChange={(e) => setSelectedEnte(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos os entes</option>
                {entes.filter(e => !e.entePrincipal).map((ente) => (
                  <option key={ente.id} value={ente.id}>
                    {ente.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedAno}
                onChange={(e) => setSelectedAno(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Todos os anos</option>
                {anosDisponiveis.map((ano) => (
                  <option key={ano} value={ano}>
                    {ano}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Carregando...</div>
          ) : aportesAgrupados.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Nenhum aporte encontrado
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {aportesAgrupados.map((grupo) => (
                <div key={grupo.entePrincipal.id} className="p-4">
                  {/* Cabeçalho do Ente Principal */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleEnte(grupo.entePrincipal.id)}
                      className="flex-1 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border-2 border-blue-200 dark:border-blue-800"
                    >
                      <div className="flex items-center gap-3">
                        {expandedEntes.has(grupo.entePrincipal.id) ? (
                          <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                        <div className="text-left">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            {grupo.entePrincipal.nome}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {grupo.anos.length} ano(s) cadastrado(s)
                            {grupo.entesFilhos.length > 0 && (
                              <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                                • {grupo.entesFilhos.length + 1} ente(s) no conjunto
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                    {canEdit && (
                      <button
                        onClick={() => router.push(`/dashboard/aportes/editar/${grupo.entePrincipal.id}`)}
                        className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                        title="Editar aportes deste conjunto"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar
                      </button>
                    )}
                  </div>

                  {/* Anos do Conjunto */}
                  {expandedEntes.has(grupo.entePrincipal.id) && (
                    <div className="mt-4 ml-8 space-y-3">
                      {grupo.anos.map((anoGroup) => {
                        const anoKey = `${grupo.entePrincipal.id}-${anoGroup.ano}`;
                        return (
                          <div key={anoKey} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                            {/* Cabeçalho do Ano */}
                            <button
                              onClick={() => toggleAno(anoKey)}
                              className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg hover:bg-gray-100 dark:hover:bg-gray-600/50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {expandedAnos.has(anoKey) ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                                )}
                                <span className="font-medium text-gray-900 dark:text-white">
                                  Ano {anoGroup.ano}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  ({anoGroup.entes.length} ente(s))
                                </span>
                              </div>
                            </button>

                            {/* Entes do Ano (Principal + Filhos) */}
                            {expandedAnos.has(anoKey) && (
                              <div className="p-4 space-y-4">
                                {anoGroup.entes.map((enteData) => (
                                  <div key={enteData.ente.id} className="border-l-4 border-blue-400 dark:border-blue-600 pl-4">
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                      {enteData.ente.id === grupo.entePrincipal.id ? (
                                        <span className="text-blue-600 dark:text-blue-400">📍 {enteData.ente.nome}</span>
                                      ) : (
                                        <span className="text-gray-700 dark:text-gray-300">↳ {enteData.ente.nome}</span>
                                      )}
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        ({enteData.meses.length} meses)
                                      </span>
                                    </h4>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                          <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Mês</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Conta 1</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Conta 2</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Repassado</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Disponibilizado</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                          {enteData.meses.map((aporte) => (
                                            <tr key={aporte.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                              <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                                                {getMesNome(aporte.mes)}
                                              </td>
                                              <td className="px-4 py-2 text-right text-gray-900 dark:text-white">
                                                {formatCurrency(aporte.conta1)}
                                              </td>
                                              <td className="px-4 py-2 text-right text-gray-900 dark:text-white">
                                                {formatCurrency(aporte.conta2)}
                                              </td>
                                              <td className="px-4 py-2 text-right text-gray-900 dark:text-white">
                                                {formatCurrency(aporte.valorRepassado)}
                                              </td>
                                              <td className="px-4 py-2 text-right text-gray-900 dark:text-white">
                                                {formatCurrency(aporte.valorDisponibilizado)}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Total: <span className="font-semibold text-gray-900 dark:text-white">{aportesAgrupados.length}</span> ente(s) • 
            <span className="font-semibold text-gray-900 dark:text-white">{aportes.length}</span> registro(s)
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
