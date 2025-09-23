'use client';
import MenuGaveta from './components/MenuGaveta';
import { Objeto } from '@/types';
//
import { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import { projetoService } from '@/services/api';
import { Projeto } from '@/types/projeto';
import TerritorioLista from './components/TerritorioLista';
import Territorios from './components/Territorios';

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregarProjetos = async () => {
    try {
      setError('');
      const projetosData = await projetoService.listarProjetos();
      setProjetos(projetosData);
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProjetos();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography 
        variant="h3" 
        component="h1" 
        gutterBottom 
        fontWeight="bold"
        color="primary"
      >
        Gerenciamento de Projetos
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Territorios onProjetoCadastrado={carregarProjetos} />
      </Box>

      <TerritorioLista 
        projetos={projetos} 
        loading={loading}
        error={error}
      />
    </Container>
  );
}