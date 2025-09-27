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

    // 1. Calcular domingos do mês
    const domingos = calcularDomingosDoMes(mes, ano);
    
    // 2. Buscar leitores com privilégio 'Leitor A Sentinela'
    const todosObjetos = await dbUtils.findAll();
    const leitoresSentinela = todosObjetos.filter(objeto => 
      objeto.privilégio.includes('Leitor A Sentinela')
    );

    if (leitoresSentinela.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum leitor com privilégio "Leitor A Sentinela" encontrado' },
        { status: 400 }
      );
    }

    // 3. Criar objeto leitorlistsentinela
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const novoLeitorLista = await leitorListSentinelaUtils.create({
      idlistsentina: `lista-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nomemes: `${nomesMeses[mes - 1]} de ${ano}`,
      dataleitorsentinela: domingos,
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
    return NextResponse.json(listas);
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