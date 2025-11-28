export interface EntePrincipalResumo {
  id: string;
  nome: string;
  tipo: string;
}

export interface EnteVinculadoResumo {
  id: string;
  nome: string;
  tipo: string;
}

export interface Ente {
  id: string;
  nome: string;
  cnpj: string | null;
  tipo: string;
  uf: string | null;
  regime?: 'ESPECIAL' | 'COMUM';
  ativo: boolean;
  entePrincipal?: EntePrincipalResumo | null;
  entesVinculados?: EnteVinculadoResumo[];
}
