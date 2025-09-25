'use client';

import { useState, useEffect } from 'react';
import { projetoService } from '@/services/api';
import { Projeto } from '@/types/projeto';
import TerritorioLista from './TerritorioLista';
import Territorios from './Territorios';

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarProjetos = async () => {
    try {
      const projetosData = await projetoService.listarProjetos();
      setProjetos(projetosData);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarProjetos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Carregando...</div>
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