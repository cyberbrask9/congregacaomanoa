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
  Person
} from '@mui/icons-material';
import { Objeto } from '@/types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// SOLUÇÃO DEFINITIVA DE TIPAGEM PARA GRID (MUI V5 + React 19)
// Use Box com display grid em vez de Grid com item para evitar problemas de tipagem

// Interface estendida para o objeto jsPDF que inclua a propriedade lastAutoTable.
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
    [key: string]: unknown;
  };
}

// Interface para lista de leitores desegnados
interface LeitorDesignado {
  id: string;
  nome: string;
  // Adicione outras propriedades que o leitor possa ter
  privilégio?: string;
  foto?: string;
  [key: string]: unknown; // Para propriedades adicionais
}

interface DataComLeitor {
  data: string;
  leitor: LeitorDesignado;
}

// Interface para leitorlistsentinela
interface LeitorListSentinela {
  id: number;
  idlistsentina: string;
  nomemes: string;
  dataleitorsentinela: string[];
  leitoriosparte: Objeto[];
  dataCriacao: Date;
}

const LeitoresSentinela: React.FC = () => {
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [listasExistentes, setListasExistentes] = useState<LeitorListSentinela[]>([]);
  
  // Estados para edição
  const [editarOpen, setEditarOpen] = useState<boolean>(false);
  const [listaEditando, setListaEditando] = useState<LeitorListSentinela | null>(null);
  const [leitoresEditados, setLeitoresEditados] = useState<Objeto[]>([]);
  
  // Estados para exclusão
  const [excluirOpen, setExcluirOpen] = useState<boolean>(false);
  const [listaExcluindo, setListaExcluindo] = useState<LeitorListSentinela | null>(null);
  
  // Estados para nomes repetidos
  const [dialogRepetidoOpen, setDialogRepetidoOpen] = useState<boolean>(false);
  const [nomesRepetidos, setNomesRepetidos] = useState<string[]>([]);
  const [leitoresParaSalvar, setLeitoresParaSalvar] = useState<Objeto[]>([]);
  
  // Snackbar para feedback
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Buscar todos os leitores disponíveis para edição
  const [todosLeitores, setTodosLeitores] = useState<Objeto[]>([]);

  // Carregar listas existentes ao montar o componente
  useEffect(() => {
    carregarListasExistentes();
  }, []);

  useEffect(() => {
    const buscarLeitores = async () => {
      try {
        const response = await fetch('/api/objetos');
        if (response.ok) {
          const objetos = await response.json();
          const leitores = objetos.filter((objeto: Objeto) => 
            objeto.privilégio.includes('Leitor A Sentinela')
          );
          setTodosLeitores(leitores);
        }
      } catch (error) {
        console.error('Erro ao buscar leitores:', error);
      }
    };
    
    if (editarOpen) {
      buscarLeitores();
    }
  }, [editarOpen]);

  const carregarListasExistentes = async () => {
    try {
      const response = await fetch('/api/leitor-sentinela');
      if (response.ok) {
        const listas: LeitorListSentinela[] = await response.json();
        
        // Ordenar por data (mais antigo primeiro)
        const listasOrdenadas = listas.sort((a, b) => {
          // Extrair mês e ano do nomemes (ex: "Setembro de 2025")
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
        
        setListasExistentes(listasOrdenadas);
      }
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/leitor-sentinela', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mes, ano }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar leitores');
      }

      setSnackbarMessage('Lista de leitores criada com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
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

  const formatarData = (dataString: string | DataComLeitor) => {
    // Se a data já está no formato YYYY-MM-DD, converter corretamente
    const data = typeof dataString === 'string' ? dataString : dataString.data;
    const [ano, mes, dia] = data.split('-').map(Number);
    const dataObj = new Date(ano, mes - 1, dia);
    return dataObj.toLocaleDateString('pt-BR');
  };

  // Função para exportar PDF - DEFINIDA CORRETAMENTE
  const exportarParaPDF = (lista: LeitorListSentinela) => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(16);
      doc.text('Leitores da Sentinela', 105, 15, { align: 'center' });
      doc.text(lista.nomemes, 105, 25, { align: 'center' });
      
      // Dados da tabela
      const body = lista.dataleitorsentinela.map((data, index) => [
        formatarData(data),
        lista.leitoriosparte[index]?.nome || 'Não atribuído'
      ]);

      // FORMA CORRETA - autoTable é uma função separada
      autoTable(doc, {
        startY: 35,
        head: [['Data', 'Leitor']],
        body: body,
        styles: { fontSize: 14 },
        headStyles: { 
          fillColor: [61, 142, 64],
          textColor: 255 
        },
        alternateRowStyles: { 
          fillColor: [240, 240, 240] 
        }
      });

      doc.save(`leitores_${lista.nomemes.replace(/ /g, '_')}.pdf`);
      
    } catch (error) {
      console.error('Erro PDF:', error);
      
      let errorMessage = 'Erro ao gerar PDF';
      if (error instanceof Error) {
        errorMessage += ': ' + error.message;
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // função para exportar todas as listas
  const exportarTodasListasPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Configurações
      let currentY = 15;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      
      // Título principal
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('LEITORES DA SENTINELA', pageWidth / 2, currentY, { align: 'center' });
      currentY += 10;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Período: ${listasExistentes.length} meses`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
      
      // ✅ USAR A MESMA ORDEM DA TELA (já está ordenada crescente em listasExistentes)
      const listasParaExportar = listasExistentes; // Já está ordenada crescente
      
      // Processar cada lista na ORDEM CRESCENTE
      listasParaExportar.forEach((lista, index) => {
        // Verificar se precisa de nova página
        if (currentY > 250) {
          doc.addPage();
          currentY = 15;
        }
        
        // Título da lista individual
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(lista.nomemes.toUpperCase(), margin, currentY);
        currentY += 3;
        
        // Informações da lista
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
      
        // Preparar dados da tabela
        const tableData = lista.dataleitorsentinela.map((data, idx) => [
          formatarData(data),
          lista.leitoriosparte[idx]?.nome || 'NÃO ATRIBUÍDO'
        ]);
        
        // Adicionar tabela da lista atual
        autoTable(doc, {
          startY: currentY,
          head: [['DATA', 'LEITOR']],
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
            1: { cellWidth: 'auto', halign: 'left' }
          },
          margin: { horizontal: margin }
        });
        
        // Atualizar posição Y para próxima lista
        currentY = (doc as JsPDFWithAutoTable).lastAutoTable!.finalY + 15;

        
        // Adicionar linha separadora entre listas (exceto na última)
        if (index < listasParaExportar.length - 1) {
          if (currentY > 270) {
            doc.addPage();
            currentY = 15;
          } else {
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, currentY, pageWidth - margin, currentY);
            currentY += 10;
          }
        }
      });
      
      // Rodapé final
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Lista de leitores A Sentinala', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      
      // Salvar PDF
      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      doc.save(`Relatorio_Completo_Leitores_${dataAtual}.pdf`);
      
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
  const abrirEdicao = (lista: LeitorListSentinela) => {
    setListaEditando(lista);
    
    // Inicializar o array de leitores editados mantendo a ordem das datas
    const leitoresIniciais = lista.dataleitorsentinela.map((data, index) => 
      lista.leitoriosparte[index] || null
    );
    
    setLeitoresEditados(leitoresIniciais);
    setEditarOpen(true);
  };

  const fecharEdicao = () => {
    setEditarOpen(false);
    setListaEditando(null);
    setLeitoresEditados([]);
  };

  // função para salvar a edição
  const salvarEdicao = async () => {
    if (!listaEditando) return;

    try {
      // Filtrar apenas leitores que foram atribuídos (remover null/undefined)
      const leitoresAtribuidos = leitoresEditados.filter(leitor => leitor !== null && leitor !== undefined);

      // Verificar se há nomes repetidos
      const nomesLeitores = leitoresAtribuidos.map(leitor => leitor.nome);
      const nomesUnicos = new Set(nomesLeitores);
      
      if (nomesLeitores.length !== nomesUnicos.size) {
        // Encontrar nomes repetidos
        const nomesRepetidos = nomesLeitores.filter((nome, index) => 
          nomesLeitores.indexOf(nome) !== index
        );
        const nomesRepetidosUnicos = [...new Set(nomesRepetidos)];
        
        // Mostrar diálogo de confirmação para nomes repetidos
        const confirmar = window.confirm(
          `Os seguintes nomes se repetem na lista: ${nomesRepetidosUnicos.join(', ')}\n\nDeseja salvar assim mesmo?`
        );
        
        if (!confirmar) {
          return; // Abortar se o usuário cancelar
        }
      }

      // Atualizar a lista no banco de dados
      const updateResponse = await fetch(`/api/leitor-sentinela/${listaEditando.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leitoriosparte: leitoresAtribuidos
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Erro ao atualizar lista');
      }

      setSnackbarMessage('Lista atualizada com sucesso!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      fecharEdicao();
      await carregarListasExistentes();
      
    } catch (error) {
      setSnackbarMessage('Erro ao atualizar lista');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Funções para exclusão
  const abrirExclusao = (lista: LeitorListSentinela) => {
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
      const response = await fetch(`/api/leitor-sentinela/${listaExcluindo.id}`, {
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

  const toggleLeitor = (leitor: Objeto) => {
    setLeitoresEditados(prev => {
      const existe = prev.find(l => l.id === leitor.id);
      if (existe) {
        return prev.filter(l => l.id !== leitor.id);
      } else {
        return [...prev, leitor];
      }
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Gerenciar Leitores da Sentinela
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
            Criar Nova Lista de Leitores
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {/* SOLUÇÃO: Use Box com display grid em vez de Grid com item */}
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
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? 'Processando...' : 'Criar Lista de Leitores'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Lista de listas existentes */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Listas de Leitores Existentes
          </Typography>

          {listasExistentes.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" py={4}>
              Nenhuma lista de leitores criada ainda.
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
                        label={`ID: ${lista.idlistsentina}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                    
                    <Box>
                      {/* Botão Exportar */}
                      <IconButton 
                        color="success" 
                        onClick={() => exportarParaPDF(lista)}
                        sx={{ mr: 1 }}
                        title="Exportar para PDF"
                      >
                        <DownloadIcon />
                      </IconButton>
                      
                      {/* Botões Editar e Excluir */}
                      <IconButton 
                        color="primary" 
                        onClick={() => abrirEdicao(lista)}
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
                              Leitor
                            </Box>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lista.dataleitorsentinela.map((item: string | DataComLeitor, index) => {
                  // Extrair data do item (compatível com ambas estruturas)
                  const data = typeof item === 'string' ? item : item.data;
                  
                  // Determinar qual leitor usar (prioridade: leitor do item > leitor da lista)
                  let leitor = null;
                  
                  if (typeof item === 'object' && 'leitor' in item) {
                    // Nova estrutura: leitor vem dentro do item
                    leitor = item.leitor;
                  } else if (lista.leitoriosparte && lista.leitoriosparte[index]) {
                    // Estrutura antiga: leitor vem do array leitoriosparte
                    leitor = lista.leitoriosparte[index];
                  }
                          return (
                            <TableRow key={index}> 
                              <TableCell 
                                sx={{ 
                                  fontWeight: 'bold',
                                  display: { xs: 'none', sm: 'table-cell' }
                                }}
                              >
                                {formatarData(data)}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {/* Mostrar data em mobile */}
                                  <Typography 
                                    variant="body2" 
                                    sx={{ 
                                      display: { xs: 'inline', sm: 'none' },
                                      fontWeight: 'bold',
                                      mr: 1
                                    }}
                                  >
                                    {formatarData(data)}:
                                  </Typography>
                                  
                                  {leitor ? (
                                    <Chip 
                                      label={leitor.nome} 
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
                          );
                        })}
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
          Editar Lista de Leitores - {listaEditando?.nomemes}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Atribua um leitor para cada domingo do mês:
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
                      Leitor Atribuído
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listaEditando?.dataleitorsentinela.map((data, index) => (
                  <TableRow key={index}> 
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {formatarData(data)}
                    </TableCell>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={leitoresEditados[index]?.id || ''}
                        onChange={(e) => {
                          const leitorId = parseInt(e.target.value);
                          const leitorSelecionado = todosLeitores.find(l => l.id === leitorId);
                          
                          if (leitorSelecionado) {
                            const novosLeitores = [...leitoresEditados];
                            novosLeitores[index] = leitorSelecionado;
                            setLeitoresEditados(novosLeitores);
                          }
                        }}
                      >
                        <MenuItem value="">
                          <em>Selecionar leitor...</em>
                        </MenuItem>
                        {todosLeitores.map((leitor) => (
                          <MenuItem key={leitor.id} value={leitor.id}>
                            {leitor.nome}
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
              <strong>Leitores disponíveis:</strong> {todosLeitores.length} leitor(es)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Domingos atribuídos:</strong> {leitoresEditados.filter(l => l).length} de {listaEditando?.dataleitorsentinela.length}
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
            Tem certeza que deseja excluir a lista de leitores <strong>{listaExcluindo?.nomemes}</strong>?
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

export default LeitoresSentinela;