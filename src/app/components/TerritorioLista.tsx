'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Dialog,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Expand as ExpandIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Numbers as NumbersIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import Image from 'next/image';
import { Projeto, Ordenacao } from '@/types/projeto';

interface ProjetoListProps {
  projetos: Projeto[];
  loading?: boolean;
  error?: string;
}

export default function TerritorioLista({ projetos, loading = false, error }: ProjetoListProps) {
  const [ordenacao, setOrdenacao] = useState<Ordenacao>('datafim_desc');
  const [imagemExpandida, setImagemExpandida] = useState<string | null>(null);

  // Função para ordenar projetos - tratar projetos sem datafim
  const projetosOrdenados = [...projetos].sort((a, b) => {
    switch (ordenacao) {
      case 'datafim_asc':
        // Projetos sem datafim vão para o final
        if (!a.datafim && !b.datafim) return 0;
        if (!a.datafim) return 1;
        if (!b.datafim) return -1;
        return new Date(a.datafim).getTime() - new Date(b.datafim).getTime();
      
      case 'datafim_desc':
        // Projetos sem datafim vão para o final
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
  });

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
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
      {/* Filtros de ordenação */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
          <Typography variant="h6" component="h2">
            Projetos Cadastrados
          </Typography>
          
          <Chip 
            label={`${projetos.length} projeto(s)`} 
            variant="outlined" 
            size="small" 
          />

          <FormControl sx={{ minWidth: 200, ml: 'auto' }} size="small">
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={ordenacao}
              label="Ordenar por"
              onChange={handleOrdenacaoChange}
            >
              <MenuItem value="datafim_desc">Data Fim (Mais Recente)</MenuItem>
              <MenuItem value="datafim_asc">Data Fim (Mais Antiga)</MenuItem>
              <MenuItem value="numero_desc">Número (Maior)</MenuItem>
              <MenuItem value="numero_asc">Número (Menor)</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Lista de projetos */}
      <Grid container spacing={3}>
        {projetosOrdenados.map((projeto) => (
          <Grid item xs={12} sm={6} md={4} key={projeto.id}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  elevation: 4,
                  transform: 'translateY(-4px)'
                }
              }}
            >
              {/* Imagem (opcional) */}
              {projeto.img ? (
                <Box 
                  sx={{ 
                    position: 'relative', 
                    height: 200,
                    cursor: 'pointer'
                  }}
                  onClick={() => setImagemExpandida(projeto.img!)}
                >
                  <Image
                    src={projeto.img}
                    alt={`Projeto ${projeto.numero}`}
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
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.100'
                  }}
                >
                  <ImageIcon sx={{ fontSize: 48, color: 'grey.400' }} />
                </Box>
              )}
              
              {/* Informações do projeto */}
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Typography variant="h6" component="h3" fontWeight="bold">
                    <NumbersIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                    #{projeto.numero}
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
                
                <Box sx={{ spaceY: 1 }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {projeto.responsavel}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
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
            </Card>
          </Grid>
        ))}
      </Grid>

      {projetos.length === 0 && !loading && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum projeto cadastrado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Use o formulário acima para cadastrar seu primeiro projeto.
          </Typography>
        </Paper>
      )}

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