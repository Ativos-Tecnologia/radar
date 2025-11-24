'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { useAuth } from '@/contexts/auth-context';
import { api } from '@/lib/api';
import { ArrowLeft, Save, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';

interface Ente {
  id: string;
  nome: string;
  cnpj?: string;
  tipo: string;
  entePrincipalId?: string;
  entePrincipal?: Ente;
  entesVinculados?: Ente[];
}

interface MesValores {
  conta1: string;
  conta2: string;
  valorRepassado: string;
  valorDisponibilizado: string;
}

interface NovoAportePageProps {
  enteIdProp?: string;
}

export default function NovoAportePage({ enteIdProp }: NovoAportePageProps = {}) {
  const router = useRouter();
  const { user } = useAuth();
  const [entes, setEntes] = useState<Ente[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingExistente, setLoadingExistente] = useState(false);
  const [selectedEnte, setSelectedEnte] = useState<string>(enteIdProp || '');
  const [entesParaCadastro, setEntesParaCadastro] = useState<Ente[]>([]);
  const [selectedAnos, setSelectedAnos] = useState<number[]>([]);
  const [anoInput, setAnoInput] = useState<string>('');
  const [expandedAnos, setExpandedAnos] = useState<Set<number>>(new Set());
  const [expandedEntes, setExpandedEntes] = useState<Set<string>>(new Set());
  const [mesesData, setMesesData] = useState<{ [enteId: string]: { [ano: number]: { [mes: number]: MesValores } } }>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'OPERADOR';

  const mesesNomes = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  useEffect(() => {
    if (!canEdit) {
      router.push('/dashboard/aportes');
      return;
    }
    loadEntes();
  }, [canEdit]);

  // Carregar dados existentes quando enteIdProp é fornecido ou ente é alterado
  useEffect(() => {
    if (selectedEnte && entes.length > 0) {
      // Primeiro, configurar entesParaCadastro
      const ente = entes.find(e => e.id === selectedEnte);
      if (ente) {
        const todosEntes = [ente, ...(ente.entesVinculados || [])];
        setEntesParaCadastro(todosEntes);
      }
      // Depois, carregar dados existentes
      carregarDadosExistentes(selectedEnte);
    }
  }, [selectedEnte, entes]);

  const loadEntes = async () => {
    try {
      const data = await api.entes.getAll();
      // Filtrar apenas entes principais (sem entePrincipalId)
      const entesPrincipais = data.filter((e: Ente) => !e.entePrincipal);
      setEntes(entesPrincipais);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao carregar entes' });
    }
  };

  const carregarDadosExistentes = async (enteId: string) => {
    try {
      setLoadingExistente(true);
      
      // Buscar aportes existentes para este ente
      const data = await api.aportes.getByEnte(enteId);
      
      // Se não há aportes, retorna
      if (!data || !data.aportesPrincipal || data.aportesPrincipal.length === 0) {
        setLoadingExistente(false);
        return;
      }

      // MODO EDIÇÃO ATIVADO
      setModoEdicao(true);
      setMessage({ 
        type: 'success', 
        text: '✓ Dados existentes carregados! Você está editando aportes já cadastrados.' 
      });

      // Coletar todos os aportes (principal + filhos)
      const todosAportes = [...data.aportesPrincipal, ...data.aportesFilhos];

      // Extrair anos únicos
      const anosUnicos = Array.from(new Set(todosAportes.map((a: any) => a.ano))).sort((a: any, b: any) => b - a);
      setSelectedAnos(anosUnicos as number[]);

      // Manter tudo colapsado (não expandir automaticamente)
      setExpandedAnos(new Set());
      setExpandedEntes(new Set());

      // Organizar dados por ente > ano > mês
      const dadosOrganizados: { [enteId: string]: { [ano: number]: { [mes: number]: MesValores } } } = {};

      todosAportes.forEach((aporte: any) => {
        if (!dadosOrganizados[aporte.enteId]) {
          dadosOrganizados[aporte.enteId] = {};
        }
        if (!dadosOrganizados[aporte.enteId][aporte.ano]) {
          dadosOrganizados[aporte.enteId][aporte.ano] = {};
        }

        dadosOrganizados[aporte.enteId][aporte.ano][aporte.mes] = {
          conta1: aporte.conta1.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          conta2: aporte.conta2.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          valorRepassado: aporte.valorRepassado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          valorDisponibilizado: aporte.valorDisponibilizado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        };
      });

      // Preencher meses faltantes com 0,00
      entesParaCadastro.forEach(ente => {
        if (!dadosOrganizados[ente.id]) {
          dadosOrganizados[ente.id] = {};
        }
        anosUnicos.forEach((ano: any) => {
          if (!dadosOrganizados[ente.id][ano]) {
            dadosOrganizados[ente.id][ano] = {};
          }
          for (let mes = 1; mes <= 12; mes++) {
            if (!dadosOrganizados[ente.id][ano][mes]) {
              dadosOrganizados[ente.id][ano][mes] = {
                conta1: '0,00',
                conta2: '0,00',
                valorRepassado: '0,00',
                valorDisponibilizado: '0,00',
              };
            }
          }
        });
      });

      setMesesData(dadosOrganizados);
    } catch (error: any) {
      console.error('Erro ao carregar dados existentes:', error);
      // Não mostra erro ao usuário - apenas não carrega dados
    } finally {
      setLoadingExistente(false);
    }
  };

  const handleEnteChange = (enteId: string) => {
    setSelectedEnte(enteId);
    const ente = entes.find(e => e.id === enteId);
    if (ente) {
      const todosEntes = [ente, ...(ente.entesVinculados || [])];
      setEntesParaCadastro(todosEntes);
    } else {
      setEntesParaCadastro([]);
    }
    // Limpar dados ao trocar de ente
    setMesesData({});
    setSelectedAnos([]);
    setExpandedAnos(new Set());
    setExpandedEntes(new Set());
  };

  const addAno = () => {
    const ano = parseInt(anoInput);
    if (!ano || ano < 1900 || ano > 2100) {
      setMessage({ type: 'error', text: 'Digite um ano válido entre 1900 e 2100' });
      return;
    }
    if (selectedAnos.includes(ano)) {
      setMessage({ type: 'error', text: 'Este ano já foi adicionado' });
      return;
    }

    setSelectedAnos([...selectedAnos, ano].sort((a, b) => b - a));
    setAnoInput('');
    setMessage(null);

    // Inicializar dados dos meses com 0,00 para todos os entes
    const novosMeses: { [mes: number]: MesValores } = {};
    for (let mes = 1; mes <= 12; mes++) {
      novosMeses[mes] = {
        conta1: '0,00',
        conta2: '0,00',
        valorRepassado: '0,00',
        valorDisponibilizado: '0,00',
      };
    }

    setMesesData(prev => {
      const newData = { ...prev };
      entesParaCadastro.forEach(ente => {
        if (!newData[ente.id]) {
          newData[ente.id] = {};
        }
        newData[ente.id][ano] = novosMeses;
      });
      return newData;
    });
  };

  const removeAno = (ano: number) => {
    setSelectedAnos(selectedAnos.filter(a => a !== ano));
    const newMesesData = { ...mesesData };
    // Remover ano de todos os entes
    Object.keys(newMesesData).forEach(enteId => {
      if (newMesesData[enteId][ano]) {
        delete newMesesData[enteId][ano];
      }
    });
    setMesesData(newMesesData);
    const newExpanded = new Set(expandedAnos);
    newExpanded.delete(ano);
    setExpandedAnos(newExpanded);
  };

  const toggleAno = (ano: number) => {
    const newExpanded = new Set(expandedAnos);
    if (newExpanded.has(ano)) {
      newExpanded.delete(ano);
    } else {
      newExpanded.add(ano);
    }
    setExpandedAnos(newExpanded);
  };

  const formatCurrency = (value: string): string => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '0,00';

    // Converte para número e formata
    const num = parseInt(numbers) / 100;
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleCurrencyInput = (enteId: string, ano: number, mes: number, field: keyof MesValores, value: string) => {
    const formatted = formatCurrency(value);
    setMesesData(prev => ({
      ...prev,
      [enteId]: {
        ...prev[enteId],
        [ano]: {
          ...prev[enteId]?.[ano],
          [mes]: {
            ...prev[enteId]?.[ano]?.[mes],
            [field]: formatted,
          },
        },
      },
    }));
  };

  const toggleEnte = (enteId: string) => {
    const newExpanded = new Set(expandedEntes);
    if (newExpanded.has(enteId)) {
      newExpanded.delete(enteId);
    } else {
      newExpanded.add(enteId);
    }
    setExpandedEntes(newExpanded);
  };

  const parseCurrencyToNumber = (value: string): number => {
    if (!value || value === '0,00') return 0;
    return parseFloat(value.replace(/\./g, '').replace(',', '.'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEnte) {
      setMessage({ type: 'error', text: 'Selecione um ente' });
      return;
    }

    if (selectedAnos.length === 0) {
      setMessage({ type: 'error', text: 'Adicione pelo menos um ano' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Se está em modo edição, primeiro deletar aportes existentes
      if (modoEdicao) {
        for (const ente of entesParaCadastro) {
          for (const ano of selectedAnos) {
            // Buscar IDs dos aportes existentes para deletar
            const aportesExistentes = await api.aportes.getAll(ente.id, ano);
            
            // Deletar cada aporte existente
            for (const aporte of aportesExistentes) {
              await api.aportes.delete(aporte.id);
            }
          }
        }
      }

      // Cadastrar/Recriar para cada ente (pai + filhos)
      for (const ente of entesParaCadastro) {
        for (const ano of selectedAnos) {
          const meses = [];

          for (let mes = 1; mes <= 12; mes++) {
            const mesData = mesesData[ente.id]?.[ano]?.[mes];
            meses.push({
              mes,
              conta1: parseCurrencyToNumber(mesData?.conta1 || '0,00'),
              conta2: parseCurrencyToNumber(mesData?.conta2 || '0,00'),
              valorRepassado: parseCurrencyToNumber(mesData?.valorRepassado || '0,00'),
              valorDisponibilizado: parseCurrencyToNumber(mesData?.valorDisponibilizado || '0,00'),
            });
          }

          await api.aportes.create({
            enteId: ente.id,
            ano,
            meses,
          });
        }
      }

      setMessage({ 
        type: 'success', 
        text: modoEdicao ? 'Aportes atualizados com sucesso!' : 'Aportes cadastrados com sucesso!' 
      });
      setTimeout(() => router.push('/dashboard/aportes'), 2000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || `Erro ao ${modoEdicao ? 'atualizar' : 'cadastrar'} aportes` });
    } finally {
      setLoading(false);
    }
  };

  const enteAtual = entes.find(e => e.id === selectedEnte);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard/aportes')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {modoEdicao ? 'Editar Aportes' : 'Novo Aporte'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {modoEdicao 
                ? 'Edite os aportes financeiros cadastrados' 
                : 'Cadastre aportes financeiros por ente e ano'}
            </p>
          </div>
        </div>

        {loadingExistente && (
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 flex items-center gap-3">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verificando dados existentes...
          </div>
        )}

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
          {/* Seleção de Ente */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">1. Selecione o Ente</h2>
            <select
              value={selectedEnte}
              onChange={(e) => handleEnteChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Selecione um ente...</option>
              {entes.map((ente) => (
                <option key={ente.id} value={ente.id}>
                  {ente.nome} {ente.cnpj ? `- ${ente.cnpj}` : ''}
                </option>
              ))}
            </select>

            {enteAtual?.entesVinculados && enteAtual.entesVinculados.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>✓ Atenção:</strong> Este ente possui {enteAtual.entesVinculados.length} ente(s) vinculado(s).
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                  Você poderá cadastrar dados do <strong>{enteAtual.nome}</strong> e de seus {enteAtual.entesVinculados.length} ente(s) vinculado(s) simultaneamente:
                </p>
                <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 mt-2 ml-2">
                  {enteAtual.entesVinculados.map((filho) => (
                    <li key={filho.id}>{filho.nome}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Seleção de Anos */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">2. Adicione os Anos</h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="number"
                value={anoInput}
                onChange={(e) => setAnoInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAno())}
                placeholder="Digite o ano (ex: 2024)"
                min="1900"
                max="2100"
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={addAno}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Adicionar
              </button>
            </div>

            {selectedAnos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedAnos.map((ano) => (
                  <div
                    key={ano}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full"
                  >
                    <span className="font-medium">{ano}</span>
                    <button
                      type="button"
                      onClick={() => removeAno(ano)}
                      className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulário de Meses por Ente */}
          {selectedAnos.length > 0 && entesParaCadastro.length > 0 && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                3. Preencha os Valores Mensais
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Os valores padrão são R$ 0,00. Preencha apenas os meses que possuem valores.
                {entesParaCadastro.length > 1 && (
                  <span className="block mt-2 text-blue-600 dark:text-blue-400 font-medium">
                    ℹ️ Você está cadastrando para {entesParaCadastro.length} ente(s): {entesParaCadastro.map(e => e.nome).join(', ')}
                  </span>
                )}
              </p>

              <div className="space-y-6">
                {entesParaCadastro.map((ente) => (
                  <div key={ente.id} className="border-2 border-blue-200 dark:border-blue-800 rounded-lg">
                    {/* Cabeçalho do Ente */}
                    <button
                      type="button"
                      onClick={() => toggleEnte(ente.id)}
                      className="w-full flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-t-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedEntes.has(ente.id) ? (
                          <ChevronDown className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <ChevronRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        )}
                        <div className="text-left">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                            {ente.nome}
                          </h3>
                          {ente.entePrincipalId && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">(Ente Vinculado)</span>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Anos do Ente */}
                    {expandedEntes.has(ente.id) && (
                      <div className="p-4 space-y-4">
                        {selectedAnos.map((ano) => {
                          const anoKey = `${ente.id}-${ano}`;
                          return (
                            <div key={anoKey} className="border border-gray-200 dark:border-gray-600 rounded-lg">
                              <button
                                type="button"
                                onClick={() => toggleAno(ano)}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-t-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  {expandedAnos.has(ano) ? (
                                    <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                  ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                  )}
                                  <span className="font-semibold text-gray-900 dark:text-white">Ano {ano}</span>
                                </div>
                              </button>

                              {expandedAnos.has(ano) && (
                                <div className="p-4">
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">
                                            Mês
                                          </th>
                                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">
                                            Conta 1 (R$)
                                          </th>
                                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">
                                            Conta 2 (R$)
                                          </th>
                                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">
                                            Valor Repassado (R$)
                                          </th>
                                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">
                                            Valor Disponibilizado (R$)
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {mesesNomes.map((mesNome, index) => {
                                          const mes = index + 1;
                                          const valores = mesesData[ente.id]?.[ano]?.[mes] || {
                                            conta1: '0,00',
                                            conta2: '0,00',
                                            valorRepassado: '0,00',
                                            valorDisponibilizado: '0,00',
                                          };

                                          return (
                                            <tr key={mes} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                              <td className="px-3 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                                                {mesNome}
                                              </td>
                                              <td className="px-3 py-2">
                                                <input
                                                  type="text"
                                                  value={valores.conta1}
                                                  onChange={(e) => handleCurrencyInput(ente.id, ano, mes, 'conta1', e.target.value)}
                                                  className="w-full px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                  placeholder="0,00"
                                                />
                                              </td>
                                              <td className="px-3 py-2">
                                                <input
                                                  type="text"
                                                  value={valores.conta2}
                                                  onChange={(e) => handleCurrencyInput(ente.id, ano, mes, 'conta2', e.target.value)}
                                                  className="w-full px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                  placeholder="0,00"
                                                />
                                              </td>
                                              <td className="px-3 py-2">
                                                <input
                                                  type="text"
                                                  value={valores.valorRepassado}
                                                  onChange={(e) => handleCurrencyInput(ente.id, ano, mes, 'valorRepassado', e.target.value)}
                                                  className="w-full px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                  placeholder="0,00"
                                                />
                                              </td>
                                              <td className="px-3 py-2">
                                                <input
                                                  type="text"
                                                  value={valores.valorDisponibilizado}
                                                  onChange={(e) => handleCurrencyInput(ente.id, ano, mes, 'valorDisponibilizado', e.target.value)}
                                                  className="w-full px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                  placeholder="0,00"
                                                />
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
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
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/dashboard/aportes')}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedEnte || selectedAnos.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Salvando...' : 'Salvar Aportes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
