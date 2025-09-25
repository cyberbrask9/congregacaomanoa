  // app/api/leitors-sentinela/route.ts
  import { NextRequest, NextResponse } from 'next/server';
  import Database from 'better-sqlite3';
  import path from 'path';
  import fs from 'fs';

  interface Leitor {
    id: number;
    nome: string;
    data: string;
  }

  export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const mesAno = searchParams.get('mesAno');

    if (!mesAno) {
      return NextResponse.json(
        { message: 'Parâmetro mesAno é obrigatório' },
        { status: 400 }
      );
    }

    try {
      const dbPath = path.join(process.cwd(), 'database.db');
      
      // Verifica se o banco de dados existe
      if (!fs.existsSync(dbPath)) {
        return NextResponse.json(getMockData(mesAno));
      }

      const db = new Database(dbPath, { readonly: true });

      try {
        // Consulta usando better-sqlite3 (forma correta)
        const stmt = db.prepare(`
          SELECT id, nome, data 
          FROM leitors 
          WHERE strftime('%Y-%m', data) = ? 
          ORDER BY nome ASC
        `);
        
        const leitors = stmt.all(mesAno) as Leitor[];
        
        if (leitors.length === 0) {
          return NextResponse.json(getMockData(mesAno));
        }

        return NextResponse.json(leitors);
      } catch (dbError) {
        console.error('Erro na consulta SQL:', dbError);
        return NextResponse.json(getMockData(mesAno));
      } finally {
        db.close();
      }

    } catch (error) {
      console.error('Erro geral:', error);
      return NextResponse.json(getMockData(mesAno));
    }
  }

  function getMockData(mesAno: string): Leitor[] {
    const mockData: Leitor[] = [
      { id: 1, nome: 'João Silva', data: `${mesAno}-01` },
      { id: 2, nome: 'Maria Santos', data: `${mesAno}-05` },
      { id: 3, nome: 'Pedro Oliveira', data: `${mesAno}-10` },
      { id: 4, nome: 'Ana Costa', data: `${mesAno}-15` },
      { id: 5, nome: 'Carlos Souza', data: `${mesAno}-20` },
    ];
    return mockData;
  }