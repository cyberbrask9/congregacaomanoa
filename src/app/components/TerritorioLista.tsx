'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Divider
} from '@mui/material';
import {
  Expand as ExpandIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Numbers as NumbersIcon,
  Image as ImageIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon
} from '@mui/icons-material';
import Image from 'next/image';
import { Projeto, Ordenacao } from '@/types/projeto';
import { projetoService } from '@/services/api';
import Territorios from './Territorios';

interface ProjetoListProps {
  projetos: Projeto[];
  loading?: boolean;
  error?: string;
  onProjetoAtualizado: () => void;
}

export default function TerritorioLista({ projetos = [], loading = false, error, onProjetoAtualizado }: ProjetoListProps) {
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('datafim_desc');
  const [imagemExpandida, setImagemExpandida] = useState<string | null>(null);
  const [projetoEditando, setProjetoEditando] = useState<Projeto | null>(null);
  const [projetoExcluindo, setProjetoExcluindo] = useState<Projeto | null>(null);
  const [projetoConcluindo, setProjetoConcluindo] = useState<Projeto | null>(null);
  const [dataConclusao, setDataConclusao] = useState('');
  const [editandoResponsavel, setEditandoResponsavel] = useState('');
  const [editandoDataInicio, setEditandoDataInicio] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [dialogCadastroAberto, setDialogCadastroAberto] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Debug: log dos projetos recebidos
  useEffect(() => {
    console.log('Projetos recebidos no TerritorioLista:', projetos);
    console.log('Número de projetos:', projetos.length);
  }, [projetos]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Função para ordenar projetos - tratar projetos sem datafim
  const projetosOrdenados = Array.isArray(projetos) ? [...projetos].sort((a, b) => {
    switch (ordenacao) {
      case 'datafim_asc': 
        if (!a.datafim && !b.datafim) return 0;
        if (!a.datafim) return 1;
        if (!b.datafim) return -1;
        return new Date(a.datafim).getTime() - new Date(b.datafim).getTime();
      
      case 'datafim_desc':
        if (!a.datafim && !b.datafim) return 0;
        if (!a.datafim) return 1;
        if (!b.datafim) return -1;
        return new Date(b.datafim).getTime() - new Date(a.datafim).getTime();
      
      case 'numero_asc':
        return a.numero - b.numero;
      
      case 'numero_desc':
        return b.numero - a.numero;
      
      default:
        return 0;
    }
  }) : [];

  const handleOrdenacaoChange = (event: SelectChangeEvent) => {
    setOrdenacao(event.target.value as Ordenacao);
  };

  const formatarData = (data: string | undefined) => {
    if (!data) return 'Não definida';
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (concluido: boolean) => {
    return concluido ? 'success' : 'primary';
  };

  const getStatusText = (concluido: boolean) => {
    return concluido ? 'Finalizado' : 'Em andamento';
  };

  // Função para abrir o pop-up de cadastro
  const abrirCadastro = () => {
    setDialogCadastroAberto(true);
  };

  // Função para fechar o pop-up de cadastro
  const fecharCadastro = () => {
    setDialogCadastroAberto(false);
  };

  // Função chamada quando um território é cadastrado com sucesso
  const handleTerritorioCadastrado = () => {
    console.log('Território cadastrado - fechando dialog e atualizando lista');
    fecharCadastro();
    
    // Chama a função de atualização imediatamente
    onProjetoAtualizado();
    
    // E novamente após um pequeno delay para garantir que o servidor processou
    setTimeout(() => {
      console.log('Atualizando lista novamente após delay');
      onProjetoAtualizado();
    }, 1000);
  };

  // Função para editar projeto
  const abrirEdicao = (projeto: Projeto) => {
    setProjetoEditando(projeto);
    setEditandoResponsavel(projeto.responsavel);
    setEditandoDataInicio(projeto.datainicio);
  };

  const salvarEdicao = async () => {
    if (!projetoEditando) return;

    setSalvando(true);
    try {
      console.log('Salvando edição do projeto:', projetoEditando.id);
      await projetoService.atualizarProjeto(projetoEditando.id!, {
        responsavel: editandoResponsavel,
        datainicio: editandoDataInicio,
        datafim: projetoEditando.datafim || undefined,
        concluido: projetoEditando.concluido
      });
      
      setProjetoEditando(null);
      onProjetoAtualizado();
    } catch (error) {
      console.error('Erro ao editar projeto:', error);
      alert('Erro ao editar projeto');
    } finally {
      setSalvando(false);
    }
  };

  // Função para excluir projeto
  const confirmarExclusao = async () => {
    if (!projetoExcluindo) return;

    setSalvando(true);
    try {
      console.log('Excluindo projeto:', projetoExcluindo.id);
      await projetoService.deletarProjeto(projetoExcluindo.id!);
      setProjetoExcluindo(null);
      onProjetoAtualizado();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      alert('Erro ao excluir projeto');
    } finally {
      setSalvando(false);
    }
  };

  // Função para concluir projeto
  const concluirProjeto = async () => {
    if (!projetoConcluindo || !dataConclusao) return;

    setSalvando(true);
    try {
      console.log('Concluindo projeto:', projetoConcluindo.id);
      await projetoService.atualizarProjeto(projetoConcluindo.id!, {
        datafim: dataConclusao,
        concluido: true,
        responsavel: projetoConcluindo.responsavel,
        datainicio: projetoConcluindo.datainicio
      });
      
      setProjetoConcluindo(null);
      setDataConclusao('');
      onProjetoAtualizado();
    } catch (error) {
      console.error('Erro ao concluir projeto:', error);
      alert('Erro ao concluir projeto');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
        <Typography variant="body2" sx={{ ml: 2 }}>
          Carregando territórios...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Filtros de ordenação com botão de cadastro */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Typography variant="h6" component="h2">
            Territórios Cadastrados
          </Typography>
          
          <Chip 
            label={`${projetos.length} território(s)`} 
            variant="outlined" 
            size="small" 
          />

          {/* Botão Cadastrar Território */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={abrirCadastro}
            sx={{ ml: 'auto' }}
          >
            Cadastrar Território
          </Button>

          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={ordenacao}
              label="Ordenar por"
              onChange={handleOrdenacaoChange}
            >
              <MenuItem value="datafim_desc">Trabalhado Recente</MenuItem>
              <MenuItem value="datafim_asc">Mais tempo sem trabalhar</MenuItem>
              <MenuItem value="numero_desc">Decrescente</MenuItem>
              <MenuItem value="numero_asc">Crescente</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Lista de projetos em layout vertical */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {projetosOrdenados.map((projeto) => (
          <Card 
            key={projeto.id}
            elevation={1}
            sx={{ 
              width: '100%',
              display: 'flex',
              flexDirection: {
                xs: 'column',
                sm: 'row',
              },
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)'
              }
            }}
          >
            {/* Imagem */}
            <Box 
              sx={{ 
                height: { xs: 200, sm: 150 },
                width: { xs: '100%', sm: 150 },
                flexShrink: 0 
              }}
            >
              {projeto.img ? (
                <Box 
                  sx={{ 
                    position: 'relative', 
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                  onClick={() => setImagemExpandida(projeto.img!)}
                >
                  <Image
                    src={projeto.img}
                    alt={`Território ${projeto.numero}`}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.7)',
                      }
                    }}
                    size="small"
                  >
                    <ExpandIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.100'
                  }}
                >
                  <ImageIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                </Box>
              )}
            </Box>

            {/* Conteúdo do card */}
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h3" fontWeight="bold">
                    <NumbersIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                    Território Nº{projeto.numero}
                  </Typography>
                  <Chip 
                    label={getStatusText(projeto.concluido)}
                    color={getStatusColor(projeto.concluido)}
                    size="small"
                  />
                </Box>
                
                {/* Descrição (opcional) */}
                {projeto.descricao ? (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {projeto.descricao}
                  </Typography>
                ) : (
                  <Typography 
                    variant="body2" 
                    color="text.disabled" 
                    sx={{ mb: 2, fontStyle: 'italic' }}
                  >
                    Sem descrição
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {projeto.responsavel}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Início: {formatarData(projeto.datainicio)}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography 
                      variant="body2" 
                      color={projeto.datafim ? 'text.secondary' : 'text.disabled'}
                    >
                      Fim: {formatarData(projeto.datafim)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>

              {/* Ações do card */}
              <CardActions sx={{ p: { xs: 1, sm: 2 }, pt: { xs: 0, sm: 0 }, gap: 1, justifyContent: 'flex-end' }}>
                <Button 
                  startIcon={<EditIcon />} 
                  size="small" 
                  color="primary"
                  onClick={() => abrirEdicao(projeto)}
                  title="Editar território"
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  <Typography variant="body2" color="primary">Abrir</Typography>
                </Button>

                <IconButton 
                  size="small" 
                  color="primary"
                  onClick={() => abrirEdicao(projeto)}
                  title="Editar território"
                  sx={{ display: { xs: 'flex', sm: 'none' } }}
                >
                  <EditIcon />
                </IconButton>
                
                <Divider orientation="vertical" flexItem />

                <Button 
                  startIcon={<CheckCircleIcon />} 
                  size="small" 
                  color="success"
                  onClick={() => setProjetoConcluindo(projeto)}
                  disabled={projeto.concluido}
                  title="Concluir território"
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  <Typography variant="body2" color="success.main">Concluir</Typography>
                </Button>
                
                <IconButton 
                  size="small" 
                  color="success"
                  onClick={() => setProjetoConcluindo(projeto)}
                  disabled={projeto.concluido}
                  title="Concluir território"
                  sx={{ display: { xs: 'flex', sm: 'none' } }}
                >
                  <CheckCircleIcon />
                </IconButton>

                <Divider orientation="vertical" flexItem />

                <Button 
                  startIcon={<DeleteIcon />} 
                  size="small" 
                  color="error"
                  onClick={() => setProjetoExcluindo(projeto)}
                  title="Excluir território"
                  sx={{ display: { xs: 'none', sm: 'flex' } }}
                >
                  <Typography variant="body2" color="error.main">Excluir</Typography>
                </Button>
                
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => setProjetoExcluindo(projeto)}
                  title="Excluir território"
                  sx={{ display: { xs: 'flex', sm: 'none' } }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Box>
          </Card>
        ))}
      </Box>

      {projetos.length === 0 && !loading && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum território cadastrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Clique em Cadastrar Território para adicionar o primeiro território.
          </Typography>
        </Paper>
      )}

      {/* Modal para cadastrar novo território */}
      <Dialog 
        open={dialogCadastroAberto} 
        onClose={fecharCadastro} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle> 
          <Box display="flex" alignItems="center" gap={1}>
            <AddIcon />
            Cadastrar Novo Território
          </Box>
        </DialogTitle>
        <DialogContent sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {isClient && <Territorios onProjetoCadastrado={handleTerritorioCadastrado} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharCadastro} color="primary">
            <CancelIcon sx={{ mr: 1 }} />
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para editar projeto */}
      <Dialog open={!!projetoEditando} onClose={() => setProjetoEditando(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <EditIcon />
            Editar Território Nº{projetoEditando?.numero}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Responsável"
              value={editandoResponsavel}
              onChange={(e) => setEditandoResponsavel(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <TextField
              label="Data de Início"
              type="date"
              value={editandoDataInicio}
              onChange={(e) => setEditandoDataInicio(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjetoEditando(null)} disabled={salvando}>
            <CancelIcon sx={{ mr: 1 }} />
            Cancelar
          </Button>
          <Button 
            onClick={salvarEdicao} 
            variant="contained" 
            disabled={salvando || !editandoResponsavel || !editandoDataInicio}
          >
            {salvando ? <CircularProgress size={20} /> : <SaveIcon sx={{ mr: 1 }} />}
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para confirmar exclusão */}
      <Dialog open={!!projetoExcluindo} onClose={() => setProjetoExcluindo(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Deseja realmente excluir o território Nº{projetoExcluindo?.numero}?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjetoExcluindo(null)} disabled={salvando}>
            <CancelIcon sx={{ mr: 1 }} />
            Cancelar
          </Button>
          <Button 
            onClick={confirmarExclusao} 
            variant="contained" 
            color="error"
            disabled={salvando}
          >
            {salvando ? <CircularProgress size={20} /> : <DeleteIcon sx={{ mr: 1 }} />}
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para concluir projeto */}
      <Dialog open={!!projetoConcluindo} onClose={() => setProjetoConcluindo(null)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <CheckCircleIcon />
            Concluir Território Nº{projetoConcluindo?.numero}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Data de Conclusão"
              type="date"
              value={dataConclusao}
              onChange={(e) => setDataConclusao(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Ao concluir, o território será marcado como Finalizado
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProjetoConcluindo(null)} disabled={salvando}>
            <CancelIcon sx={{ mr: 1 }} />
            Cancelar
          </Button>
          <Button 
            onClick={concluirProjeto} 
            variant="contained" 
            color="success"
            disabled={salvando || !dataConclusao}
          >
            {salvando ? <CircularProgress size={20} /> : <CheckCircleIcon sx={{ mr: 1 }} />}
            Concluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para imagem expandida */}
      <Dialog
        open={!!imagemExpandida}
        onClose={() => setImagemExpandida(null)}
        maxWidth="lg"
        fullWidth
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 1,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)',
              }
            }}
            onClick={() => setImagemExpandida(null)}
          >
            <CloseIcon />
          </IconButton>
          
          {imagemExpandida && (
            <Image
              src={imagemExpandida}
              alt="Imagem expandida"
              width={800}
              height={600}
              style={{ 
                width: '100%', 
                height: 'auto',
                display: 'block'
              }}
            />
          )}
        </Box>
      </Dialog>
    </Box>
  );
}