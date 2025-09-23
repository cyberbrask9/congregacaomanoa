import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises'; // ✅ CORRETO: import no topo
import { join } from 'path';
import { dbUtils } from '@/lib/utils';

interface ProcessarLeitoresRequest {
  mes: number;
  ano: number;
}


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



//Leitor A Sentinela....
  export async function LEITORA(request: NextRequest) {
  console.log('=== INÍCIO DA REQUISIÇÃO LEITORA ===');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  
  try {
    console.log('Recebendo corpo da requisição...');
    const { mes, ano }: ProcessarLeitoresRequest = await request.json();
    console.log(`Parâmetros recebidos - mes: ${mes}, ano: ${ano}`);

    // Validação dos parâmetros
    if (!mes || !ano || mes < 1 || mes > 12) {
      console.log('❌ Validação falhou: mês ou ano inválidos');
      console.log(`mes: ${mes}, ano: ${ano}`);
      return NextResponse.json(
        { error: 'Mês e ano são obrigatórios e devem ser válidos' },
        { status: 400 }
      );
    }
    console.log('✅ Parâmetros validados com sucesso');

    // Buscar todos os objetos
    console.log('Buscando objetos no banco de dados...');
    const objetos = await dbUtils.findAll();
    console.log(`Total de objetos encontrados: ${objetos.length}`);
    
    // Filtrar apenas os com privilégio 'Leitor A Sentinela'
    console.log('Filtrando leitores com privilégio "Leitor A Sentinela"...');
    const leitores = objetos.filter(objeto => 
      objeto.privilégio === 'Leitor A Sentinela'
    );
    console.log(`Leitores encontrados: ${leitores.length}`);

    if (leitores.length > 0) {
      console.log('Primeiros 3 leitores:', leitores.slice(0, 3).map(l => ({ id: l.id, nome: l.nome })));
    }

    // Ordenar por ID para manter a sequência constante
    console.log('Ordenando leitores por ID...');
    leitores.sort((a, b) => a.id - b.id);
    console.log('Leitores ordenados');

    // Calcular os domingos do mês/ano
    console.log(`Calculando domingos para mês ${mes}, ano ${ano}...`);
    const domingos = getDomingosDoMes(mes, ano);
    console.log(`Domingos encontrados: ${domingos.length}`);
    
    if (domingos.length > 0) {
      console.log('Datas dos domingos:', domingos.map(d => d.toISOString().split('T')[0]));
    }
    
    if (domingos.length === 0) {
      console.log('❌ Não há domingos neste mês/ano');
      return NextResponse.json(
        { error: 'Não há domingos neste mês/ano' },
        { status: 400 }
      );
    }

    // Atribuir datas aos leitores
    console.log('Atribuindo datas aos leitores...');
    const leitoresComDatas = atribuirDatasAosLeitores(leitores, domingos);
    console.log(`Total de leitores com datas atribuídas: ${leitoresComDatas.length}`);

    if (leitoresComDatas.length > 0) {
      console.log('Primeiros 3 resultados:', leitoresComDatas.slice(0, 3));
    }

    console.log('✅ Processamento concluído com sucesso');
    return NextResponse.json({
      message: 'Leitores processados com sucesso',
      leitores: leitoresComDatas,
      total: leitoresComDatas.length
    });

  } catch (error) {
    console.error('❌ Erro ao processar leitores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  } finally {
    console.log('=== FIM DA REQUISIÇÃO LEITORA ===');
  }
}

// Função para obter todos os domingos de um mês/ano
function getDomingosDoMes(mes: number, ano: number): Date[] {
  console.log(`Calculando domingos para ${mes}/${ano}...`);
  const domingos: Date[] = [];
  const primeiroDia = new Date(ano, mes - 1, 1);
  const ultimoDia = new Date(ano, mes, 0);
  
  console.log(`Primeiro dia do mês: ${primeiroDia.toISOString().split('T')[0]}`);
  console.log(`Último dia do mês: ${ultimoDia.toISOString().split('T')[0]}`);
  
  // Encontrar o primeiro domingo do mês
  let data = new Date(primeiroDia);
  console.log(`Dia da semana do primeiro dia: ${data.getDay()} (0=Domingo)`);
  
  while (data.getDay() !== 0 && data <= ultimoDia) {
    data.setDate(data.getDate() + 1);
  }
  
  console.log(`Primeiro domingo encontrado: ${data.toISOString().split('T')[0]}`);
  
  // Coletar todos os domingos do mês
  while (data <= ultimoDia) {
    domingos.push(new Date(data));
    data.setDate(data.getDate() + 7);
  }
  
  console.log(`Total de domingos no mês: ${domingos.length}`);
  return domingos;
}

// Função para atribuir datas aos leitores
function atribuirDatasAosLeitores(leitores: any[], domingos: Date[]): any[] {
  console.log('Iniciando atribuição de datas...');
  console.log(`Leitores: ${leitores.length}, Domingos: ${domingos.length}`);
  
  const resultado: any[] = [];
  
  if (leitores.length === 0 || domingos.length === 0) {
    console.log('❌ Nenhum leitor ou domingo disponível para atribuição');
    return resultado;
  }
  
  // Para cada leitor, atribuir uma data sequencialmente
  leitores.forEach((leitor, index) => {
    const dataIndex = index % domingos.length;
    const dataDomingo = domingos[dataIndex];
    const dataFormatada = dataDomingo.toISOString().split('T')[0];
    
    const leitorComData = {
      id: leitor.id,
      nome: leitor.nome,
      leitorsentdata: dataFormatada
    };
    
    resultado.push(leitorComData);
    
    // Log detalhado para os primeiros 5 leitores
    if (index < 5) {
      console.log(`Leitor ${index + 1}: ${leitor.nome} -> ${dataFormatada} (índice: ${dataIndex})`);
    }
  });
  
  console.log(`✅ Atribuição concluída: ${resultado.length} leitores processados`);
  console.log('Resultado final:', resultado);
  
  return resultado;
}
  //Leitor a Sentinela...