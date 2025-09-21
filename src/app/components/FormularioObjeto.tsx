'use client';

import React, { useState } from 'react';
import { objetoService } from '@/services/api';
import { Objeto } from '@/types';

interface FormularioObjetoProps {
  onObjetoCriado: (objeto: Objeto) => void;
  onClose: () => void;
}

const FormularioObjeto: React.FC<FormularioObjetoProps> = ({ onObjetoCriado, onClose }) => {
  const [formData, setFormData] = useState({
    nome: '',
    atribuição: '',
    privilégio: [] as string[]
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const opcoesAtribuicao = [
    { value: '', label: 'Selecione uma opção' },
    { value: 'Ancião', label: 'Ancião' },
    { value: 'Servo Ministerial', label: 'Servo Ministerial' },
    { value: 'Publicador Batizado', label: 'Publicador Batizado' }
  ];

  const opcoesPrivilegio = [
    { value: 'Presidente Vida e Ministério', label: 'Presidente Vida e Ministério' },
    { value: 'Presidente Discurso', label: 'Presidente Discurso' },
    { value: 'Tesouros da palavra de Deus', label: 'Tesouros da palavra de Deus' },
    { value: 'Joias Espirituais', label: 'Joias Espirituais' },
    { value: 'Estudo Bíblico', label: 'Estudo Bíblico' },
    { value: 'Indicador', label: 'Indicador' },
    { value: 'Leitor A Sentinela', label: 'Leitor A Sentinela' },
    { value: 'Leitor Estudo Bíblico', label: 'Leitor Estudo Bíblico' },
    { value: 'Microfone Volante', label: 'Microfone Volante' },
    { value: 'Áudio e Vídeo', label: 'Áudio e Vídeo' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      if (checked) {
        return { ...prev, privilégio: [...prev.privilégio, value] };
      } else {
        return { ...prev, privilégio: prev.privilégio.filter(priv => priv !== value) };
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
    } else {
      setFoto(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.atribuição) {
      setError('Por favor, selecione uma atribuição');
      setLoading(false);
      return;
    }

    if (formData.privilégio.length === 0) {
      setError('Por favor, selecione pelo menos um privilégio');
      setLoading(false);
      return;
    }

    /* if (!foto) {
      setError('Por favor, selecione uma foto');
      setLoading(false);
      return;
    } */
    
    try {
      const data = new FormData();
      data.append('nome', formData.nome);
      data.append('atribuição', formData.atribuição);
      data.append('privilégio', formData.privilégio.join(', '));
      if (foto) {
        data.append('foto', foto);
      }

      const response = await objetoService.criarObjeto(data);
      onObjetoCriado(response.objeto);
      
      // Reset form
      setFormData({ nome: '', atribuição: '', privilégio: [] });
      setFoto(null);
      
      // Limpar o input de arquivo
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

      // Fechar o formulário após sucesso
      onClose();

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Cadastrar Pessoas</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome:
            </label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Atribuição:
            </label>
            <select
              name="atribuição"
              value={formData.atribuição}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {opcoesAtribuicao.map(opcao => (
                <option key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Privilégios: (Selecione um ou mais)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-gray-300 rounded-md">
              {opcoesPrivilegio.map(opcao => (
                <label key={opcao.value} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="privilégio"
                    value={opcao.value}
                    checked={formData.privilégio.includes(opcao.value)}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{opcao.label}</span>
                </label>
              ))}
            </div>
            {formData.privilégio.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Selecionados: {formData.privilégio.join(', ')}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto (JPEG/PNG):
            </label>
            <input
              type="file"
              name="foto"
              onChange={handleFileChange}
              accept=".jpeg,.jpg,.png"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioObjeto;

/* import React, { useState } from 'react';
import { objetoService } from '@/services/api';
import { Objeto } from '@/types';

interface FormularioObjetoProps {
  onObjetoCriado: (objeto: Objeto) => void;
  onClose: () => void;
}

const FormularioObjeto: React.FC<FormularioObjetoProps> = ({ onObjetoCriado }) => {
  const [formData, setFormData] = useState({
    nome: '',
    atribuição: '',
    privilégio: [] as string[]
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const opcoesAtribuicao = [
    { value: '', label: 'Selecione uma opção' },
    { value: 'Ancião', label: 'Ancião' },
    { value: 'Servo Ministerial', label: 'Servo Ministerial' },
    { value: 'Publicador Batizado', label: 'Publicador Batizado' }
  ];

  const opcoesPrivilegio = [
    { value: 'Presidente Vida e Ministério', label: 'Presidente Vida e Ministério' },
    { value: 'Presidente Discurso', label: 'Presidente Discurso' },
    { value: 'Tesouros da palavra de Deus', label: 'Tesouros da palavra de Deus' },
    { value: 'Joias Espirituais', label: 'Joias Espirituais' },
    { value: 'Estudo Bíblico', label: 'Estudo Bíblico' },
    { value: 'Indicador', label: 'Indicador' },
    { value: 'Leitor A Sentinela', label: 'Leitor A Sentinela' },
    { value: 'Leitor Estudo Bíblico', label: 'Leitor Estudo Bíblico' },
    { value: 'Microfone Volante', label: 'Microfone Volante' },
    { value: 'Áudio e Vídeo', label: 'Áudio e Vídeo' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    setFormData(prev => {
      if (checked) {
        return { ...prev, privilégio: [...prev.privilégio, value] };
      } else {
        return { ...prev, privilégio: prev.privilégio.filter(priv => priv !== value) };
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0]);
    } else {
      setFoto(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.atribuição) {
      setError('Por favor, selecione uma atribuição');
      setLoading(false);
      return;
    }

    if (formData.privilégio.length === 0) {
      setError('Por favor, selecione pelo menos um privilégio');
      setLoading(false);
      return;
    }

    /* if (!foto) {
      setError('Por favor, selecione uma foto');
      setLoading(false);
      return;
    } 
    
    try {
      const data = new FormData();
      data.append('nome', formData.nome);
      data.append('atribuição', formData.atribuição);
      data.append('privilégio', formData.privilégio.join(', '));
      if (foto) {
        data.append('foto', foto);
      }

      const response = await objetoService.criarObjeto(data);
      onObjetoCriado(response.objeto);
      
      // Reset form
      setFormData({ nome: '', atribuição: '', privilégio: [] });
      setFoto(null);
      
      // Limpar o input de arquivo
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }

    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Carastrar Pessoas</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome:
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Atribuição:
          </label>
          <select
            name="atribuição"
            value={formData.atribuição}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {opcoesAtribuicao.map(opcao => (
              <option key={opcao.value} value={opcao.value}>
                {opcao.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Privilégios: (Selecione um ou mais)
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border border-gray-300 rounded-md">
            {opcoesPrivilegio.map(opcao => (
              <label key={opcao.value} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="privilégio"
                  value={opcao.value}
                  checked={formData.privilégio.includes(opcao.value)}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{opcao.label}</span>
              </label>
            ))}
          </div>
          {formData.privilégio.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              Selecionados: {formData.privilégio.join(', ')}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foto (JPEG/PNG):
          </label>
          <input
            type="file"
            name="foto"
            onChange={handleFileChange}
            accept=".jpeg,.jpg,.png"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
};

export default FormularioObjeto; */

