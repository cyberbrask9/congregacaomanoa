// components/LeitoresSentinela.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ptBR } from 'date-fns/locale';
import { leitorService } from '@/services/api';

interface LeitorProcessado {
  id: number;
  nome: string;
  leitorsentdata: string;
}

const LeitoresSentinela: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [leitores, setLeitores] = useState<LeitorProcessado[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const processarLeitores = async () => {
    if (!selectedDate) {
      setError('Selecione uma data válida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const mes = selectedDate.getMonth() + 1;
      const ano = selectedDate.getFullYear();
      
      const response = await leitorService.processarLeitores(mes, ano);
      setLeitores(response.leitores);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar leitores');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box sx={{ p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Leitores da Sentinela
          </Typography>
          
          <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <DatePicker
                views={['month', 'year']}
                label="Selecione mês e ano"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Button
                variant="contained"
                onClick={processarLeitores}
                disabled={loading || !selectedDate}
                fullWidth
                sx={{ height: '56px' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Processar Leitores'}
              </Button>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {leitores.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Resultado: {leitores.length} leitores encontrados
              </Typography>
              
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Data da Leitura</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {leitores.map((leitor) => (
                      <TableRow key={leitor.id}>
                        <TableCell>{leitor.id}</TableCell>
                        <TableCell>{leitor.nome}</TableCell>
                        <TableCell>{formatarData(leitor.leitorsentdata)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}

          {leitores.length === 0 && !loading && !error && (
            <Alert severity="info">
              Selecione um mês e ano e clique em "Processar Leitores" para ver os resultados.
            </Alert>
          )}
        </Paper>
      </Box>
    </LocalizationProvider>
  );
};

export default LeitoresSentinela;