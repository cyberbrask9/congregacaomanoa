import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { db } from '@/lib/utils';

// Método POST para criar objetos
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const nome = formData.get('nome') as string;
    const atribuição = formData.get('atribuição') as string;
    const privilégio = formData.get('privilégio') as string;
    const foto = formData.get('foto') as File | null;

    // Validação dos campos obrigatórios
    if (!nome || !atribuição || !privilégio) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    let fotoPath = '';

    // Processar a foto apenas se foi enviada
    if (foto && foto.size > 0) {
      // Validação do tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(foto.type)) {
        return NextResponse.json(
          { error: 'Apenas imagens JPEG, JPG ou PNG são permitidas' },
          { status: 400 }
        );
      }

      // Validação do tamanho do arquivo (5MB)
      if (foto.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'A imagem deve ter no máximo 5MB' },
          { status: 400 }
        );
      }

      // Salvar a imagem
      const bytes = await foto.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${foto.name.split('.').pop()}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      
      // Criar diretório se não existir
      const { mkdir } = require('fs/promises');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Erro ao criar diretório:', error);
      }

      const filePath = join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);
      fotoPath = `/uploads/${uniqueName}`;
    }

    // Salvar no "banco de dados"
    const novoObjeto = await db.create({
      nome,
      atribuição,
      privilégio,
      foto: fotoPath // Pode ser string vazia se não houver foto
    });

    return NextResponse.json({
      message: 'Objeto criado com sucesso!',
      objeto: novoObjeto
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar objeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Método GET para listar objetos - FALTANDO NO SEU CÓDIGO
export async function GET() {
  try {
    const objetos = await db.findAll();
    return NextResponse.json(objetos);
  } catch (error) {
    console.error('Erro ao listar objetos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/// Método PUT para atualizar objeto
export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const id = formData.get('id') as string;
    const nome = formData.get('nome') as string;
    const atribuição = formData.get('atribuição') as string;
    const privilégio = formData.get('privilégio') as string;
    const foto = formData.get('foto') as File | null;

    // Validação dos campos obrigatórios
    if (!id || !nome || !atribuição || !privilégio) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    // Encontrar o objeto
    const objetos = await db.findAll();
    const objetoIndex = objetos.findIndex(o => o.id === parseInt(id));
    
    if (objetoIndex === -1) {
      return NextResponse.json(
        { error: 'Objeto não encontrado' },
        { status: 404 }
      );
    }

    let fotoPath = objetos[objetoIndex].foto;

    // Processar a nova foto apenas se foi enviada
    if (foto && foto.size > 0) {
      // Validação do tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(foto.type)) {
        return NextResponse.json(
          { error: 'Apenas imagens JPEG, JPG ou PNG são permitidas' },
          { status: 400 }
        );
      }

      // Validação do tamanho do arquivo (5MB)
      if (foto.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'A imagem deve ter no máximo 5MB' },
          { status: 400 }
        );
      }

      // Salvar a nova imagem
      const bytes = await foto.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${foto.name.split('.').pop()}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      
      // Criar diretório se não existir
      const { mkdir } = require('fs/promises');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Erro ao criar diretório:', error);
      }

      const filePath = join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);
      fotoPath = `/uploads/${uniqueName}`;
    }

    // Atualizar o objeto
    objetos[objetoIndex] = {
      ...objetos[objetoIndex],
      nome,
      atribuição,
      privilégio,
      foto: fotoPath
    };

    return NextResponse.json({
      message: 'Objeto atualizado com sucesso!',
      objeto: objetos[objetoIndex]
    });

  } catch (error) {
    console.error('Erro ao atualizar objeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Métodos Delete
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      );
    }

    // Encontrar e remover o objeto
    const objetos = await db.findAll();
    const objetoIndex = objetos.findIndex(o => o.id === parseInt(id));
    
    if (objetoIndex === -1) {
      return NextResponse.json(
        { error: 'Objeto não encontrado' },
        { status: 404 }
      );
    }

    // Remover o objeto (em produção, você removeria a imagem do sistema de arquivos também)
    objetos.splice(objetoIndex, 1);
    
    return NextResponse.json({
      message: 'Objeto excluído com sucesso!'
    });

  } catch (error) {
    console.error('Erro ao excluir objeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
