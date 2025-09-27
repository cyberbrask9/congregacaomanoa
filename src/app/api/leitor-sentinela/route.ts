import { NextRequest, NextResponse } from 'next/server';
import { leitorListSentinelaUtils, dbUtils } from '@/lib/utils';
import { eachDayOfInterval, endOfMonth, startOfMonth, format, isSunday } from 'date-fns';

// POST - Criar nova lista de leitores
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mes, ano } = body;

    if (!mes || !ano) {
      return NextResponse.json(
        { error: 'Mês e ano são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar mês e ano
    if (mes < 1 || mes > 12) {
      return NextResponse.json(
        { error: 'Mês deve estar entre 1 e 12' },
        { status: 400 }
      );
    }

    // 1. Calcular domingos do mês
    const domingos = calcularDomingosDoMes(mes, ano);
    
    if (domingos.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum domingo encontrado para o mês e ano especificados' },
        { status: 400 }
      );
    }

    // 2. Buscar leitores com privilégio 'Leitor A Sentinela'
    const todosObjetos = await dbUtils.findAll();
    const leitoresSentinela = todosObjetos.filter(objeto => 
      objeto.privilégio && objeto.privilégio.includes('Leitor A Sentinela')
    );

    if (leitoresSentinela.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum leitor com privilégio "Leitor A Sentinela" encontrado' },
        { status: 400 }
      );
    }

    // 3. Buscar listas anteriores para determinar a sequência
    const listasAnteriores = await leitorListSentinelaUtils.findAll();
    
    // 4. Determinar o próximo leitor da sequência
    const proximoLeitor = determinarProximoLeitor(leitoresSentinela, listasAnteriores);
    
    // 5. Distribuir leitores sequencialmente para os domingos
    const leitoresDistribuidos = distribuirLeitoresSequencialmente(
      leitoresSentinela, 
      domingos.length, 
      proximoLeitor
    );

    // 6. Criar o array de datas com os leitores designados
    const datasComLeitores = domingos.map((data, index) => ({
      data,
      leitor: leitoresDistribuidos[index]
    }));

    // 7. Criar objeto leitorlistsentinela
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const novoLeitorLista = await leitorListSentinelaUtils.create({
        idlistsentina: `lista-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nomemes: `${nomesMeses[mes - 1]} de ${ano}`,
        dataleitorsentinela: datasComLeitores, // Nova estrutura com objetos
        // Ou mantenha a estrutura antiga se preferir:
        // dataleitorsentinela: domingos, // Apenas as datas como strings
        leitoriosparte: leitoresSentinela
        });

    return NextResponse.json({
      message: 'Lista de leitores criada com sucesso!',
      leitorLista: novoLeitorLista
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar lista de leitores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// GET - Listar todas as listas de leitores
export async function GET() {
  try {
    const listas = await leitorListSentinelaUtils.findAll();
    
    // Ordenar listas por data (mais recente primeiro)
    const listasOrdenadas = listas.sort((a, b) => {
      try {
        const dataA = extrairDataDoNomeMes(a.nomemes);
        const dataB = extrairDataDoNomeMes(b.nomemes);
        return dataB.getTime() - dataA.getTime();
      } catch {
        return 0;
      }
    });

    return NextResponse.json(listasOrdenadas);
  } catch (error) {
    console.error('Erro ao listar leitores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para calcular domingos do mês
function calcularDomingosDoMes(mes: number, ano: number): string[] {
  const inicioMes = new Date(ano, mes - 1, 1);
  const fimMes = endOfMonth(inicioMes);
  
  const todosDias = eachDayOfInterval({
    start: startOfMonth(inicioMes),
    end: fimMes
  });

  const domingos = todosDias
    .filter(data => isSunday(data))
    .map(data => format(data, 'yyyy-MM-dd'));

  return domingos;
}

// Função para determinar o próximo leitor da sequência
function determinarProximoLeitor(leitores: any[], listasAnteriores: any[]): any {
  if (listasAnteriores.length === 0) {
    return leitores[0]; // Primeira lista, começa com o primeiro leitor
  }

  // Ordenar listas anteriores por data (mais recente primeiro)
  const listasOrdenadas = [...listasAnteriores].sort((a, b) => {
    try {
      const dataA = extrairDataDoNomeMes(a.nomemes);
      const dataB = extrairDataDoNomeMes(b.nomemes);
      return dataB.getTime() - dataA.getTime();
    } catch {
      return 0;
    }
  });

  // Encontrar a lista mais recente que tem leitores designados
  const listaMaisRecenteComLeitores = listasOrdenadas.find(lista => 
    lista.dataleitorsentinela && 
    Array.isArray(lista.dataleitorsentinela) && 
    lista.dataleitorsentinela.length > 0
  );

  if (!listaMaisRecenteComLeitores) {
    return leitores[0];
  }

  // Extrair o último leitor da lista mais recente
  const ultimoLeitorDesignado = listaMaisRecenteComLeitores.dataleitorsentinela[
    listaMaisRecenteComLeitores.dataleitorsentinela.length - 1
  ]?.leitor;

  if (!ultimoLeitorDesignado) {
    return leitores[0];
  }

  // Encontrar o índice do último leitor na lista atual de leitores
  const ultimoIndex = leitores.findIndex(leitor => 
    leitor.id === ultimoLeitorDesignado.id || 
    leitor.nome === ultimoLeitorDesignado.nome
  );
  
  if (ultimoIndex === -1) {
    return leitores[0]; // Se o último leitor não existe mais, começa do primeiro
  }

  // Determinar o próximo leitor (se chegou ao final, volta para o primeiro)
  const proximoIndex = (ultimoIndex + 1) % leitores.length;
  return leitores[proximoIndex];
}

// Função para distribuir leitores sequencialmente
function distribuirLeitoresSequencialmente(
  leitores: any[], 
  quantidadeDomingos: number, 
  leitorInicial: any
): any[] {
  if (leitores.length === 0) return [];
  
  const resultado: any[] = [];
  
  // Encontrar o índice do leitor inicial
  let currentIndex = leitores.findIndex(leitor => 
    leitor.id === leitorInicial.id || 
    leitor.nome === leitorInicial.nome
  );
  
  if (currentIndex === -1) {
    currentIndex = 0; // Fallback se o leitor inicial não for encontrado
  }
  
  // Distribuir leitores sequencialmente
  for (let i = 0; i < quantidadeDomingos; i++) {
    resultado.push(leitores[currentIndex]);
    currentIndex = (currentIndex + 1) % leitores.length;
  }
  
  return resultado;
}

// Função auxiliar para extrair data do nome do mês
function extrairDataDoNomeMes(nomemes: string): Date {
  const partes = nomemes.split(' de ');
  if (partes.length !== 2) {
    throw new Error('Formato de nome do mês inválido');
  }
  
  const nomeMes = partes[0];
  const ano = parseInt(partes[1]);
  
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  const mesIndex = meses.findIndex(mes => mes.toLowerCase() === nomeMes.toLowerCase());
  if (mesIndex === -1) {
    throw new Error('Mês não reconhecido');
  }
  
  return new Date(ano, mesIndex, 1);
}