'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  CalendarToday,
  Person,
  Warning as WarningIcon,
  VolumeUp as VolumeUpIcon
} from '@mui/icons-material';
import { Objeto, AudioVideoLista, DataComPessoaAV } from '@/types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Interface estendida para o objeto jsPDF
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
    [key: string]: unknown;
  };
}

const AudioVideo: React.FC = () => {
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [listasExistentes, setListasExistentes] = useState<AudioVideoLista[]>([]);
  
  // Estados para edição
  const [editarOpen, setEditarOpen] = useState<boolean>(false);
  const [listaEditando, setListaEditando] = useState<AudioVideoLista | null>(null);
  const [pessoasEditadas, setPessoasEditadas] = useState<Objeto[]>([]);
  
  // Estados para exclusão
  const [excluirOpen, setExcluirOpen] = useState<boolean>(false);
  const [listaExcluindo, setListaExcluindo] = useState<AudioVideoLista | null>(null);
  
  // Estados para lista existente
  const [dialogListaExistenteOpen, setDialogListaExistenteOpen] = useState<boolean>(false);
  const [mesExistente, setMesExistente] = useState<string>('');
  
  // Snackbar para feedback
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Buscar todas as pessoas disponíveis para edição
  const [todasPessoas, setTodasPessoas] = useState<Objeto[]>([]);

  // Carregar listas existentes ao montar o componente
  useEffect(() => {
    carregarListasExistentes();
  }, []);

  useEffect(() => {
    const buscarPessoas = async () => {
      try {
        const response = await fetch('/api/objetos');
        if (response.ok) {
          const objetos = await response.json();
          const pessoasAV = objetos.filter((objeto: Objeto) => 
            objeto.privilégio.includes('Áudio e Vídeo')
          );
          setTodasPessoas(pessoasAV);
        }
      } catch (error) {
        console.error('Erro ao buscar pessoas:', error);
      }
    };
    
    if (editarOpen) {
      buscarPessoas();
    }
  }, [editarOpen]);

  const carregarListasExistentes = async () => {
    try {
            console.log('🔄 Iniciando carregamento de listas...');

        
      const response = await fetch('/api/audio-video');
          console.log('📨 Resposta do GET /api/audio-video:', response.status);
            
      if (response.ok) {
        const listas: AudioVideoLista[] = await response.json();
              console.log('📊 Listas recebidas da API:', listas);

        // Ordenar por data (mais antigo primeiro)
        const listasOrdenadas = listas.sort((a, b) => {
          const extrairData = (nomemes: string) => {
            const meses = [
              'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
              'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
            ];
            
            const [mesStr, , anoStr] = nomemes.toLowerCase().split(' ');
            const mes = meses.indexOf(mesStr) + 1;
            const ano = parseInt(anoStr);
            
            return new Date(ano, mes - 1).getTime();
          };
          
          return extrairData(a.nomemes) - extrairData(b.nomemes);
        });

              console.log('✅ Listas ordenadas:', listasOrdenadas);
        setListasExistentes(listasOrdenadas);
      }
    } catch (error) {
             console.error('❌ Erro ao carregar listas:', error);


      console.error('Erro ao carregar listas:', error);
    }
  };

  // Função para verificar se já existe lista para o mês/ano
  const verificarListaExistente = (mes: number, ano: number): boolean => {
    const nomesMeses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    const nomeMesBusca = nomesMeses[mes - 1];
    const nomeCompletoBusca = `${nomeMesBusca} de ${ano}`.toLowerCase();
    
    return listasExistentes.some(lista => 
      lista.nomemes.toLowerCase() === nomeCompletoBusca
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // VERIFICAÇÃO: Checar se já existe lista para este mês/ano
      if (verificarListaExistente(mes, ano)) {
        const nomesMeses = [
          'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
          'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
        ];
        const nomeMes = nomesMeses[mes - 1];
        setMesExistente(`${nomeMes} de ${ano}`);
        setDialogListaExistenteOpen(true);
        setLoading(false);
        return;
      }

          console.log('📤 Enviando requisição para criar lista...');

      const response = await fetch('/api/audio-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mes, ano }),
      });

          console.log('📨 Resposta recebida:', response.status, response.statusText);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar lista');
      }

      setSnackbarMessage('Lista de Áudio e Vídeo criada com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
          console.log('🔄 Recarregando listas existentes...');

      await carregarListasExistentes();
      
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString: string) => {
    const [ano, mes, dia] = dataString.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    return dataObj.toLocaleDateString('pt-BR', { 
      weekday: 'short',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // Função para exportar PDF individual
  const exportarParaPDF = (lista: AudioVideoLista) => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(16);
      doc.text('Designação de Áudio e Vídeo', 105, 15, { align: 'center' });
      doc.text(lista.nomemes, 105, 25, { align: 'center' });
      
      // Dados da tabela
      const body = lista.dataav.map((item) => {
        const nomePessoa = item.pessoa?.nome || 'Não atribuído';
        const diaSemana = new Date(item.data).toLocaleDateString('pt-BR', { weekday: 'long' });
        return [
          formatarData(item.data),
          diaSemana,
          nomePessoa
        ];
      });

      autoTable(doc, {
        startY: 35,
        head: [['Data', 'Dia', 'Responsável']],
        body: body,
        styles: { fontSize: 12 },
        headStyles: { 
          fillColor: [70, 130, 180],
          textColor: 255 
        },
        alternateRowStyles: { 
          fillColor: [240, 240, 240] 
        }
      });

      doc.save(`audio_video_${lista.nomemes.replace(/ /g, '_')}.pdf`);
      
    } catch (error) {
      console.error('Erro PDF:', error);
      setSnackbarMessage('Erro ao gerar PDF');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Função para exportar todas as listas
  const exportarTodasListasPDF = () => {
    try {
      const doc = new jsPDF();
      
      let currentY = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      
      // Título principal
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('DESIGNAÇÃO DE ÁUDIO E VÍDEO', pageWidth / 2, currentY, { align: 'center' });
      currentY += 10;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Período: ${listasExistentes.length} meses`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
      
      const listasParaExportar = listasExistentes;
      
      listasParaExportar.forEach((lista, index) => {
        if (currentY > 250) {
          doc.addPage();
          currentY = 15;
        }
        
        // Título da lista individual
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(lista.nomemes.toUpperCase(), margin, currentY);
        currentY += 3;
        
        // Preparar dados da tabela
        const tableData = lista.dataav.map((item) => {
          const nomePessoa = item.pessoa?.nome || 'NÃO ATRIBUÍDO';
          const diaSemana = new Date(item.data).toLocaleDateString('pt-BR', { weekday: 'long' });
          return [
            formatarData(item.data),
            diaSemana,
            nomePessoa
          ];
        });
        
        // Adicionar tabela
        autoTable(doc, {
          startY: currentY,
          head: [['DATA', 'DIA', 'RESPONSÁVEL']],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [70, 130, 180],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
          },
          styles: {
            fontSize: 9,
            cellPadding: 3,
            halign: 'center'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          },
          columnStyles: {
            0: { cellWidth: 40 },
            1: { cellWidth: 30 },
            2: { cellWidth: 'auto', halign: 'left' }
          },
          margin: { horizontal: margin }
        });
        
        currentY = (doc as JsPDFWithAutoTable).lastAutoTable!.finalY + 15;

        if (index < listasParaExportar.length - 1 && currentY > 270) {
          doc.addPage();
          currentY = 15;
        }
      });
      
      // Rodapé
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Designação de Áudio e Vídeo', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      
      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      doc.save(`Relatorio_Completo_Audio_Video_${dataAtual}.pdf`);
      
      setSnackbarMessage(`Relatório com ${listasExistentes.length} listas exportado com sucesso!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error('Erro ao exportar todas as listas:', error);
      setSnackbarMessage('Erro ao gerar relatório completo.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Funções para edição
  const abrirEdicao = (listaId: number) => {
    const listaAtualizada = listasExistentes.find(l => l.id === listaId);
    
    if (!listaAtualizada) {
      console.error('Lista não encontrada no estado atual');
      return;
    }

    setListaEditando(listaAtualizada);
    
    const pessoasIniciais = listaAtualizada.dataav.map(item => 
      item.pessoa || null
    );
    
    setPessoasEditadas(pessoasIniciais);
    setEditarOpen(true);
  };

  const fecharEdicao = () => {
    setEditarOpen(false);
    setListaEditando(null);
    setPessoasEditadas([]);
  };

  const salvarEdicao = async () => {
    if (!listaEditando) return;

    try {
      // Filtrar apenas pessoas que foram atribuídas
      const pessoasAtribuidas = pessoasEditadas.filter(pessoa => pessoa !== null && pessoa !== undefined);

      // Verificar se há nomes repetidos
      const nomesPessoas = pessoasAtribuidas.map(pessoa => pessoa.nome);
      const nomesUnicos = new Set(nomesPessoas);
      
      if (nomesPessoas.length !== nomesUnicos.size) {
        const nomesRepetidos = nomesPessoas.filter((nome, index) => 
          nomesPessoas.indexOf(nome) !== index
        );
        const nomesRepetidosUnicos = [...new Set(nomesRepetidos)];
        
        const confirmar = window.confirm(
          `Os seguintes nomes se repetem na lista: ${nomesRepetidosUnicos.join(', ')}\n\nDeseja salvar assim mesmo?`
        );
        // VALIDAÇÃO: Verificar conflitos com outras listas
        const conflitos: string[] = [];
        // Buscar designações existentes do mês
    const response = await fetch(`/api/designacoes?mes=${mes}&ano=${ano}`);
    if (response.ok) {
      const designacoesExistentes = await response.json();
      
      pessoasEditadas.forEach((pessoa, index) => {
        if (pessoa) {
          const data = listaEditando.dataav[index].data;
          const designacoesNaData = designacoesExistentes[data] || [];
          
          if (designacoesNaData.includes(pessoa.id)) {
            conflitos.push(`${formatarData(data)}: ${pessoa.nome}`);
          }
        }
      });
    }

    if (conflitos.length > 0) {
      const confirmar = window.confirm(
        `Os seguintes conflitos foram encontrados:\n\n${conflitos.join('\n')}\n\nDeseja salvar assim mesmo?`
      );

        if (!confirmar) {
          return;
        }
      }
    }
      // Atualizar dataav
      const dataavAtualizado = listaEditando.dataav.map((item, index) => ({
        ...item,
        pessoa: pessoasEditadas[index] || null
      }));

      // Atualizar a lista no banco de dados
      const updateResponse = await fetch(`/api/audio-video/${listaEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pessoaparte: pessoasAtribuidas,
          dataav: dataavAtualizado
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Erro ao atualizar lista');
      }

      const result = await updateResponse.json();
      const listaAtualizadaDoBackend: AudioVideoLista = result.audioVideoLista;

      // Atualizar o estado local
      setListasExistentes(prevLists => 
        prevLists.map(lista => 
          lista.id === listaAtualizadaDoBackend.id 
            ? { ...listaAtualizadaDoBackend }
            : lista
        )
      );

      setSnackbarMessage('Lista atualizada com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      fecharEdicao();
      
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
      setSnackbarMessage('Erro ao atualizar lista');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Funções para exclusão
  const abrirExclusao = (lista: AudioVideoLista) => {
    setListaExcluindo(lista);
    setExcluirOpen(true);
  };

  const fecharExclusao = () => {
    setExcluirOpen(false);
    setListaExcluindo(null);
  };

  const confirmarExclusao = async () => {
    if (!listaExcluindo) return;

    try {
      const response = await fetch(`/api/audio-video/${listaExcluindo.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir lista');
      }

      setSnackbarMessage('Lista excluída com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      fecharExclusao();
      await carregarListasExistentes();
      
    } catch (error) {
      setSnackbarMessage('Erro ao excluir lista');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          <VolumeUpIcon sx={{ mr: 2, fontSize: 32 }} />
          Gerenciar Áudio e Vídeo
        </Typography>
        
        {listasExistentes.length > 0 && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<DownloadIcon />}
            onClick={exportarTodasListasPDF}
            disabled={listasExistentes.length === 0}
          >
            Exportar Todas as Listas
          </Button>
        )}    
      </Box>
        
      {/* Formulário para criar nova lista */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Criar Nova Lista de Áudio e Vídeo
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Serão designadas pessoas para todas as quintas e domingos do mês
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
              gap: 3,
              mb: 2 
            }}>
              <TextField
                select
                fullWidth
                label="Mês"
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                SelectProps={{
                  native: true,
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((mesNum) => (
                  <option key={mesNum} value={mesNum}>
                    {new Date(2000, mesNum - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </TextField>

              <TextField
                fullWidth
                type="number"
                label="Ano"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                inputProps={{ min: 2000, max: 2100 }}
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
              sx={{ mt: 3 }}
              startIcon={loading ? <CircularProgress size={20} /> : <VolumeUpIcon />}
            >
              {loading ? 'Processando...' : 'Criar Lista de Áudio e Vídeo'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Lista de listas existentes */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Listas de Áudio e Vídeo Existentes
          </Typography>

          {listasExistentes.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              Nenhuma lista de áudio e vídeo criada ainda.
            </Typography>
          ) : (
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
              gap: 3 
            }}>
              {listasExistentes.map((lista) => (
                <Paper key={lista.id} elevation={2} sx={{ p: 2, position: 'relative' }}>
                  {/* Header com ações */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" component="h3">
                        {lista.nomemes}
                      </Typography>
                      <Chip 
                        label={`Quintas e Domingos`} 
                        size="small" 
                        variant="outlined"
                        color="primary"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    
                    <Box>
                      <IconButton 
                        color="success" 
                        onClick={() => exportarParaPDF(lista)}
                        sx={{ mr: 1 }}
                        title="Exportar para PDF"
                      >
                        <DownloadIcon />
                      </IconButton>
                      
                      <IconButton 
                        color="primary" 
                        onClick={() => abrirEdicao(lista.id)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error" 
                        onClick={() => abrirExclusao(lista)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Tabela responsiva */}
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                              Data
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Person sx={{ fontSize: 16, mr: 1 }} />
                              Responsável
                            </Box>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lista.dataav.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell 
                              sx={{ 
                                fontWeight: 'bold',
                                display: { xs: 'none', sm: 'table-cell' }
                              }}
                            >
                              {formatarData(item.data)}
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    display: { xs: 'inline', sm: 'none' },
                                    fontWeight: 'bold',
                                    mr: 1
                                  }}
                                >
                                  {formatarData(item.data)}:
                                </Typography>
                                
                                {item.pessoa ? (
                                  <Chip 
                                    label={item.pessoa.nome} 
                                    size="small" 
                                    color="primary"
                                    variant="outlined"
                                  />
                                ) : (
                                  <Typography variant="body2" color="text.secondary" fontStyle="italic">
                                    Não atribuído
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Criado em: {new Date(lista.dataCriacao).toLocaleDateString('pt-BR')}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={editarOpen} onClose={fecharEdicao} maxWidth="lg" fullWidth>
        <DialogTitle>
          <VolumeUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Editar Lista de Áudio e Vídeo - {listaEditando?.nomemes}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Atribua uma pessoa responsável para cada data do mês:
          </Typography>
          
          <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: '40%', fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                      Data
                    </Box>
                  </TableCell>
                  <TableCell sx={{ width: '60%', fontWeight: 'bold' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ fontSize: 16, mr: 1 }} />
                      Responsável
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listaEditando?.dataav.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {formatarData(data.data)}
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={pessoasEditadas[index]?.id || ''}
                        onChange={(e) => {
                          const pessoaId = parseInt(e.target.value);
                          const pessoaSelecionada = todasPessoas.find(p => p.id === pessoaId);
                          
                          if (pessoaSelecionada) {
                            const novasPessoas = [...pessoasEditadas];
                            novasPessoas[index] = pessoaSelecionada;
                            setPessoasEditadas(novasPessoas);
                          }
                        }}
                      >
                        <MenuItem value="">
                          <em>Selecionar responsável...</em>
                        </MenuItem>
                        {todasPessoas.map((pessoa) => (
                          <MenuItem key={pessoa.id} value={pessoa.id}>
                            {pessoa.nome}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Pessoas disponíveis:</strong> {todasPessoas.length} pessoa(s)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Dias atribuídos:</strong> {pessoasEditadas.filter(p => p).length} de {listaEditando?.dataav.length}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharEdicao}>Cancelar</Button>
          <Button 
            onClick={salvarEdicao} 
            variant="contained" 
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={excluirOpen} onClose={fecharExclusao}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a lista de áudio e vídeo <strong>{listaExcluindo?.nomemes}</strong>?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharExclusao}>Cancelar</Button>
          <Button onClick={confirmarExclusao} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Lista Já Existente */}
      <Dialog 
        open={dialogListaExistenteOpen} 
        onClose={() => setDialogListaExistenteOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          backgroundColor: '#fff3cd', 
          color: '#856404',
          borderBottom: '1px solid #ffeaa7'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1, color: '#ffc107' }} />
            Atenção
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1">
            Já existe uma lista para o mês de <strong>{mesExistente}</strong>.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
            Não é possível criar duas listas para o mesmo mês.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDialogListaExistenteOpen(false)} 
            variant="contained" 
            color="primary"
          >
            Entendi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AudioVideo;