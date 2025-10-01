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
    const { leitoriosparte, dataleitorsentinela } = body;

    // Validação
    if (!leitoriosparte || !Array.isArray(leitoriosparte)) {
      return NextResponse.json(
        { error: 'Leitores são obrigatórios e devem ser um array' },
        { status: 400 }
      );
    }

     // Buscar lista existente
    const listas = await leitorListSentinelaUtils.findAll();
    const listaExistente = listas.find(l => l.id === idNumerico);

    if (!listaExistente) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    // CORREÇÃO: Atualizar ambos os campos
    const updateData: any = {
      leitoriosparte: leitoriosparte
    };

    // Se dataleitorsentinela foi enviado, atualizar também
    if (dataleitorsentinela && Array.isArray(dataleitorsentinela)) {
      updateData.dataleitorsentinela = dataleitorsentinela;
    }

    const listaAtualizada = await leitorListSentinelaUtils.update(idNumerico, updateData);

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