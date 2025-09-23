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
  id?: string;
  numero: number;
  descricao: string;
  datainicio: string;
  datafim: string;
  responsavel: string;
  concluido: boolean;
  img?: string;
}
export type Ordenacao = 'datafim_asc' | 'datafim_desc' | 'numero_asc' | 'numero_desc';