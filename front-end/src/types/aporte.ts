export interface EnteAporte {
  id: string;
  nome: string;
  cnpj?: string;
  tipo: string;
  entePrincipal?: EnteAporte;
  entesVinculados?: EnteAporte[];
}

export interface Aporte {
  id: string;
  enteId: string;
  ano: number;
  mes: number;
  conta1: number;
  conta2: number;
  valorRepassado: number;
  valorDisponibilizado: number;
  ente: EnteAporte;
  createdAt: string;
  updatedAt: string;
}
