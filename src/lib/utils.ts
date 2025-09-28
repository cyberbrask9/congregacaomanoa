import db from './database';
import { Objeto } from '@/types';

// Adicione esta interface no início do arquivo (após as importações)
export interface LeitorListSentinela {
  id: number;
  idlistsentina: string;
  nomemes: string;
  dataleitorsentinela: string[]; // Array de datas
  leitoriosparte: Objeto[]; // Array de objetos leitores
  dataCriacao: Date;
}

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
  // Criar novo leitorlistsentinela
  create: async (leitorData: Omit<LeitorListSentinela, 'id' | 'dataCriacao'>): Promise<LeitorListSentinela> => {
    const stmt = db.prepare(`
      INSERT INTO leitorlistsentinela (idlistsentina, nomemes, dataleitorsentinela, leitoriosparte)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      leitorData.idlistsentina,
      leitorData.nomemes,
      JSON.stringify(leitorData.dataleitorsentinela), // Salva array como JSON
      JSON.stringify(leitorData.leitoriosparte) // Salva array de objetos como JSON
    );

    const newObj = db.prepare('SELECT * FROM leitorlistsentinela WHERE id = ?').get(result.lastInsertRowid) as DatabaseRow;
    
    // Converter strings JSON de volta para arrays
    return {
      ...newObj,
      dataleitorsentinela: JSON.parse(newObj.dataleitorsentinela as string),
      leitoriosparte: JSON.parse(newObj.leitoriosparte as string),
      dataCriacao: new Date(newObj.dataCriacao as string)
    } as LeitorListSentinela;
  },

  // Listar todos os leitorlistsentinela
  findAll: async (): Promise<LeitorListSentinela[]> => {
    const stmt = db.prepare('SELECT * FROM leitorlistsentinela ORDER BY dataCriacao DESC');
    const leitores = stmt.all() as DatabaseRow[];
    
    return leitores.map(leitor => ({
      ...leitor,
      dataleitorsentinela: JSON.parse(leitor.dataleitorsentinela as string),
      leitoriosparte: JSON.parse(leitor.leitoriosparte as string),
      dataCriacao: new Date(leitor.dataCriacao as string)
    })) as LeitorListSentinela[];
  },

  // Encontrar por idlistsentina
  findByIdLista: async (idlistsentina: string): Promise<LeitorListSentinela | undefined> => {
    const stmt = db.prepare('SELECT * FROM leitorlistsentinela WHERE idlistsentina = ?');
    const leitor = stmt.get(idlistsentina) as DatabaseRow;
    
    if (!leitor) return undefined;
    
    return {
      ...leitor,
      dataleitorsentinela: JSON.parse(leitor.dataleitorsentinela as string),
      leitoriosparte: JSON.parse(leitor.leitoriosparte as string),
      dataCriacao: new Date(leitor.dataCriacao as string)
    } as LeitorListSentinela;
  },

  update: async (id: number, leitorData: Partial<LeitorListSentinela>): Promise<LeitorListSentinela> => {
    const fields = [];
    const values = [];
    
    if (leitorData.nomemes) {
      fields.push('nomemes = ?');
      values.push(leitorData.nomemes);
    }
    if (leitorData.dataleitorsentinela) {
      fields.push('dataleitorsentinela = ?');
      values.push(JSON.stringify(leitorData.dataleitorsentinela));
    }
    if (leitorData.leitoriosparte) {
      fields.push('leitoriosparte = ?');
      values.push(JSON.stringify(leitorData.leitoriosparte));
    }

    if (fields.length > 0) {
      const stmt = db.prepare(`
        UPDATE leitorlistsentinela 
        SET ${fields.join(', ')} 
        WHERE id = ?
      `);
      
      stmt.run(...values, id);
    }

    const updatedObj = db.prepare('SELECT * FROM leitorlistsentinela WHERE id = ?').get(id) as DatabaseRow;
    
    return {
      ...updatedObj,
      dataleitorsentinela: JSON.parse(updatedObj.dataleitorsentinela as string),
      leitoriosparte: JSON.parse(updatedObj.leitoriosparte as string),
      dataCriacao: new Date(updatedObj.dataCriacao as string)
    } as LeitorListSentinela;
  },

  // Deletar leitorlistsentinela
  delete: async (id: number): Promise<void> => {
    const stmt = db.prepare('DELETE FROM leitorlistsentinela WHERE id = ?');
    stmt.run(id);
  }
};