'use client';

import React, { useState, useEffect } from 'react';
import { Objeto } from '@/types';
import Image from 'next/image';

interface EditarObjetoModalProps {
  objeto: Objeto | null;
  isOpen: boolean;
  onClose: () => void;
  onAtualizado: (objeto: Objeto) => void;
}

const EditarObjetoModal: React.FC<EditarObjetoModalProps> = ({
  objeto,
  isOpen,
  onClose,
  onAtualizado
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    atribuição: '',
    privilégio: [] as string[]
  });
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setShowConfirmacao] = useState(false);

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

  // Preencher formulário quando o objeto for aberto
  useEffect(() => {
    if (objeto) {
      setFormData({
        nome: objeto.nome,
        atribuição: objeto.atribuição,
        privilégio: objeto.privilégio.split(', ')
      });
      setFotoPreview(objeto.foto || '');
    }
  }, [objeto]);

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
      const file = e.target.files[0];
      setFoto(file);
      
      // Criar preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setFotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFoto(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmacao(true);
  };

  const confirmarAtualizacao = async () => {
    if (!objeto) return;

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('id', objeto.id.toString());
      data.append('nome', formData.nome);
      data.append('atribuição', formData.atribuição);
      data.append('privilégio', formData.privilégio.join(', '));
      
      if (foto) {
        data.append('foto', foto);
      }

      const response = await fetch('/api/objetos', {
        method: 'PUT',
        body: data,
      });
        
      if (!response.ok) {
        throw new Error('Erro ao atualizar objeto');
      }

      const resultado = await response.json();
      onAtualizado(resultado.objeto);
      setShowConfirmacao(false);
      onClose();

    } catch (err: unknown) {
  const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
  setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* const cancelarAtualizacao = () => {
    setShowConfirmacao(false);
  };
 */
  if (!isOpen || !objeto) return null;

  return (
    <>
      {/* Modal Principal de Edição */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Editar Objeto</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
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
                Foto (JPEG/PNG - Opcional):
              </label>
              <input
                type="file"
                name="foto"
                onChange={handleFileChange}
                accept=".jpeg,.jpg,.png"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              {fotoPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                 <Image 
                    src={fotoPreview} 
                    alt="Preview" 
                    width={128}
                    height={128}
                    className="object-cover rounded-md border"
                    />
                </div>
              )}
            </div>

            <div className="flex space-x-4 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAtualizacao}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Salvando Alterações...' : 'Sim, Alterar'}
                
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditarObjetoModal;