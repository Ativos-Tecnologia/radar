'use client';

import { useMemo, useState } from 'react';
import { Building2, ChevronDown, Search, Loader2 } from 'lucide-react';
import { useEnte } from '@/contexts/ente-context';

export function EnteSelector() {
  const { enteAtual, entes, setEnteAtual, loadingEntes, errorEntes } = useEnte();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUf, setSelectedUf] = useState<string>('');

  const ufs = useMemo(() => {
    const set = new Set<string>();
    entes.forEach((e) => {
      if (e.uf) set.add(e.uf);
    });
    return Array.from(set).sort();
  }, [entes]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entes.filter((e) => {
      const matchesUf = selectedUf ? e.uf === selectedUf : true;
      if (!matchesUf) return false;

      if (!term) return true;
      const base = `${e.nome} ${e.tipo} ${e.uf ?? ''}`.toLowerCase();
      return base.includes(term);
    });
  }, [entes, selectedUf, search]);

  const handleSelect = (id: string | null) => {
    if (!id) {
      setEnteAtual(null);
      setOpen(false);
      return;
    }
    const ente = entes.find((e) => e.id === id);
    if (ente) {
      setEnteAtual(ente);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/90 dark:bg-gradient-to-r dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200 dark:border-slate-700/70 hover:border-blue-400 dark:hover:border-blue-500/80 hover:shadow-blue-500/10 dark:hover:shadow-blue-500/20 transition-all min-w-[220px] max-w-xs"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-inner">
          <Building2 className="w-4 h-4" />
        </div>
        <div className="flex-1 text-left overflow-hidden">
          <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Ente atual</p>
          <p className="text-sm font-semibold truncate text-slate-900 dark:text-slate-100">
            {enteAtual ? enteAtual.nome : 'Selecione um ente'}
          </p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 dark:text-slate-300 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[320px] max-h-[360px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-40">
          <div className="px-3 pt-3 pb-2 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50 dark:bg-gradient-to-r dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-1">Contexto de ente</p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
              Escolha o ente que será usado em todas as telas de dados.
            </p>
            <div className="flex flex-col gap-2">
              <select
                value={selectedUf}
                onChange={(e) => setSelectedUf(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-400/70"
              >
                <option value="">Todos os estados</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome ou tipo"
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-400/70"
                />
              </div>
            </div>
          </div>

          <div className="max-h-[260px] overflow-y-auto bg-white dark:bg-slate-950/90">
            {loadingEntes && (
              <div className="px-4 py-6 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando entes...
              </div>
            )}

            {!loadingEntes && errorEntes && (
              <div className="px-4 py-4 text-xs text-red-600 dark:text-red-300">
                {errorEntes}
              </div>
            )}

            {!loadingEntes && !errorEntes && (
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => handleSelect(null)}
                  className={`w-full px-4 py-2 text-left text-xs flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors ${
                    !enteAtual
                      ? 'text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-slate-800/60'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="inline-flex w-5 h-5 items-center justify-center rounded-full border border-slate-300 dark:border-slate-600 text-[10px]">
                    *
                  </span>
                  <span className="font-medium truncate">Todos os entes</span>
                </button>

                {filtered.length === 0 && (
                  <div className="px-4 py-4 text-xs text-slate-500 dark:text-slate-500">
                    Nenhum ente encontrado para essa busca.
                  </div>
                )}

                {filtered.map((ente) => {
                  const isActive = enteAtual?.id === ente.id;
                  return (
                    <button
                      key={ente.id}
                      type="button"
                      onClick={() => handleSelect(ente.id)}
                      className={`w-full px-4 py-2 text-left flex items-center gap-3 text-xs hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-semibold truncate">{ente.nome}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em]">
                          {ente.tipo}
                          {ente.uf ? ` • ${ente.uf}` : ''}
                        </span>
                      </div>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-600/90 text-[10px] font-semibold text-white">
                          ATUAL
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
