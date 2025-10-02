import { NextRequest, NextResponse } from 'next/server';
import { eachDayOfInterval, endOfMonth, startOfMonth, format, isThursday, isSunday } from 'date-fns';
import { Objeto } from '@/types';
import { audioVideoUtils, dbUtils,} from '@/lib/utils';


// Interface para DataComPessoa
interface DataComPessoa {
  data: string;
  pessoa: Objeto | null;
}

// Interface para AudioVideoLista
interface AudioVideoLista {
  id?: number;
  idlistaav: string;
  nomemes: string;
  dataav: DataComPessoa[];
  pessoaparte: Objeto[];
  dataCriacao?: Date;
}

// GET - Listar todas as listas de áudio e vídeo
export async function GET() {
  try {
    const listas = await buscarListasAudioVideo();
    
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
    console.error('Erro ao listar áudio e vídeo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Função para calcular quintas e domingos do mês
function calcularQuintasEDomingosDoMes(mes: number, ano: number): string[] {
  const inicioMes = new Date(ano, mes - 1, 1);
  const fimMes = endOfMonth(inicioMes);
  
  const todosDias = eachDayOfInterval({
    start: startOfMonth(inicioMes),
    end: fimMes
  });

  const quintasEDomingos = todosDias
    .filter(data => isThursday(data) || isSunday(data))
    .map(data => format(data, 'yyyy-MM-dd'));

  return quintasEDomingos;
}

// Função para determinar a próxima pessoa da sequência
function determinarProximaPessoa(pessoas: Objeto[], listasAnteriores: AudioVideoLista[]): Objeto {
  if (listasAnteriores.length === 0) {
    return pessoas[0]; // Primeira lista, começa com a primeira pessoa
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

  // Encontrar a lista mais recente que tem pessoas designadas
  const listaMaisRecenteComPessoas = listasOrdenadas.find(lista => 
    lista.dataav && 
    Array.isArray(lista.dataav) && 
    lista.dataav.length > 0
  );

  if (!listaMaisRecenteComPessoas) {
    return pessoas[0];
  }

  console.log('📋 Lista mais recente:', listaMaisRecenteComPessoas.nomemes);
  console.log('👥 Pessoas da lista mais recente:', listaMaisRecenteComPessoas.dataav.map((item: any) => item.pessoa?.nome));

  // EXTRAIR TODAS AS PESSOAS JÁ USADAS na lista mais recente
  const pessoasUsadasNaListaRecente = listaMaisRecenteComPessoas.dataav
    .map(item => item.pessoa)
    .filter(pessoa => pessoa !== null && pessoa !== undefined);

  console.log('🎯 Pessoas usadas na lista recente:', pessoasUsadasNaListaRecente.map(p => p.nome));

  if (pessoasUsadasNaListaRecente.length === 0) {
    return pessoas[0];
  }

  // Encontrar a ÚLTIMA pessoa usada na lista mais recente
  const ultimaPessoaUsada = pessoasUsadasNaListaRecente[pessoasUsadasNaListaRecente.length - 1];
  
  console.log('⏩ Última pessoa usada:', ultimaPessoaUsada?.nome);

  if (!ultimaPessoaUsada) {
    return pessoas[0];
  }

  // Encontrar o índice da última pessoa na lista atual de pessoas
  const ultimoIndex = pessoas.findIndex(pessoa => 
    pessoa.id === ultimaPessoaUsada.id
  );
  
  console.log('🔍 Índice da última pessoa:', ultimoIndex);

  if (ultimoIndex === -1) {
    console.log('⚠️ Última pessoa não encontrada, começando da primeira');
    return pessoas[0];
  }

  // Determinar a próxima pessoa (se chegou ao final, volta para a primeira)
  const proximoIndex = (ultimoIndex + 1) % pessoas.length;
  const proximaPessoa = pessoas[proximoIndex];
  
  console.log('✅ Próxima pessoa:', proximaPessoa.nome);
  console.log('📊 Estatísticas:', {
    'Total de pessoas': pessoas.length,
    'Último índice usado': ultimoIndex,
    'Próximo índice': proximoIndex,
    'Última pessoa': ultimaPessoaUsada.nome,
    'Próxima pessoa': proximaPessoa.nome
  });

  return proximaPessoa;
}

// Função para distribuir pessoas sequencialmente
function distribuirPessoasSequencialmente(
  pessoas: Objeto[], 
  quantidadeDias: number, 
  pessoaInicial: Objeto
): Objeto[] {
  if (pessoas.length === 0) return [];
  
  const resultado: Objeto[] = [];
  
  // Encontrar o índice da pessoa inicial
  let currentIndex = pessoas.findIndex(pessoa => 
    pessoa.id === pessoaInicial.id
  );
  
  console.log('🎲 Distribuindo pessoas:');
  console.log('Pessoa inicial:', pessoaInicial.nome);
  console.log('Índice inicial:', currentIndex);
  console.log('Quantidade de dias (quintas + domingos):', quantidadeDias);
  
  if (currentIndex === -1) {
    console.log('⚠️ Pessoa inicial não encontrada, começando do índice 0');
    currentIndex = 0;
  }
  
  // Distribuir pessoas sequencialmente
  for (let i = 0; i < quantidadeDias; i++) {
    const pessoaAtual = pessoas[currentIndex];
    resultado.push(pessoaAtual);
    
    console.log(`📅 Dia ${i + 1}: ${pessoaAtual.nome} (índice: ${currentIndex})`);
    
    // Avançar para a próxima pessoa (circular)
    currentIndex = (currentIndex + 1) % pessoas.length;
  }
  
  console.log('✅ Distribuição finalizada:', resultado.map(p => p.nome));
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
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dzembro'
  ];
  
  const mesIndex = meses.findIndex(mes => mes.toLowerCase() === nomeMes.toLowerCase());
  if (mesIndex === -1) {
    throw new Error('Mês não reconhecido');
  }
  
  return new Date(ano, mesIndex, 1);
}


// POST - Criar nova lista de áudio e vídeo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mes, ano } = body;

    console.log('=== NOVA LISTA ÁUDIO/VIDEO SOLICITADA ===');
    console.log('Mês:', mes, 'Ano:', ano);

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

    // 1. Calcular quintas e domingos do mês
    const quintasEDomingos = calcularQuintasEDomingosDoMes(mes, ano);
    
    if (quintasEDomingos.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma quinta ou domingo encontrada para o mês e ano especificados' },
        { status: 400 }
      );
    }

    console.log('📅 Quintas e Domingos do mês:', quintasEDomingos);

    // 2. Buscar pessoas // 2. Buscar pessoas com privilégio 'Áudio e Vídeo' - VERSÃO CORRIGIDA
const todosObjetos = await dbUtils.findAll();
const pessoasAudioVideo = todosObjetos
  .filter(objeto => {
    const temPrivilegio = objeto.privilégio && objeto.privilégio.includes('Áudio e Vídeo');
    console.log(`🔍 Verificando ${objeto.nome}: ${objeto.privilégio} -> ${temPrivilegio}`);
    return temPrivilegio;
  })
  .map(objeto => ({
    ...objeto,
    id: objeto.id.toString()
  })) as unknown as Objeto[];

console.log('👥 Pessoas Áudio/Video disponíveis:', pessoasAudioVideo.map(p => ({
  id: p.id,
  nome: p.nome,
  privilégio: p.privilégio
})));

if (pessoasAudioVideo.length === 0) {
  console.log('❌ Nenhuma pessoa com privilégio "Áudio e Vídeo" encontrada');
  return NextResponse.json(
    { error: 'Nenhuma pessoa com privilégio "Áudio e Vídeo" encontrada' },
    { status: 400 }
  );
}
    // 3. Buscar listas anteriores para determinar a sequência
    const listasAnteriores = await buscarListasAudioVideo();
    
    // 4. Determinar a próxima pessoa da sequência
    const proximaPessoa = determinarProximaPessoa(pessoasAudioVideo, listasAnteriores);
    
    // 5. Distribuir pessoas sequencialmente para as quintas e domingos
   const pessoasDistribuidas = distribuirPessoasSequencialmente(
  pessoasAudioVideo, 
  quintasEDomingos.length, 
  proximaPessoa
);

console.log('✅ Pessoas distribuídas:', pessoasDistribuidas.map((p, index) => 
  `${quintasEDomingos[index]}: ${p.nome}`
));
// DEBUG: Verificar todos os objetos disponíveis
console.log('📦 Todos os objetos disponíveis:', todosObjetos.map(obj => ({
  id: obj.id,
  nome: obj.nome,
  privilégio: obj.privilégio
})));
    // 6. Criar o array de datas com as pessoas designadas
    const datasComPessoas: DataComPessoa[] = quintasEDomingos.map((data, index) => ({
      data,
      pessoa: pessoasDistribuidas[index] || null
    }));

    // 7. Criar objeto audioVideoLista
    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Salvar apenas as pessoas designadas, não todas as disponíveis
    const pessoasDesignadas = pessoasDistribuidas;

    console.log('🎯 OBJETO FINAL A SER SALVO:');
    console.log('dataav length:', datasComPessoas.length);
    console.log('pessoaparte length:', pessoasDesignadas.length);

    const novaListaAudioVideo = await criarListaAudioVideo({
      idlistaav: `lista-av-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      nomemes: `${nomesMeses[mes - 1]} de ${ano}`,
      dataav: datasComPessoas,
      pessoaparte: pessoasDesignadas
    });

    return NextResponse.json({
      message: 'Lista de Áudio e Vídeo criada com sucesso!',
      audioVideoLista: novaListaAudioVideo
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar lista de áudio e vídeo:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}


// Funções do banco de dados para áudio e vídeo
async function buscarListasAudioVideo(): Promise<AudioVideoLista[]> {
  try {
    return await audioVideoUtils.findAll();
  } catch (error) {
    console.error('Erro ao buscar listas de áudio e vídeo:', error);
    return [];
  }
}

async function criarListaAudioVideo(data: Omit<AudioVideoLista, 'id' | 'dataCriacao'>): Promise<AudioVideoLista> {
  try {
    return await audioVideoUtils.create(data);
  } catch (error) {
    console.error('Erro ao criar lista de áudio e vídeo:', error);
    throw error;
  }
}