/* import db from '@/lib/database';

async function testDatabase() {
  try {
    console.log('🚀 Iniciando teste de conexão com o banco de dados...');
    console.log('📁 Caminho do banco:', process.cwd() + '/data/database.sqlite');

    // Testar consulta de tabelas - CORRIGIDO: usar aspas simples
    console.log('\n📊 Verificando tabelas existentes:');
    const stmt = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`);
    const tables = stmt.all();
    console.log('Tabelas encontradas:', tables);

    // Testar consulta de objetos (se a tabela existir)
    console.log('\n📝 Verificando dados na tabela objetos:');
    try {
      const objetosStmt = db.prepare('SELECT COUNT(*) as total FROM objetos');
      const countResult = objetosStmt.get() as { total: number };
      console.log(`Total de objetos no banco: ${countResult.total}`);
      
      if (countResult.total > 0) {
        const sampleStmt = db.prepare('SELECT * FROM objetos LIMIT 3');
        const sampleData = sampleStmt.all();
        console.log('Amostra de dados:', JSON.stringify(sampleData, null, 2));
      } else {
        console.log('ℹ️ Tabela "objetos" está vazia');
      }
    } catch {
      console.log('ℹ️ Tabela "objetos" ainda não existe');
    }

    // Testar criação da tabela se não existir
    console.log('\n🛠️  Testando criação da tabela:');
    try {
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
      console.log('✅ Tabela "objetos" verificada/criada');
    } catch (error) {
      console.error('❌ Erro ao criar tabela:', error);
    }

    // Testar inserção de exemplo
    console.log('\n🧪 Testando inserção de dados:');
    try {
      const insertStmt = db.prepare(`
        INSERT INTO objetos (nome, atribuição, privilégio, foto)
        VALUES (?, ?, ?, ?)
      `);
      
      const result = insertStmt.run(
        'Usuário Teste ' + Date.now(),
        'Publicador Batizado',
        'Microfone Volante, Áudio e Vídeo',
        ''
      );
      
      console.log('✅ Inserção realizada! ID:', result.lastInsertRowid);
      
      // Verificar se foi salvo
      const selectStmt = db.prepare('SELECT * FROM objetos WHERE id = ?');
      const insertedData = selectStmt.get(result.lastInsertRowid);
      console.log('📋 Dado inserido:', insertedData);
      
      // Limpar teste
      const deleteStmt = db.prepare('DELETE FROM objetos WHERE id = ?');
      deleteStmt.run(result.lastInsertRowid);
      console.log('🧹 Dado de teste removido');
      
    } catch (error) {
      console.error('❌ Erro na inserção:', error);
    }

    console.log('\n✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    // Fechar conexão
    db.close();
    console.log('🔒 Conexão com o banco fechada');
  }
}

// Executar o teste
testDatabase(); */