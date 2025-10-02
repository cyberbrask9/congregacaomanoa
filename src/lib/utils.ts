import db from './database';
import { Objeto, LeitorListaSentinela, Leitor, DataComLeitor } from '@/types';

// Interface para o resultado do banco de dados (row)
interface DatabaseRow {
  [key: string]: unknown;
  id: number;
  idlistsentina: string;
  nomemes: string;
  dataleitorsentinela: string;
  leitoriosparte: string;
  dataCriacao: string | Date;
}

export const dbUtils = {
  // Criar novo objeto
  create: async (objeto: Omit<Objeto, 'id' | 'dataCriacao'>): Promise<Objeto> => {
    const stmt = db.prepare(`
      INSERT INTO objetos (nome, atribuição, privilégio, foto)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      objeto.nome,
      objeto.atribuição,
      objeto.privilégio,
      objeto.foto
    );

    const newObj = db.prepare('SELECT * FROM objetos WHERE id = ?').get(result.lastInsertRowid);
    return newObj as Objeto;
  },

  // Listar todos os objetos
  findAll: async (): Promise<Objeto[]> => {
    const stmt = db.prepare('SELECT * FROM objetos ORDER BY dataCriacao DESC');
    const objetos = stmt.all();
    return objetos as Objeto[];
  },

  // Encontrar objeto por ID
  findById: async (id: number): Promise<Objeto | undefined> => {
    const stmt = db.prepare('SELECT * FROM objetos WHERE id = ?');
    const objeto = stmt.get(id);
    return objeto as Objeto | undefined;
  },

  // Atualizar objeto
  update: async (id: number, objeto: Partial<Objeto>): Promise<Objeto> => {
    const fields = [];
    const values = [];
    
    if (objeto.nome) {
      fields.push('nome = ?');
      values.push(objeto.nome);
    }
    if (objeto.atribuição) {
      fields.push('atribuição = ?');
      values.push(objeto.atribuição);
    }
    if (objeto.privilégio) {
      fields.push('privilégio = ?');
      values.push(objeto.privilégio);
    }
    if (objeto.foto !== undefined) {
      fields.push('foto = ?');
      values.push(objeto.foto);
    }

    if (fields.length > 0) {
      const stmt = db.prepare(`
        UPDATE objetos 
        SET ${fields.join(', ')} 
        WHERE id = ?
      `);
      
      stmt.run(...values, id);
    }

    const updatedObj = db.prepare('SELECT * FROM objetos WHERE id = ?').get(id);
    return updatedObj as Objeto;
  },

  // Excluir objeto
  delete: async (id: number): Promise<void> => {
    const stmt = db.prepare('DELETE FROM objetos WHERE id = ?');
    stmt.run(id);
  }
};

// Operações para leitorlistsentinela
export const leitorListSentinelaUtils = {
  // Criar novo leitorlistsentinela - CORRIGIDO
  create: async (leitorData: Omit<LeitorListaSentinela, 'id' | 'dataCriacao'>): Promise<LeitorListaSentinela> => {
    try {
      const stmt = db.prepare(`
        INSERT INTO leitorlistsentinela (idlistsentina, nomemes, dataleitorsentinela, leitoriosparte)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        leitorData.idlistsentina,
        leitorData.nomemes,
        JSON.stringify(leitorData.dataleitorsentinela || []), // CORREÇÃO: tratamento para undefined
        JSON.stringify(leitorData.leitoriosparte || []) // CORREÇÃO: tratamento para undefined
      );

      // CORREÇÃO: Buscar o objeto criado com todas as colunas
      const newObj = db.prepare('SELECT * FROM leitorlistsentinela WHERE id = ?').get(result.lastInsertRowid) as DatabaseRow;
      
      if (!newObj) {
        throw new Error('Falha ao criar lista de leitores');
      }

      // Converter strings JSON de volta para arrays com tipos específicos
      return {
        id: newObj.id as number,
        idlistsentina: newObj.idlistsentina as string,
        nomemes: newObj.nomemes as string,
        dataleitorsentinela: JSON.parse(newObj.dataleitorsentinela as string) as DataComLeitor[],
        leitoriosparte: JSON.parse(newObj.leitoriosparte as string) as Leitor[],
        dataCriacao: new Date(newObj.dataCriacao as string)
      } as LeitorListaSentinela;
    } catch (error) {
      console.error('Erro ao criar lista de leitores:', error);
      throw error;
    }
  },

  // Listar todos os leitorlistsentinela - CORRIGIDO
  findAll: async (): Promise<LeitorListaSentinela[]> => {
    try {
      const stmt = db.prepare('SELECT * FROM leitorlistsentinela ORDER BY dataCriacao DESC');
      const leitores = stmt.all() as DatabaseRow[];
      
      return leitores.map(leitor => ({
        id: leitor.id as number,
        idlistsentina: leitor.idlistsentina as string,
        nomemes: leitor.nomemes as string,
        dataleitorsentinela: JSON.parse(leitor.dataleitorsentinela as string) as DataComLeitor[],
        leitoriosparte: JSON.parse(leitor.leitoriosparte as string) as Leitor[],
        dataCriacao: new Date(leitor.dataCriacao as string)
      })) as LeitorListaSentinela[];
    } catch (error) {
      console.error('Erro ao buscar listas de leitores:', error);
      return [];
    }
  },

  // Encontrar por ID numérico - NOVA FUNÇÃO ADICIONADA
  findById: async (id: number): Promise<LeitorListaSentinela | undefined> => {
    try {
      const stmt = db.prepare('SELECT * FROM leitorlistsentinela WHERE id = ?');
      const leitor = stmt.get(id) as DatabaseRow;
      
      if (!leitor) return undefined;
      
      return {
        id: leitor.id as number,
        idlistsentina: leitor.idlistsentina as string,
        nomemes: leitor.nomemes as string,
        dataleitorsentinela: JSON.parse(leitor.dataleitorsentinela as string) as DataComLeitor[],
        leitoriosparte: JSON.parse(leitor.leitoriosparte as string) as Leitor[],
        dataCriacao: new Date(leitor.dataCriacao as string)
      } as LeitorListaSentinela;
    } catch (error) {
      console.error('Erro ao buscar lista por ID:', error);
      return undefined;
    }
  },

  // Encontrar por idlistsentina - CORRIGIDO
  findByIdLista: async (idlistsentina: string): Promise<LeitorListaSentinela | undefined> => {
    try {
      const stmt = db.prepare('SELECT * FROM leitorlistsentinela WHERE idlistsentina = ?');
      const leitor = stmt.get(idlistsentina) as DatabaseRow;
      
      if (!leitor) return undefined;
      
      return {
        id: leitor.id as number,
        idlistsentina: leitor.idlistsentina as string,
        nomemes: leitor.nomemes as string,
        dataleitorsentinela: JSON.parse(leitor.dataleitorsentinela as string) as DataComLeitor[],
        leitoriosparte: JSON.parse(leitor.leitoriosparte as string) as Leitor[],
        dataCriacao: new Date(leitor.dataCriacao as string)
      } as LeitorListaSentinela;
    } catch (error) {
      console.error('Erro ao buscar lista por idlistsentina:', error);
      return undefined;
    }
  },

  // Atualizar leitorlistsentinela - CORRIGIDO
  update: async (id: number, leitorData: Partial<LeitorListaSentinela>): Promise<LeitorListaSentinela> => {
    try {
      const fields = [];
      const values = [];
      
      // CORREÇÃO: Adicionar validações mais robustas
      if (leitorData.nomemes !== undefined) {
        fields.push('nomemes = ?');
        values.push(leitorData.nomemes);
      }
      if (leitorData.dataleitorsentinela !== undefined) {
        fields.push('dataleitorsentinela = ?');
        values.push(JSON.stringify(leitorData.dataleitorsentinela));
      }
      if (leitorData.leitoriosparte !== undefined) {
        fields.push('leitoriosparte = ?');
        values.push(JSON.stringify(leitorData.leitoriosparte));
      }
      if (leitorData.idlistsentina !== undefined) {
        fields.push('idlistsentina = ?');
        values.push(leitorData.idlistsentina);
      }

      if (fields.length === 0) {
        throw new Error('Nenhum campo fornecido para atualização');
      }

      const stmt = db.prepare(`
        UPDATE leitorlistsentinela 
        SET ${fields.join(', ')} 
        WHERE id = ?
      `);
      
      const result = stmt.run(...values, id);

      if (result.changes === 0) {
        throw new Error('Lista não encontrada para atualização');
      }

      // CORREÇÃO: Buscar o objeto atualizado
      const updatedObj = db.prepare('SELECT * FROM leitorlistsentinela WHERE id = ?').get(id) as DatabaseRow;
      
      if (!updatedObj) {
        throw new Error('Falha ao recuperar lista atualizada');
      }

      return {
        id: updatedObj.id as number,
        idlistsentina: updatedObj.idlistsentina as string,
        nomemes: updatedObj.nomemes as string,
        dataleitorsentinela: JSON.parse(updatedObj.dataleitorsentinela as string) as DataComLeitor[],
        leitoriosparte: JSON.parse(updatedObj.leitoriosparte as string) as Leitor[],
        dataCriacao: new Date(updatedObj.dataCriacao as string)
      } as LeitorListaSentinela;
    } catch (error) {
      console.error('Erro ao atualizar lista de leitores:', error);
      throw error;
    }
  },

  // Deletar leitorlistsentinela - CORRIGIDO
  delete: async (id: number): Promise<boolean> => {
    try {
      const stmt = db.prepare('DELETE FROM leitorlistsentinela WHERE id = ?');
      const result = stmt.run(id);
      
      // CORREÇÃO: Retornar boolean indicando sucesso
      return result.changes > 0;
    } catch (error) {
      console.error('Erro ao deletar lista de leitores:', error);
      throw error;
    }
  }
};

// Funções ao seu leitorListSentinelaUtils ou crie um novo objeto:

export const audioVideoUtils = {
  // Criar nova lista de áudio e vídeo
  create: async (audioVideoData: Omit<AudioVideoLista, 'id' | 'dataCriacao'>): Promise<AudioVideoLista> => {
    try {
      const stmt = db.prepare(`
        INSERT INTO audioVideoLista (idlistaav, nomemes, dataav, pessoaparte)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = stmt.run(
        audioVideoData.idlistaav,
        audioVideoData.nomemes,
        JSON.stringify(audioVideoData.dataav || []),
        JSON.stringify(audioVideoData.pessoaparte || [])
      );

      const newObj = db.prepare('SELECT * FROM audioVideoLista WHERE id = ?').get(result.lastInsertRowid) as DatabaseRow;
      
      if (!newObj) {
        throw new Error('Falha ao criar lista de áudio e vídeo');
      }

      return {
        id: newObj.id as number,
        idlistaav: newObj.idlistaav as string,
        nomemes: newObj.nomemes as string,
        dataav: JSON.parse(newObj.dataav as string) as DataComPessoaAV[],
        pessoaparte: JSON.parse(newObj.pessoaparte as string) as Objeto[],
        dataCriacao: new Date(newObj.dataCriacao as string)
      } as AudioVideoLista;
    } catch (error) {
      console.error('Erro ao criar lista de áudio e vídeo:', error);
      throw error;
    }
  },

  // Listar todas as listas de áudio e vídeo
  findAll: async (): Promise<AudioVideoLista[]> => {
    try {
      const stmt = db.prepare('SELECT * FROM audioVideoLista ORDER BY dataCriacao DESC');
      const audioVideos = stmt.all() as DatabaseRow[];
      
      return audioVideos.map(item => ({
        id: item.id as number,
        idlistaav: item.idlistaav as string,
        nomemes: item.nomemes as string,
        dataav: JSON.parse(item.dataav as string) as DataComPessoaAV[],
        pessoaparte: JSON.parse(item.pessoaparte as string) as Objeto[],
        dataCriacao: new Date(item.dataCriacao as string)
      })) as AudioVideoLista[];
    } catch (error) {
      console.error('Erro ao buscar listas de áudio e vídeo:', error);
      return [];
    }
  },

  // Encontrar por ID
  findById: async (id: number): Promise<AudioVideoLista | undefined> => {
    try {
      const stmt = db.prepare('SELECT * FROM audioVideoLista WHERE id = ?');
      const audioVideo = stmt.get(id) as DatabaseRow;
      
      if (!audioVideo) return undefined;
      
      return {
        id: audioVideo.id as number,
        idlistaav: audioVideo.idlistaav as string,
        nomemes: audioVideo.nomemes as string,
        dataav: JSON.parse(audioVideo.dataav as string) as DataComPessoaAV[],
        pessoaparte: JSON.parse(audioVideo.pessoaparte as string) as Objeto[],
        dataCriacao: new Date(audioVideo.dataCriacao as string)
      } as AudioVideoLista;
    } catch (error) {
      console.error('Erro ao buscar lista de áudio e vídeo por ID:', error);
      return undefined;
    }
  },

  // Atualizar lista
  update: async (id: number, audioVideoData: Partial<AudioVideoLista>): Promise<AudioVideoLista> => {
    try {
      const fields = [];
      const values = [];
      
      if (audioVideoData.nomemes !== undefined) {
        fields.push('nomemes = ?');
        values.push(audioVideoData.nomemes);
      }
      if (audioVideoData.dataav !== undefined) {
        fields.push('dataav = ?');
        values.push(JSON.stringify(audioVideoData.dataav));
      }
      if (audioVideoData.pessoaparte !== undefined) {
        fields.push('pessoaparte = ?');
        values.push(JSON.stringify(audioVideoData.pessoaparte));
      }
      if (audioVideoData.idlistaav !== undefined) {
        fields.push('idlistaav = ?');
        values.push(audioVideoData.idlistaav);
      }

      if (fields.length === 0) {
        throw new Error('Nenhum campo fornecido para atualização');
      }

      const stmt = db.prepare(`
        UPDATE audioVideoLista 
        SET ${fields.join(', ')} 
        WHERE id = ?
      `);
      
      const result = stmt.run(...values, id);

      if (result.changes === 0) {
        throw new Error('Lista não encontrada para atualização');
      }

      const updatedObj = db.prepare('SELECT * FROM audioVideoLista WHERE id = ?').get(id) as DatabaseRow;
      
      if (!updatedObj) {
        throw new Error('Falha ao recuperar lista atualizada');
      }

      return {
        id: updatedObj.id as number,
        idlistaav: updatedObj.idlistaav as string,
        nomemes: updatedObj.nomemes as string,
        dataav: JSON.parse(updatedObj.dataav as string) as DataComPessoaAV[],
        pessoaparte: JSON.parse(updatedObj.pessoaparte as string) as Objeto[],
        dataCriacao: new Date(updatedObj.dataCriacao as string)
      } as AudioVideoLista;
    } catch (error) {
      console.error('Erro ao atualizar lista de áudio e vídeo:', error);
      throw error;
    }
  },

  // Deletar lista
  delete: async (id: number): Promise<boolean> => {
    try {
      const stmt = db.prepare('DELETE FROM audioVideoLista WHERE id = ?');
      const result = stmt.run(id);
      
      return result.changes > 0;
    } catch (error) {
      console.error('Erro ao deletar lista de áudio e vídeo:', error);
      throw error;
    }
  }
};