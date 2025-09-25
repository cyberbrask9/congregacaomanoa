import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises'; // ✅ CORRETO: import no topo
import { join } from 'path';
import { dbUtils } from '@/lib/utils';

/* interface ProcessarLeitoresRequest {
  mes: number;
  ano: number;
} */


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
      

try {
    const body = await request.json();
    const { acao, dados } = body; // Esperamos um campo 'acao' no corpo

    switch (acao) {
      case 'criar-novo':
        // Lógica para criar um novo usuário
        console.log('Criando novo usuário com dados:', dados);
        return NextResponse.json({ message: "Usuário criado com sucesso!" }, { status: 201 });

      case 'adicionar-foto':
        // Lógica para adicionar uma foto a um usuário existente
        if (!dados.userId) {
          return NextResponse.json({ error: "ID do usuário é obrigatório." }, { status: 400 });
        }
        console.log(`Adicionando foto ao usuário ${dados.userId}`);
        return NextResponse.json({ message: "Foto adicionada." }, { status: 200 });

      default:
        // Caso a ação não seja reconhecida
        return NextResponse.json({ error: "Ação de POST não suportada." }, { status: 400 });
      }

  } catch (error) {
    console.error("Erro no POST:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
      // Criar diretório se não existir
      /* const { mkdir } = require('fs/promises'); */
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Erro ao criar diretório:', error);
      }

      const filePath = join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);
      fotoPath = `/uploads/${uniqueName}`;
    }

    // Salvar no banco de dados REAL
    const novoObjeto = await dbUtils.create({
      nome,
      atribuição,
      privilégio,
      foto: fotoPath
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

// Método GET para listar objetos
export async function GET() {
  try {
    const objetos = await dbUtils.findAll();
    return NextResponse.json(objetos);
  } catch (error) {
    console.error('Erro ao listar objetos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Método PUT para atualizar objeto
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

    // Verificar se objeto existe
    const objetoExistente = await dbUtils.findById(parseInt(id));
    if (!objetoExistente) {
      return NextResponse.json(
        { error: 'Objeto não encontrado' },
        { status: 404 }
      );
    }

    let fotoPath = objetoExistente.foto;

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
/*       const { mkdir } = require('fs/promises');ßßßßß
 */      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error('Erro ao criar diretório:', error);
      }

      const filePath = join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);
      fotoPath = `/uploads/${uniqueName}`;
    }

    // Atualizar o objeto no banco de dados
    const objetoAtualizado = await dbUtils.update(parseInt(id), {
      nome,
      atribuição,
      privilégio,
      foto: fotoPath
    });

    return NextResponse.json({
      message: 'Objeto atualizado com sucesso!',
      objeto: objetoAtualizado
    });

  } catch (error) {
    console.error('Erro ao atualizar objeto:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}


// Método DELETE para excluir objeto
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

    // Verificar se objeto existe
    const objetoExistente = await dbUtils.findById(parseInt(id));
    if (!objetoExistente) {
      return NextResponse.json(
        { error: 'Objeto não encontrado' },
        { status: 404 }
      );
    }

    // Excluir o objeto do banco de dados
    await dbUtils.delete(parseInt(id));
    
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