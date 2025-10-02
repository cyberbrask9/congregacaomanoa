// services/api.ts
import axios from 'axios';
import { Projeto } from '@/types/projeto';

// implementação gestão de territórios
const API_URL = '/api';

export const projetoService = {
  async listarProjetos(): Promise<Projeto[]> {
    const response = await fetch(`${API_URL}/projetos`, {
      cache: 'no-store' // Para garantir dados sempre atualizados
    });
    if (!response.ok) throw new Error('Erro ao buscar projetos');
    return response.json();
  },

  async cadastrarProjeto(projeto: Omit<Projeto, 'id'>): Promise<Projeto> {
    const response = await fetch(`${API_URL}/projetos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projeto),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao cadastrar projeto');
    }
    return response.json();
  },

 async uploadImagem(file: File): Promise<{ url: string }> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro no upload:', errorText);
      
      let errorMessage = 'Erro ao fazer upload da imagem';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        // Se não for JSON, usar o texto original
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error('Erro no upload:', error);
    throw error;
  }
},

  async atualizarProjeto(id: number, projeto: Partial<Projeto>): Promise<Projeto> {
    const response = await fetch(`${API_URL}/projetos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projeto),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro ao atualizar projeto');
    }
    return response.json();
  },

 async deletarProjeto(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/projetos/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao deletar projeto';
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      // Se a resposta for JSON, leia-a como JSON
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } else {
      // Se não for JSON (provavelmente HTML), leia como texto
      const errorText = await response.text();
      errorMessage = `Erro ${response.status}: ${errorText || errorMessage}`;
    }

    throw new Error(errorMessage);
  }
}
};
// fim gestão território


//antes da implementação mapa
const api = axios.create({
  baseURL: '/api', // Isso já inclui /api
});

export const objetoService = {
  criarObjeto: async (formData: FormData) => {
    try {
      const response = await api.post('/objetos', formData, { // ✅ Correto: /objetos
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
      const response = await api.get('/objetos'); // ✅ Correto: /objetos
      return response.data;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        throw new Error(errorMessage);
    }
  },
  
  excluirObjeto: async (id: number) => {
    try {
      const response = await api.delete(`/objetos?id=${id}`); // ✅ Correto: /objetos
      return response.data;
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        throw new Error(errorMessage);
    }
  },
  
  atualizarObjeto: async (id: number, formData: FormData) => {
    try {
      const response    = await api.put(`/objetos`, formData, { // ✅ Correto: /objetos
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

// endpoint para leito a sentinela 
export const leitorService = {
  processarLeitores: async (mes: number, ano: number) => {
    try {
      const response = await api.post('/objetos', { mes, ano });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(errorMessage);
    }
  }
};

//leitor a sentinela
export const leitorSentinelaService = {
  // Criar nova lista de leitores
  criarListaLeitores: async (mes: number, ano: number) => {
    try {
      const response = await api.post('/leitor-sentinela', { mes, ano });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(errorMessage);
    }
  },

  // Listar todas as listas
  listarListasLeitores: async () => {
    try {
      const response = await api.get('/leitor-sentinela');
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(errorMessage);
    }
  }
};
// fim leitor a sentinela

// Chamada para lista audio e video
export const audioVideoService = {
  // Criar nova lista de áudio e vídeo
  criarListaAudioVideo: async (mes: number, ano: number) => {
    try {
      const response = await api.post('/audio-video', { mes, ano });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(errorMessage);
    }
  },

  // Listar todas as listas
  listarListasAudioVideo: async () => {
    try {
      const response = await api.get('/audio-video');
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(errorMessage);
    }
  },

  // Buscar lista específica
  buscarListaAudioVideo: async (id: number) => {
    try {
      const response = await api.get(`/audio-video/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(errorMessage);
    }
  },

  // Atualizar lista
  atualizarListaAudioVideo: async (id: number, dados: { pessoaparte: Objeto[]; dataav?: DataComPessoaAV[] }) => {
    try {
      const response = await api.put(`/audio-video/${id}`, dados);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(errorMessage);
    }
  },

  // Excluir lista
  excluirListaAudioVideo: async (id: number) => {
    try {
      const response = await api.delete(`/audio-video/${id}`);
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      throw new Error(errorMessage);
    }
  }
};
// Fim lista audio e video