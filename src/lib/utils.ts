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
  // Criar novo leitorlistsentinela
  create: async (leitorData: Omit<LeitorListaSentinela, 'id' | 'dataCriacao'>): Promise<LeitorListaSentinela> => {
    const stmt = db.prepare(`
      INSERT INTO leitorlistsentinela (idlistsentina, nomemes, dataleitorsentinela, leitoriosparte)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      leitorData.idlistsentina,
      leitorData.nomemes,
      JSON.stringify(leitorData.dataleitorsentinela), // Salva array DataComLeitor[] como JSON
      JSON.stringify(leitorData.leitoriosparte) // Salva array Leitor[] como JSON
    );

    const newObj = db.prepare('SELECT * FROM leitorlistsentinela WHERE id = ?').get(result.lastInsertRowid) as DatabaseRow;
    
    // Converter strings JSON de volta para arrays com tipos específicos
    return {
      ...newObj,
      dataleitorsentinela: JSON.parse(newObj.dataleitorsentinela as string) as DataComLeitor[],
      leitoriosparte: JSON.parse(newObj.leitoriosparte as string) as Leitor[],
      dataCriacao: new Date(newObj.dataCriacao as string)
    } as LeitorListaSentinela;
  },

  // Listar todos os leitorlistsentinela
  findAll: async (): Promise<LeitorListaSentinela[]> => {
    const stmt = db.prepare('SELECT * FROM leitorlistsentinela ORDER BY dataCriacao DESC');
    const leitores = stmt.all() as DatabaseRow[];
    
    return leitores.map(leitor => ({
      ...leitor,
      dataleitorsentinela: JSON.parse(leitor.dataleitorsentinela as string) as DataComLeitor[],
      leitoriosparte: JSON.parse(leitor.leitoriosparte as string) as Leitor[],
      dataCriacao: new Date(leitor.dataCriacao as string)
    })) as LeitorListaSentinela[];
  },

  // Encontrar por idlistsentina
  findByIdLista: async (idlistsentina: string): Promise<LeitorListaSentinela | undefined> => {
    const stmt = db.prepare('SELECT * FROM leitorlistsentinela WHERE idlistsentina = ?');
    const leitor = stmt.get(idlistsentina) as DatabaseRow;
    
    if (!leitor) return undefined;
    
    return {
      ...leitor,
      dataleitorsentinela: JSON.parse(leitor.dataleitorsentinela as string) as DataComLeitor[],
      leitoriosparte: JSON.parse(leitor.leitoriosparte as string) as Leitor[],
      dataCriacao: new Date(leitor.dataCriacao as string)
    } as LeitorListaSentinela;
  },

  // Atualizar leitorlistsentinela
  update: async (id: number, leitorData: Partial<LeitorListaSentinela>): Promise<LeitorListaSentinela> => {
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
      dataleitorsentinela: JSON.parse(updatedObj.dataleitorsentinela as string) as DataComLeitor[],
      leitoriosparte: JSON.parse(updatedObj.leitoriosparte as string) as Leitor[],
      dataCriacao: new Date(updatedObj.dataCriacao as string)
    } as LeitorListaSentinela;
  },

  // Deletar leitorlistsentinela
  delete: async (id: number): Promise<void> => {
    const stmt = db.prepare('DELETE FROM leitorlistsentinela WHERE id = ?');
    stmt.run(id);
  }
};