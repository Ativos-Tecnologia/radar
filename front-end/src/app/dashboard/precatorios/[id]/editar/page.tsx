'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { EnteHierarchySelect } from '@/components/ente-hierarchy-select';
import { api } from '@/lib/api';
import {
  formatISODateTimeToBR,
  formatISODateToBR,
  normalizeBRDateInput,
  normalizeBRDateTimeInput,
  parseBRDateTimeToISO,
  parseBRDateToISO,
} from '@/lib/utils';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';

interface EnteOption {
  id: string;
  nome: string;
  entePrincipal?: { id: string | null } | null;
}

interface TribunalOption {
  id: string;
  nome: string;
  sigla: string;
}

interface EventoForm {
  id?: string;
  data: string;
  valor: string;
  tipo: string;
}

const naturezaOptions = [
  { value: 'ALIMENTAR', label: 'Alimentar' },
  { value: 'COMUM', label: 'Comum' },
  { value: 'OUTROS', label: 'Outros' },
];

const eventoTipoOptions = [
  { value: 'Preferência', label: 'Preferência' },
  { value: 'Cronológica', label: 'Cronológica' },
  { value: 'Acordo', label: 'Acordo' },
  { value: 'Suspenso', label: 'Suspenso' },
  { value: 'Não aplicado', label: 'Não aplicado' },
];

export default function EditarPrecatorioPage() {
  const router = useRouter();
  const params = useParams();
  const [entes, setEntes] = useState<EnteOption[]>([]);
  const [tribunais, setTribunais] = useState<TribunalOption[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [formData, setFormData] = useState({
    enteId: '',
    tribunalId: '',
    npu: '',
    processoOriginario: '',
    natureza: 'ALIMENTAR',
    fonte: '',
    ordemCronologica: '',
    anoLoa: '',
    dataLoa: '',
    dataTransmissao: '',
    valorAcao: '',
    advogadosDevedora: '',
    advogadosCredora: '',
    observacoes: '',
    dataAtualizacao: '',
  });
  const [eventos, setEventos] = useState<EventoForm[]>([]);

  const parseOptionalDate = (value: string, label: string) => {
    if (!value) return undefined;
    const iso = parseBRDateToISO(value);
    if (!iso) {
      throw new Error(`${label} inválida. Use o formato DD/MM/AAAA.`);
    }
    return iso;
  };

  const parseOptionalDateTime = (value: string, label: string) => {
    if (!value) return undefined;
    const iso = parseBRDateTimeToISO(value);
    if (!iso) {
      throw new Error(`${label} inválida. Use o formato DD/MM/AAAA HH:MM.`);
    }
    return iso;
  };

  const parseRequiredDate = (value: string, label: string) => {
    const iso = parseBRDateToISO(value);
    if (!iso) {
      throw new Error(`${label} inválida. Use o formato DD/MM/AAAA.`);
    }
    return iso;
  };

  const isCustomTipo = (tipo: string) => !eventoTipoOptions.some((opt) => opt.value === tipo);

  useEffect(() => {
    const load = async () => {
      try {
        const [entesData, tribunaisData, precatorio] = await Promise.all([
          api.entes.getAll(),
          api.tribunais.getAll(),
          api.precatorios.get(params.id as string),
        ]);
        setEntes(entesData);
        setTribunais(tribunaisData);
        setFormData({
          enteId: precatorio.ente.id,
          tribunalId: precatorio.tribunal.id,
          npu: precatorio.npu,
          processoOriginario: precatorio.processoOriginario || '',
          natureza: precatorio.natureza,
          fonte: precatorio.fonte || '',
          ordemCronologica: precatorio.ordemCronologica || '',
          anoLoa: precatorio.anoLoa ? String(precatorio.anoLoa) : '',
          dataLoa: formatISODateToBR(precatorio.dataLoa),
          dataTransmissao: formatISODateToBR(precatorio.dataTransmissao),
          valorAcao: precatorio.valorAcao ? String(precatorio.valorAcao) : '',
          advogadosDevedora: precatorio.advogadosDevedora || '',
          advogadosCredora: precatorio.advogadosCredora || '',
          observacoes: precatorio.observacoes || '',
          dataAtualizacao: formatISODateTimeToBR(precatorio.dataAtualizacao),
        });
        setEventos(
          precatorio.precatorioEventos.map((evento: any) => ({
            id: evento.id,
            data: formatISODateToBR(evento.data),
            valor: String(evento.valor),
            tipo: evento.tipo,
          }))
        );
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message || 'Erro ao carregar dados' });
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [params.id]);

  const handleEventoChange = (index: number, field: keyof EventoForm, value: string) => {
    setEventos((prev) => prev.map((evento, i) => (i === index ? { ...evento, [field]: value } : evento)));
  };

  const addEvento = () => setEventos((prev) => [...prev, { data: '', valor: '', tipo: 'Preferência' }]);
  const removeEvento = (index: number) => setEventos((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const dataLoaISO = parseOptionalDate(formData.dataLoa, 'Data LOA');
      const dataTransmissaoISO = parseOptionalDate(formData.dataTransmissao, 'Data transmissão');
      const dataAtualizacaoISO = parseOptionalDateTime(formData.dataAtualizacao, 'Data atualização');

      const eventosPayload = eventos
        .filter((evento) => evento.data && evento.valor && evento.tipo)
        .map((evento, index) => ({
          data: parseRequiredDate(evento.data, `Data do evento ${index + 1}`),
          valor: Number(evento.valor),
          tipo: evento.tipo,
        }));

      await api.precatorios.update(params.id as string, {
        ...formData,
        enteId: formData.enteId,
        anoLoa: formData.anoLoa ? Number(formData.anoLoa) : undefined,
        valorAcao: formData.valorAcao ? Number(formData.valorAcao) : undefined,
        dataLoa: dataLoaISO,
        dataTransmissao: dataTransmissaoISO,
        dataAtualizacao: dataAtualizacaoISO,
        eventos: eventosPayload,
      });
      setMessage({ type: 'success', text: 'Precatório atualizado com sucesso!' });
      setTimeout(() => router.push('/dashboard/precatorios'), 1200);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar precatório' });
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
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/dashboard/precatorios')}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Editar Precatório</h1>
            <p className="text-gray-600 dark:text-gray-400">Atualize as informações necessárias</p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnteHierarchySelect
                entes={entes}
                value={formData.enteId}
                onChange={(enteId) => setFormData({ ...formData, enteId })}
                label="Ente *"
                placeholder="Buscar ente ou navegar na hierarquia"
                helperText="Digite para filtrar ou expanda os entes vinculados"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tribunal *</label>
                <select
                  value={formData.tribunalId}
                  onChange={(e) => setFormData({ ...formData, tribunalId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Selecione um tribunal...</option>
                  {tribunais.map((tribunal) => (
                    <option key={tribunal.id} value={tribunal.id}>
                      {tribunal.sigla} - {tribunal.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">NPU *</label>
                <input
                  type="text"
                  value={formData.npu}
                  onChange={(e) => setFormData({ ...formData, npu: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Processo originário</label>
                <input
                  type="text"
                  value={formData.processoOriginario}
                  onChange={(e) => setFormData({ ...formData, processoOriginario: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Natureza *</label>
                <select
                  value={formData.natureza}
                  onChange={(e) => setFormData({ ...formData, natureza: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {naturezaOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fonte</label>
                <input
                  type="text"
                  value={formData.fonte}
                  onChange={(e) => setFormData({ ...formData, fonte: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ordem cronológica</label>
                <input
                  type="text"
                  value={formData.ordemCronologica}
                  onChange={(e) => setFormData({ ...formData, ordemCronologica: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ano LOA</label>
                <input
                  type="number"
                  value={formData.anoLoa}
                  onChange={(e) => setFormData({ ...formData, anoLoa: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data LOA</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/AAAA"
                  value={formData.dataLoa}
                  onChange={(e) => setFormData({ ...formData, dataLoa: normalizeBRDateInput(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data transmissão</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/AAAA"
                  value={formData.dataTransmissao}
                  onChange={(e) => setFormData({ ...formData, dataTransmissao: normalizeBRDateInput(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valor da ação (R$)</label>
                <input
                  type="number"
                  value={formData.valorAcao}
                  onChange={(e) => setFormData({ ...formData, valorAcao: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  min={0}
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Advogados (devedora)</label>
                <input
                  type="text"
                  value={formData.advogadosDevedora}
                  onChange={(e) => setFormData({ ...formData, advogadosDevedora: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Advogados (credora)</label>
                <input
                  type="text"
                  value={formData.advogadosCredora}
                  onChange={(e) => setFormData({ ...formData, advogadosCredora: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Observações</label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data atualização</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/AAAA HH:MM"
                value={formData.dataAtualizacao}
                onChange={(e) => setFormData({ ...formData, dataAtualizacao: normalizeBRDateTimeInput(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Eventos</label>
                {eventos.map((evento, index) => (
                  <div key={evento.id ?? `novo-${index}`} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Data</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="DD/MM/AAAA"
                        value={evento.data}
                        onChange={(e) => handleEventoChange(index, 'data', normalizeBRDateInput(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valor (R$)</label>
                      <input
                        type="number"
                        value={evento.valor}
                        onChange={(e) => handleEventoChange(index, 'valor', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        min={0}
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo</label>
                      <select
                        value={isCustomTipo(evento.tipo) ? '__custom' : evento.tipo}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '__custom') {
                            handleEventoChange(index, 'tipo', '');
                          } else {
                            handleEventoChange(index, 'tipo', value);
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark-border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {eventoTipoOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                        <option value="__custom">Outro (especificar)</option>
                      </select>
                      {isCustomTipo(evento.tipo) && (
                        <input
                          type="text"
                          value={evento.tipo}
                          onChange={(e) => handleEventoChange(index, 'tipo', e.target.value)}
                          className="mt-2 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Digite o tipo"
                        />
                      )}
                    </div>
                    <div className="md:col-span-3">
                      <button
                        type="button"
                        onClick={() => removeEvento(index)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={addEvento}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Plus className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                </div>
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
