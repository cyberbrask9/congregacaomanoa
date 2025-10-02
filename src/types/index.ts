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

export interface Leitor {
  id: string;
  nome: string;
  privilégio?: string;
  [key: string]: unknown;
}

export interface DataComLeitor {
  data: string;
  leitor: Leitor;
}

export interface LeitorListaSentinela {
  id: number;
  idlistsentina: string;
  nomemes: string;
  dataleitorsentinela: DataComLeitor[];
  leitoriosparte: Leitor[];
  dataCriacao: Date;
}

// interface para lista audio e video
export interface DataComPessoaAV {
  data: string;
  pessoa: Objeto | null;
}

export interface AudioVideoLista {
  id: number;
  idlistaav: string;
  nomemes: string;
  dataav: DataComPessoaAV[];
  pessoaparte: Objeto[];
  dataCriacao: Date;
}
