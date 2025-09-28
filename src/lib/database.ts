import Database from 'better-sqlite3';
import { join } from 'path';
import fs from 'fs';

const dbPath = join(process.cwd(), 'data', 'database.sqlite');

// Interface para a tabela 'leitors'
interface Leitor {
  id: string | number; // Aceita string OU number
  nome: string;
  privilégio?: string;
  [key: string]: unknown;
}

// Interfaces para tipagem
export interface Projeto {
  id: number;
  nome: string;
  descricao: string;
  concluido: number | boolean;
  data_criacao: string;
}


// Interface para projetos que saem do banco
export interface ProjetoDB {
    id: number;
    numero: number;
    descricao: string;
    datainicio: string;
    datafim: string | null;
    responsavel: string;
    concluido: number;
    img: string | null;
    created_at: string;
}

// Interface para o retorno de funções (com boolean)
export interface ProjetoComBoolean extends Omit<ProjetoDB, 'concluido'> {
  concluido: boolean;
}

// Criar diretório data se não existir
const dataDir = join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializar database
const db = new Database(dbPath);

// Criar tabelas se não existirem
db.exec(`
  CREATE TABLE IF NOT EXISTS objetos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    atribuição TEXT NOT NULL,
    privilégio TEXT NOT NULL,
    foto TEXT DEFAULT '',
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
/////criar tabelas leitos a sentinela
db.exec(`
  CREATE TABLE IF NOT EXISTS leitorlistsentinela (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idlistsentina TEXT UNIQUE NOT NULL,
    nomemes TEXT NOT NULL,
    dataleitorsentinela TEXT NOT NULL, -- JSON array de datas
    leitoriosparte TEXT NOT NULL, -- JSON array de objetos
    dataCriacao DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Corrigir o SQL - removi o PRIMARY duplicado
db.exec(`
  CREATE TABLE IF NOT EXISTS projetos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero INTEGER NOT NULL UNIQUE,
    descricao TEXT,
    datainicio TEXT NOT NULL,
    datafim TEXT,
    responsavel TEXT NOT NULL,
    concluido INTEGER DEFAULT 0,
    img TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Criar tabela de leitores se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS leitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    data TEXT NOT NULL
  )
`);

// Funções para leitores - CORRIGIDA (sem any)
export function getLeitorsByMesAno(mesAno: string): Leitor[] {
  try {
    const stmt = db.prepare(`
      SELECT id, nome, data 
      FROM leitors 
      WHERE strftime('%Y-%m', data) = ? 
      ORDER BY nome ASC
    `);
    
    // Usando a interface Leitor em vez de any[]
    const leitors = stmt.all(mesAno) as Leitor[];
    return leitors;
  } catch (error) {
    console.error('Erro ao buscar leitores:', error);
    return [];
  }
}

// Funções para projetos (Corrigida)
export function getAllProjetos(): ProjetoComBoolean[] {
  try {
    const stmt = db.prepare('SELECT * FROM projetos ORDER BY created_at DESC');
    const projetos = stmt.all() as ProjetoDB[];
    
    return projetos.map(projeto => {
      const projetoConvertido: ProjetoComBoolean = {
        ...(projeto as Omit<ProjetoDB, 'concluido'>),
        concluido: projeto.concluido === 1
      };
      return projetoConvertido;
    });
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return [];
  }
}

// Operações CRUD para projetos
export const projetoDB = {
  // Listar todos os projetos
  getAll(): ProjetoComBoolean[] {
    try {
      const stmt = db.prepare('SELECT * FROM projetos ORDER BY created_at DESC');
      const projetos = stmt.all() as ProjetoDB[];
      
      return projetos.map(projeto => ({
        ...(projeto as Omit<ProjetoDB, 'concluido'>),
        concluido: projeto.concluido === 1
      }));
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      return [];
    }
  },

  // Buscar projeto por ID
  getById(id: number): ProjetoComBoolean | undefined {
    try {
      const stmt = db.prepare('SELECT * FROM projetos WHERE id = ?');
      const projeto = stmt.get(id) as ProjetoDB | undefined;
      
      return projeto ? { 
        ...(projeto as Omit<ProjetoDB, 'concluido'>), 
        concluido: projeto.concluido === 1
      } : undefined;
    } catch (error) {
      console.error('Erro ao buscar projeto por ID:', error);
      return undefined;
    }
  },

  // Buscar projeto por número
  getByNumero(numero: number): ProjetoComBoolean | undefined {
    try {
      const stmt = db.prepare('SELECT * FROM projetos WHERE numero = ?');
      const projeto = stmt.get(numero) as ProjetoDB | undefined;
      
      return projeto ? { 
        ...(projeto as Omit<ProjetoDB, 'concluido'>), 
        concluido: projeto.concluido === 1
      } : undefined;
    } catch (error) {
      console.error('Erro ao buscar projeto por número:', error);
      return undefined;
    }
  },

  // Criar novo projeto
  create(projeto: {
    numero: number;
    descricao?: string;
    datainicio: string;
    datafim?: string;
    responsavel: string;
    concluido?: boolean;
    img?: string;
  }): ProjetoComBoolean | undefined {
    try {
      console.log('🎯 Criando projeto no banco:', projeto);
      
      const stmt = db.prepare(`
        INSERT INTO projetos (numero, descricao, datainicio, datafim, responsavel, concluido, img) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      const valores = [
        Number(projeto.numero),
        projeto.descricao || null,
        projeto.datainicio,
        projeto.datafim || null,
        projeto.responsavel,
        projeto.concluido ? 1 : 0,
        projeto.img || null
      ];
      
      console.log('🎯 Valores para inserção:', valores);
      
      const result = stmt.run(...valores);
      console.log('🎯 Resultado da inserção:', result);

      const projetoCriado = this.getById(result.lastInsertRowid as number);
      console.log('🎯 Projeto criado:', projetoCriado);
      
      return projetoCriado;
    } catch (error) {
      console.error('❌ Erro ao criar projeto no banco:', error);
      throw error;
    }
  },

  // Atualizar projeto
  update(id: number, projeto: Partial<{
    numero: number;
    descricao?: string;
    datainicio: string;
    datafim?: string;
    responsavel: string;
    concluido: boolean;
    img?: string;
  }>): ProjetoComBoolean | undefined {
    try {
      const fields = [];
      const values = [];
      
      if (projeto.numero !== undefined) {
        fields.push('numero = ?');
        values.push(Number(projeto.numero));
      }
      if (projeto.descricao !== undefined) {
        fields.push('descricao = ?');
        values.push(projeto.descricao);
      }
      if (projeto.datainicio !== undefined) {
        fields.push('datainicio = ?');
        values.push(projeto.datainicio);
      }
      if (projeto.datafim !== undefined) {
        fields.push('datafim = ?');
        values.push(projeto.datafim);
      }
      if (projeto.responsavel !== undefined) {
        fields.push('responsavel = ?');
        values.push(projeto.responsavel);
      }
      if (projeto.concluido !== undefined) {
        fields.push('concluido = ?');
        values.push(projeto.concluido ? 1 : 0);
      }
      if (projeto.img !== undefined) {
        fields.push('img = ?');
        values.push(projeto.img);
      }
      
      if (fields.length === 0) {
        return this.getById(id);
      }
      
      values.push(id);
      
      const stmt = db.prepare(`UPDATE projetos SET ${fields.join(', ')} WHERE id = ?`);
      stmt.run(...values);
      
      return this.getById(id);
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      throw error;
    }
  },

  // Deletar projeto
  delete(id: number) {
    try {
      const stmt = db.prepare('DELETE FROM projetos WHERE id = ?');
      return stmt.run(id);
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      throw error;
    }
  }
};

export default db;