export interface Saldo {
  id: string;
  etiqueta?: string | null;
  regime: "ESPECIAL" | "COMUM";
  contaI: number;
  contaII: number;
  competencia: string;
  observacoes?: string | null;
  ente: { id: string; nome: string };
}
