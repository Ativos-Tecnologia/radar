export interface PrecatorioEvento {
  id: string;
  ordem: number;
  data: string;
  valor: number;
  tipo: string;
}

export interface Precatorio {
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
