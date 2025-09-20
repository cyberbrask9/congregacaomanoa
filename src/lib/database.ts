import Database from 'better-sqlite3';
import { join } from 'path';
import fs from 'fs'; // ✅ Correto

const dbPath = join(process.cwd(), 'data', 'database.sqlite');

// Criar diretório data se não existir
const dataDir = join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializar database
const db = new Database(dbPath);

// Criar tabela se não existir
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

export default db;