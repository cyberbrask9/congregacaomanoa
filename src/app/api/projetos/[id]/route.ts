import { NextRequest, NextResponse } from 'next/server';
import { projetoDB } from '@/lib/database';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' }, 
        { status: 400 }
      );
    }

    const projeto = projetoDB.getById(id);
    
    if (!projeto) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(projeto);
  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' }, 
        { status: 400 }
      );
    }

    const projetoExistente = projetoDB.getById(id);
    if (!projetoExistente) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' }, 
        { status: 404 }
      );
    }

    const projetoData = await request.json();

    // Verificar se número já existe (em outro projeto)
    if (projetoData.numero && projetoData.numero !== projetoExistente.numero) {
      const projetoComNumero = projetoDB.getByNumero(projetoData.numero);
      if (projetoComNumero) {
        return NextResponse.json(
          { error: 'Já existe um projeto com este número' }, 
          { status: 400 }
        );
      }
    }

    const projetoAtualizado = projetoDB.update(id, projetoData);
    return NextResponse.json(projetoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID inválido' }, 
        { status: 400 }
      );
    }

    const projetoExistente = projetoDB.getById(id);
    if (!projetoExistente) {
      return NextResponse.json(
        { error: 'Projeto não encontrado' }, 
        { status: 404 }
      );
    }

    projetoDB.delete(id);
    return NextResponse.json({ message: 'Projeto deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}