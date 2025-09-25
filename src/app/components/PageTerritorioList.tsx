'use client';

import { useState, useEffect, useCallback } from 'react';
import { projetoService } from '@/services/api';
import { Projeto } from '@/types/projeto';
import TerritorioLista from './TerritorioLista';


export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // useCallback para memoizar a função e evitar recriações desnecessárias
  const carregarProjetos = useCallback(async () => {
    try {
      setError(null);
      const projetosData = await projetoService.listarProjetos();
      setProjetos(projetosData);
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
      setError('Erro ao carregar projetos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregarProjetos();
  }, [carregarProjetos]); // Adicione carregarProjetos como dependência

  // Estado de loading melhorado
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <div className="text-lg text-gray-600">Carregando projetos...</div>
        </div>
      </div>
    );
  }

  // Tratamento de erro
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erro:</strong> {error}
          <button 
            onClick={carregarProjetos}
            className="ml-4 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Estado vazio
  if (projetos.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Gerenciamento de Territórios</h1>
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">Nenhum projeto encontrado.</p>
          <button 
            onClick={carregarProjetos}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gerenciamento de Territórios</h1>
      
      <div className="space-y-8">
        <TerritorioLista 
          projetos={projetos} 
          onProjetoAtualizado={carregarProjetos}
        />
      </div>
    </div>
  );
}