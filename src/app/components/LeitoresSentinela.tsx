import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Container,
  Paper,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

interface LeitorData {
  id: number;
  nome: string;
  data: string;
}

export const LeitorsSentinela: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(startOfMonth(new Date()));
  const [loading, setLoading] = useState<boolean>(false);
  const [leitors, setLeitors] = useState<LeitorData[]>([]);
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    if (!selectedDate) {
      setError('Por favor, selecione um mês e ano');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const mesAno = format(selectedDate, 'yyyy-MM');
      
      const response = await fetch(`/api/leitors-sentinela?mesAno=${mesAno}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }
      
      const data = await response.json();
      setLeitors(data);
    } catch (err) {
      setError('Erro ao gerar lista. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Título */}
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              mb: 4,
              color: 'primary.main',
              fontWeight: 'bold'
            }}
          >
            Leitores A Sentinela
          </Typography>

          {/* Mensagem de erro */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Input de mês/ano - Versão Corrigida */}
          <Box sx={{ mb: 3 }}>
            <DatePicker
              views={['month', 'year']}
              label="Mês e Ano"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  helperText: "Selecione o mês e ano para a consulta"
                }
              }}
            />
          </Box>

          {/* Botão Submit */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            sx={{ py: 1.5 }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                Gerando...
              </>
            ) : (
              'Gerar Lista'
            )}
          </Button>

          {/* Lista de leitores */}
          {leitors.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Lista Gerada ({leitors.length} leitores)
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {leitors.map((leitor) => (
                  <Typography 
                    key={leitor.id} 
                    component="li" 
                    variant="body1"
                    sx={{ py: 0.5 }}
                  >
                    {leitor.nome} - {format(new Date(leitor.data), 'dd/MM/yyyy')}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default LeitorsSentinela;