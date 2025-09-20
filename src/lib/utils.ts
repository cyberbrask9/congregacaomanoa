import { Objeto } from '@/types';

// Simulação de "banco de dados" em memória
let objetos: Objeto[] = [];

export const db = {
  // Criar novo objeto
  create: async (objeto: Omit<Objeto, 'id' | 'dataCriacao'>): Promise<Objeto> => {
    const novoObjeto: Objeto = {
      ...objeto,
      id: Math.floor(Math.random() * 1000000),
      dataCriacao: new Date()
    };
    
    objetos.push(novoObjeto);
    return novoObjeto;
  },

  // Listar todos os objetos
  findAll: async (): Promise<Objeto[]> => {
    return objetos;
  },

  // Encontrar objeto por ID
  findById: async (id: number): Promise<Objeto | undefined> => {
    return objetos.find(o => o.id === id);
  }
};