export interface Tribunal {
  id: string;
  nome: string;
  sigla: string;
  tipo: string;
  uf: string | null;
  regiao: number | null;
  ativo: boolean;
}
