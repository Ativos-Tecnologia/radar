"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { api } from "@/lib/api";

export interface EnteResumo {
  id: string;
  nome: string;
  tipo: string;
  uf?: string | null;
}

interface EnteContextType {
  enteAtual: EnteResumo | null;
  setEnteAtual: (ente: EnteResumo | null) => void;
  entes: EnteResumo[];
  loadingEntes: boolean;
  errorEntes: string | null;
}

const EnteContext = createContext<EnteContextType | undefined>(undefined);

interface RawEnte {
  id: string;
  nome: string;
  tipo: string;
  uf?: string | null;
  ativo?: boolean;
}

const STORAGE_KEY = "radar_ente_atual";

export function EnteProvider({ children }: { children: ReactNode }) {
  const [entes, setEntes] = useState<EnteResumo[]>([]);
  const [enteAtual, setEnteAtualState] = useState<EnteResumo | null>(null);
  const [loadingEntes, setLoadingEntes] = useState(true);
  const [errorEntes, setErrorEntes] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as EnteResumo;
        setEnteAtualState(parsed);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const loadEntes = async () => {
      try {
        setLoadingEntes(true);
        setErrorEntes(null);
        const data = (await api.entes.getAll()) as RawEnte[];
        const ativos = data.filter((e) => e.ativo !== false);
        const mapped: EnteResumo[] = ativos.map((e) => ({
          id: e.id,
          nome: e.nome,
          tipo: e.tipo,
          uf: e.uf ?? null,
        }));
        setEntes(mapped);

        setEnteAtualState((current) => {
          if (!current && mapped.length === 1) {
            const unico = mapped[0];
            if (typeof window !== "undefined") {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(unico));
            }
            return unico;
          }

          if (current && !mapped.find((e) => e.id === current.id)) {
            if (typeof window !== "undefined") {
              localStorage.removeItem(STORAGE_KEY);
            }
            return null;
          }

          return current;
        });
      } catch (error: any) {
        setErrorEntes(error?.message || "Erro ao carregar entes");
      } finally {
        setLoadingEntes(false);
      }
    };

    loadEntes();
  }, []);

  const setEnteAtual = (ente: EnteResumo | null) => {
    setEnteAtualState(ente);
    if (typeof window === "undefined") return;
    if (ente) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ente));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const value: EnteContextType = useMemo(
    () => ({ enteAtual, setEnteAtual, entes, loadingEntes, errorEntes }),
    [enteAtual, entes, loadingEntes, errorEntes]
  );

  return <EnteContext.Provider value={value}>{children}</EnteContext.Provider>;
}

export function useEnte() {
  const ctx = useContext(EnteContext);
  if (!ctx) {
    throw new Error("useEnte must be used within an EnteProvider");
  }
  return ctx;
}
