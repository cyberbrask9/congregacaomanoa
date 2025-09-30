import { NextRequest, NextResponse } from 'next/server';
import { leitorListSentinelaUtils } from '@/lib/utils';

// GET - Buscar lista específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const idNumerico = parseInt(id);
    
    // CORREÇÃO: Usar a nova função findById
    const lista = await leitorListSentinelaUtils.findById(idNumerico);

    if (!lista) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(lista);
  } catch (error) {
    console.error('Erro ao buscar lista:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar lista de leitores - VERSÃO CORRIGIDA
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const idNumerico = parseInt(id);
    const body = await request.json();
    const { leitoriosparte } = body;

    // Validação
    if (!leitoriosparte || !Array.isArray(leitoriosparte)) {
      return NextResponse.json(
        { error: 'Leitores são obrigatórios e devem ser um array' },
        { status: 400 }
      );
    }

    // CORREÇÃO: Usar a função update em vez de delete + create
    const listaAtualizada = await leitorListSentinelaUtils.update(idNumerico, {
      leitoriosparte: leitoriosparte
    });

    return NextResponse.json({
      message: 'Lista atualizada com sucesso!',
      leitorLista: listaAtualizada
    });

  } catch (error) {
    console.error('Erro ao atualizar lista:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir lista de leitores - VERSÃO CORRIGIDA
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const idNumerico = parseInt(id);
    
    // CORREÇÃO: Usar a função delete que retorna boolean
    const deletado = await leitorListSentinelaUtils.delete(idNumerico);

    if (!deletado) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Lista excluída com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir lista:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}