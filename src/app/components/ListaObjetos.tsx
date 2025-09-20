'use client';

import React, { useState, useEffect } from 'react';
import { objetoService } from '@/services/api';
import { Objeto } from '@/types';
import EditarObjetoModal from './EditarObjetoModal';
import Image from 'next/image';


const ListaObjetos: React.FC = () => {
  const [objetos, setObjetos] = useState<Objeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const [showConfirmacao, setShowConfirmacao] = useState(false);
  const [objetoParaExcluir, setObjetoParaExcluir] = useState<Objeto | null>(null);
  const [objetoParaEditar, setObjetoParaEditar] = useState<Objeto | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);

  useEffect(() => {
    carregarObjetos();
  }, []);

  const carregarObjetos = async () => {
    try {
      setLoading(true);
      const data = await objetoService.listarObjetos();
      setObjetos(data);
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const abrirEdicao = (objeto: Objeto) => {
    setObjetoParaEditar(objeto);
    setModalEditarAberto(true);
  };

  const fecharEdicao = () => {
    setModalEditarAberto(false);
    setObjetoParaEditar(null);
  };

  const handleObjetoAtualizado = (objetoAtualizado: Objeto) => {
    setObjetos(prev => prev.map(o => 
      o.id === objetoAtualizado.id ? objetoAtualizado : o
    ));
  };
  
  const confirmarExclusao = (objeto: Objeto) => {
    setObjetoParaExcluir(objeto);
    setShowConfirmacao(true);
  };

  const cancelarExclusao = () => {
    setShowConfirmacao(false);
    setObjetoParaExcluir(null);
    setExcluindoId(null);
  };

  const executarExclusao = async () => {
    if (!objetoParaExcluir) return;

    try {
      setExcluindoId(objetoParaExcluir.id);
      await objetoService.excluirObjeto(objetoParaExcluir.id);
      
      // Atualizar a lista localmente
      setObjetos(prev => prev.filter(o => o.id !== objetoParaExcluir.id));
      
      setShowConfirmacao(false);
      setObjetoParaExcluir(null);
      
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
    } finally {
      setExcluindoId(null);
    }
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;
  if (error) return <div className="text-red-600 text-center py-8">Erro: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lista de Pessoas</h2>
      
       {/* Modal de Edição */}
      <EditarObjetoModal
        objeto={objetoParaEditar}
        isOpen={modalEditarAberto}
        onClose={fecharEdicao}
        onAtualizado={handleObjetoAtualizado}
      />
      {/* Modal de Confirmação */}
      {showConfirmacao && objetoParaExcluir && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">{`Deseja realmente excluir o objeto "${objetoParaExcluir.nome}"?`}</p>
            <div className="flex space-x-4 justify-end">
              <button
                onClick={cancelarExclusao}
                disabled={excluindoId !== null}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Não
              </button>
              <button
                onClick={executarExclusao}
                disabled={excluindoId !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {excluindoId ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {objetos.length === 0 ? (
        <p className="text-center text-gray-600 py-8">Nenhuma pessoa cadastrada ainda...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         {objetos.map(objeto => (
            <div key={objeto.id} className="bg-white border border-gray-200 rounded-lg shadow-md p-6 relative">
              {/* Botões de Ação */}
              <div className="absolute top-4 right-4 flex space-x-2">
                {/* Botão Editar (Lápis) */}
                <button
                  onClick={() => abrirEdicao(objeto)}
                  className="p-2 text-blue-500 hover:text-blue-700"
                  title="Editar objeto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>

                {/* Botão Excluir (Lixeira) */}
                <button
                  onClick={() => confirmarExclusao(objeto)}
                  disabled={excluindoId === objeto.id}
                  className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50"
                  title="Excluir objeto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <h3 className="text-xl font-semibold mb-3 text-gray-800">{objeto.nome}</h3>
              <p className="text-sm text-gray-600 mb-2"><strong>ID:</strong> {objeto.id}</p>
              <p className="text-sm text-gray-600 mb-2"><strong>Atribuição:</strong> {objeto.atribuição}</p>
              <p className="text-sm text-gray-600 mb-3"><strong>Privilégios:</strong></p>
              <ul className="list-disc list-inside text-sm text-gray-700 mb-4 pl-2">
                {objeto.privilégio.split(', ').map((priv, index) => (
                  <li key={index}>{priv}</li>
                ))}
              </ul>
              {objeto.foto ? (
                  <Image src={objeto.foto} alt={objeto.nome} width={400} height={192} className="w-full h-48 object-cover rounded-md mb-3" />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-md mb-3 flex items-center justify-center">
                    <span className="text-gray-500">Sem foto</span>
                  </div>
              )}
              <p className="text-xs text-gray-500">
                Cadastrado em: {new Date(objeto.dataCriacao).toLocaleString('pt-BR')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaObjetos;