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
    
    const listas = await leitorListSentinelaUtils.findAll();
    const lista = listas.find(l => l.id === idNumerico);

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

// PUT - Atualizar lista de leitores
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const idNumerico = parseInt(id);
    const body = await request.json();
    const { leitoriosparte } = body;

    // Buscar lista existente
    const listas = await leitorListSentinelaUtils.findAll();
    const listaExistente = listas.find(l => l.id === idNumerico);

    if (!listaExistente) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar apenas os leitores
    await leitorListSentinelaUtils.delete(idNumerico);
    
    const listaAtualizada = await leitorListSentinelaUtils.create({
      idlistsentina: listaExistente.idlistsentina,
      nomemes: listaExistente.nomemes,
      dataleitorsentinela: listaExistente.dataleitorsentinela,
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

// DELETE - Excluir lista de leitores
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const idNumerico = parseInt(id);
    
    await leitorListSentinelaUtils.delete(idNumerico);

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