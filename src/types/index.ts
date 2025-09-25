export interface Objeto {
  id: number;
  nome: string;
  atribuição: string;
  privilégio: string;
  foto: string;
  dataCriacao: Date;
}

export interface CreateObjetoDto {
  nome: string;
  atribuição: string;
  privilégio: string;
  foto: File;
}

export interface Projeto {
   id: number;
  numero: number;
  descricao?: string; // Opcional
  datainicio: string;
  datafim?: string;   // Opcional
  responsavel: string;
  concluido: boolean; // Deve ser boolean, não number
  img?: string;       // Opcional
  created_at?: string;
  updated_at?: string;
}
export type Ordenacao = 'datafim_asc' | 'datafim_desc' | 'numero_asc' | 'numero_desc';