export interface EnteResumoRcl {
  id: string;
  nome: string;
  tipo: string;
}

export interface RclItem {
  id: string;
  ano: number;
  valor: number;
  tipo: "PREVISTO" | "REALIZADO";
  percentual: number;
  ativo: boolean;
  observacao?: string | null;
  ente: EnteResumoRcl;
}
