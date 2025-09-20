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
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao criar objeto');
    }
  },

  listarObjetos: async () => {
    try {
      const response = await api.get('/objetos');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao carregar objetos');
    }
  },
  excluirObjeto: async (id: number) => {
    try {
      const response = await api.delete(`/objetos?id=${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao excluir objeto');
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
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erro ao atualizar objeto');
    }
  }
};