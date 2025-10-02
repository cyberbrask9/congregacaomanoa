import { NextRequest, NextResponse } from 'next/server';
import { audioVideoUtils } from '@/lib/utils';


// Interfaces
interface DataComPessoa {
  data: string;
  pessoa: any | null;
}

interface AudioVideoLista {
  id?: number;
  idlistaav: string;
  nomemes: string;
  dataav: DataComPessoa[];
  pessoaparte: any[];
  dataCriacao?: Date;
}

// GET - Buscar lista específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const idNumerico = parseInt(id);
    
    // Buscar lista no banco - implementar similar ao leitorListSentinelaUtils.findById()
    const lista = await buscarListaAudioVideoPorId(idNumerico);

    if (!lista) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(lista);
  } catch (error) {
    console.error('Erro ao buscar lista de áudio e vídeo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar lista de áudio e vídeo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const idNumerico = parseInt(id);
    const body = await request.json();
    const { pessoaparte, dataav } = body;

    console.log('=== ATUALIZANDO LISTA ÁUDIO/VIDEO ===');
    console.log('ID:', idNumerico);
    console.log('pessoaparte recebido:', pessoaparte?.map((p: any) => ({ id: p.id, nome: p.nome })));
    console.log('dataav recebido:', dataav?.map((item: any) => ({
      data: item.data,
      pessoa: item.pessoa ? { id: item.pessoa.id, nome: item.pessoa.nome } : null
    })));

    // Validação
    if (!pessoaparte || !Array.isArray(pessoaparte)) {
      return NextResponse.json(
        { error: 'Pessoas são obrigatórias e devem ser um array' },
        { status: 400 }
      );
    }

    // Buscar lista existente
    const listaExistente = await buscarListaAudioVideoPorId(idNumerico);

    if (!listaExistente) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    console.log('=== LISTA ANTES DA ATUALIZAÇÃO ===');
    console.log('Lista existente:', {
      id: listaExistente.id,
      pessoaparte: listaExistente.pessoaparte?.map((p: any) => ({ id: p.id, nome: p.nome })),
      dataav: listaExistente.dataav?.map((item: any) => ({
        data: item.data,
        pessoa: item.pessoa ? { id: item.pessoa.id, nome: item.pessoa.nome } : null
      }))
    });

    // Atualizar dados
    const updateData: any = {
      pessoaparte: pessoaparte
    };

    if (dataav && Array.isArray(dataav)) {
      updateData.dataav = dataav;
    }

    console.log('=== DADOS PARA ATUALIZAÇÃO ===');
    console.log('Update data:', updateData);

    const listaAtualizada = await atualizarListaAudioVideo(idNumerico, updateData);

    console.log('=== LISTA APÓS ATUALIZAÇÃO ===');
    console.log('Lista atualizada:', {
      id: listaAtualizada.id,
      pessoaparte: listaAtualizada.pessoaparte?.map((p: any) => ({ id: p.id, nome: p.nome })),
      dataav: listaAtualizada.dataav?.map((item: any) => ({
        data: item.data,
        pessoa: item.pessoa ? { id: item.pessoa.id, nome: item.pessoa.nome } : null
      }))
    });

    return NextResponse.json({
      message: 'Lista de Áudio e Vídeo atualizada com sucesso!',
      audioVideoLista: listaAtualizada
    });

  } catch (error) {
    console.error('Erro ao atualizar lista de áudio e vídeo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Excluir lista de áudio e vídeo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const idNumerico = parseInt(id);
    
    const deletado = await excluirListaAudioVideo(idNumerico);

    if (!deletado) {
      return NextResponse.json(
        { error: 'Lista não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Lista de Áudio e Vídeo excluída com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao excluir lista de áudio e vídeo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Funções do banco de dados (implementar similar às do leitor sentinela)
async function buscarListaAudioVideoPorId(id: number): Promise<AudioVideoLista | null> {
  try {
    return await audioVideoUtils.findById(id) || null;
  } catch (error) {
    console.error('Erro ao buscar lista por ID:', error);
    return null;
  }
}

async function atualizarListaAudioVideo(id: number, data: Partial<AudioVideoLista>): Promise<AudioVideoLista> {
  try {
    return await audioVideoUtils.update(id, data);
  } catch (error) {
    console.error('Erro ao atualizar lista:', error);
    throw error;
  }
}

async function excluirListaAudioVideo(id: number): Promise<boolean> {
  try {
    return await audioVideoUtils.delete(id);
  } catch (error) {
    console.error('Erro ao excluir lista:', error);
    throw error;
  }
}