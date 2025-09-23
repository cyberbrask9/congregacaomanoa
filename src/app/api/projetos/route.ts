import { NextRequest, NextResponse } from 'next/server';
import { projetoDB } from '@/lib/database';

export async function GET() {
  try {
    const projetos = projetoDB.getAll();
    return NextResponse.json(projetos);
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📥 Recebendo requisição POST para /api/projetos');
    
    const projetoData = await request.json();
    console.log('📋 Dados recebidos:', projetoData);
    
    // Validar dados obrigatórios
    if (!projetoData.numero || !projetoData.datainicio || !projetoData.responsavel) {
      console.log('❌ Dados obrigatórios faltando');
      return NextResponse.json(
        { error: 'Número, data de início e responsável são obrigatórios' }, 
        { status: 400 }
      );
    }

    // Verificar se número já existe
    const projetoExistente = projetoDB.getByNumero(projetoData.numero);
    if (projetoExistente) {
      console.log('❌ Número já existe:', projetoData.numero);
      return NextResponse.json(
        { error: 'Já existe um projeto com este número' }, 
        { status: 400 }
      );
    }

    console.log('✅ Dados válidos, criando projeto...');
    
    // Criar projeto no banco
    const novoProjeto = projetoDB.create({
      numero: projetoData.numero,
      descricao: projetoData.descricao,
      datainicio: projetoData.datainicio,
      datafim: projetoData.datafim,
      responsavel: projetoData.responsavel,
      concluido: projetoData.concluido || false,
      img: projetoData.img
    });
    
    console.log('✅ Projeto criado com sucesso:', novoProjeto);
    
    return NextResponse.json(novoProjeto, { status: 201 });
  } catch (error) {
    console.error('❌ Erro ao criar projeto:', error);
    
    // Log mais detalhado do erro
    if (error instanceof Error) {
      console.error('❌ Mensagem de erro:', error.message);
      console.error('❌ Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Erro interno do servidor: ' + (error instanceof Error ? error.message : 'Erro desconhecido') }, 
      { status: 500 }
    );
  }
}