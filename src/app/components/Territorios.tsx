'use client';

import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  InputAdornment,
  FormControlLabel,
  Switch,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Numbers as NumbersIcon,
  CalendarToday as CalendarIcon,
  Image as ImageIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { projetoService } from '@/services/api';
import { Projeto } from '@/types/projeto';

interface ProjetoFormProps {
  onProjetoCadastrado: () => void;
}

export default function Territorios({ onProjetoCadastrado }: ProjetoFormProps) {
  const [formData, setFormData] = useState({
    numero: '',
    descricao: '',
    datainicio: '',
    datafim: '',
    responsavel: '',
    concluido: false,
    img: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setFormData(prev => ({ ...prev, img: file }));
    } else if (file) {
      setError('Tipo de arquivo não suportado. Use PNG, JPEG ou JPG.');
    }
  };

  const removeImagem = () => {
    setFormData(prev => ({ ...prev, img: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validar campos obrigatórios
      if (!formData.numero || !formData.datainicio || !formData.responsavel) {
        setError('Número, data de início e responsável são obrigatórios');
        setLoading(false);
        return;
      }

      let imgUrl = '';
      
      // Upload da imagem se existir
      if (formData.img) {
        const uploadResult = await projetoService.uploadImagem(formData.img);
        imgUrl = uploadResult.url;
      }

      // Cadastrar projeto
      const projetoData: Omit<Projeto, 'id'> = {
        numero: Number(formData.numero),
        descricao: formData.descricao || undefined, // Opcional
        datainicio: formData.datainicio,
        datafim: formData.datafim || undefined, // Opcional
        responsavel: formData.responsavel,
        concluido: formData.concluido,
        img: imgUrl || undefined, // Opcional
      };

      await projetoService.cadastrarProjeto(projetoData);
      
      // Limpar formulário
      setFormData({
        numero: '',
        descricao: '',
        datainicio: '',
        datafim: '',
        responsavel: '',
        concluido: false,
        img: null,
      });
      
      setSuccess('Projeto cadastrado com sucesso!');
      onProjetoCadastrado();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.message || 'Erro ao cadastrar projeto');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      numero: '',
      descricao: '',
      datainicio: '',
      datafim: '',
      responsavel: '',
      concluido: false,
      img: null,
    });
    setError('');
    setSuccess('');
  };

  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 1,
        color: 'primary.main'
      }}>
        <AddIcon /> Cadastrar Novo Projeto
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Número do Projeto *"
              name="numero"
              type="number"
              value={formData.numero}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NumbersIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Responsável *"
              name="responsavel"
              value={formData.responsavel}
              onChange={handleChange}
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Data de Início *"
              name="datainicio"
              type="date"
              value={formData.datainicio}
              onChange={handleChange}
              required
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Data de Término (Opcional)"
              name="datafim"
              type="date"
              value={formData.datafim}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarIcon color="action" />
                  </InputAdornment>
                ),
              }}
              helperText="Deixe em branco se não houver data de término definida"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição do Projeto (Opcional)"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              multiline
              rows={3}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon color="action" />
                  </InputAdornment>
                ),
              }}
              helperText="Descrição detalhada do projeto (opcional)"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  name="concluido"
                  checked={formData.concluido}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="Projeto Concluído"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<ImageIcon />}
              >
                Upload de Imagem (Opcional)
                <input
                  type="file"
                  hidden
                  accept=".png,.jpeg,.jpg"
                  onChange={handleFileChange}
                />
              </Button>
              
              {formData.img && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Chip 
                    label={formData.img.name}
                    onDelete={removeImagem}
                    deleteIcon={<DeleteIcon />}
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    ({Math.round(formData.img.size / 1024)} KB)
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Typography variant="caption" display="block" color="text.secondary">
              Formatos suportados: PNG, JPEG, JPG (opcional)
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar Projeto'}
          </Button>
          
          <Button
            type="button"
            variant="outlined"
            size="large"
            onClick={resetForm}
            disabled={loading}
          >
            Limpar
          </Button>
        </Box>

        <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
          * Campos obrigatórios
        </Typography>
      </Box>
    </Paper>
  );
}