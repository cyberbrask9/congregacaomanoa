import Database from 'better-sqlite3';
import { join } from 'path';
import fs from 'fs';

const dbPath = join(process.cwd(), 'data', 'database.sqlite');

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

// Criar tabela de projetos
db.exec(`
  CREATE TABLE IF NOT EXISTS projetos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero INTEGER NOT NULL UNIQUE,
    descricao TEXT,
    datainicio TEXT NOT NULL,
    datafim TEXT,
    responsavel TEXT NOT NULL,
    concluido INTEGER DEFAULT 0, -- SQLite usa INTEGER para boolean (0 = false, 1 = true)
    img TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Operações CRUD para projetos
export const projetoDB = {
  // Listar todos os projetos
  getAll() {
    try {
      const stmt = db.prepare('SELECT * FROM projetos ORDER BY created_at DESC');
      const projetos = stmt.all();
      
      // Converter INTEGER para boolean
      return projetos.map(projeto => ({
        ...projeto,
        concluido: projeto.concluido === 1 // Converter 1/0 para true/false
      }));
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      return [];
    }
  },

  // Buscar projeto por ID
  getById(id: number) {
    try {
      const stmt = db.prepare('SELECT * FROM projetos WHERE id = ?');
      const projeto = stmt.get(id);
      return projeto ? { 
        ...projeto, 
        concluido: projeto.concluido === 1 
      } : undefined;
    } catch (error) {
      console.error('Erro ao buscar projeto por ID:', error);
      return undefined;
    }
  },

  // Buscar projeto por número
  getByNumero(numero: number) {
    try {
      const stmt = db.prepare('SELECT * FROM projetos WHERE numero = ?');
      const projeto = stmt.get(numero);
      return projeto ? { 
        ...projeto, 
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
  }) {
    try {
      console.log('🎯 Criando projeto no banco:', projeto);
      
      const stmt = db.prepare(`
        INSERT INTO projetos (numero, descricao, datainicio, datafim, responsavel, concluido, img) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      // Converter valores explicitamente para tipos que SQLite aceita
      const valores = [
        Number(projeto.numero), // Garantir que é número
        projeto.descricao || null,
        projeto.datainicio,
        projeto.datafim || null,
        projeto.responsavel,
        projeto.concluido ? 1 : 0, // Converter boolean para número (0 ou 1)
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
  }>) {
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
        values.push(projeto.concluido ? 1 : 0); // Converter boolean para INTEGER
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