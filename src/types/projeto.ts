export interface Projeto {
  id?: number;
  numero: number;
  descricao?: string;
  datainicio: string;
  datafim?: string;
  responsavel: string;
  concluido: boolean;
  img?: string;
  created_at?: string;
}

export type Ordenacao = 'datafim_asc' | 'datafim_desc' | 'numero_asc' | 'numero_desc';