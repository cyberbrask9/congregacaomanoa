import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const objetoService = {
  criarObjeto: async (formData: FormData) => {
    try {
      const response = await api.post('/objetos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        throw new Error(errorMessage);
    }
  },

  listarObjetos: async () => {
    try {
      const response = await api.get('/objetos');
      return response.data;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        throw new Error(errorMessage);
    }
  },
  excluirObjeto: async (id: number) => {
    try {
      const response = await api.delete(`/objetos?id=${id}`);
      return response.data;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        throw new Error(errorMessage);
    }
  },
  // Atualizar objeto
  atualizarObjeto: async (id: number, formData: FormData) => {
    try {
      const response = await api.put(`/objetos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          throw new Error(errorMessage);
    }
  }
};