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