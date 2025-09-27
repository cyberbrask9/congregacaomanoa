'use client';

import React, { useState, useEffect } from 'react';
import { Objeto } from '@/types';

interface LeitorListSentinela {
  id: number;
  idlistsentina: string;
  nomemes: string;
  dataleitorsentinela: string[];
  leitoriosparte: Objeto[];
  dataCriacao: Date;
}

const LeitoresSentinela: React.FC = () => {
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [listasExistentes, setListasExistentes] = useState<LeitorListSentinela[]>([]);

  // Carregar listas existentes ao montar o componente
  useEffect(() => {
    carregarListasExistentes();
  }, []);

  const carregarListasExistentes = async () => {
    try {
      const response = await fetch('/api/leitor-sentinela');
      if (response.ok) {
        const listas = await response.json();
        setListasExistentes(listas);
      }
    } catch (error) {
      console.error('Erro ao carregar listas:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/leitor-sentinela', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mes, ano }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar leitores');
      }

      setSuccess('Lista de leitores criada com sucesso!');
      // Recarregar listas existentes
      await carregarListasExistentes();
      
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Gerenciar Leitores da Sentinela
      </h1>

      {/* Formulário para criar nova lista */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Criar Nova Lista de Leitores
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mês:
              </label>
              <select
                value={mes}
                onChange={(e) => setMes(Number(e.target.value))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((mesNum) => (
                  <option key={mesNum} value={mesNum}>
                    {new Date(2000, mesNum - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ano:
              </label>
              <input
                type="number"
                value={ano}
                onChange={(e) => setAno(Number(e.target.value))}
                min="2000"
                max="2100"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Processando...' : 'Criar Lista de Leitores'}
          </button>
        </form>
      </div>

      {/* Lista de listas existentes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Listas de Leitores Existentes
        </h2>

        {listasExistentes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            Nenhuma lista de leitores criada ainda.
          </p>
        ) : (
          <div className="space-y-4">
            {listasExistentes.map((lista) => (
              <div key={lista.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium text-gray-800">
                    {lista.nomemes}
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    ID: {lista.idlistsentina}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Domingos do mês:</strong>
                    <ul className="mt-1 space-y-1">
                      {lista.dataleitorsentinela.map((data, index) => (
                        <li key={index} className="text-gray-600">
                          {formatarData(data)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <strong>Leitores disponíveis ({lista.leitoriosparte.length}):</strong>
                    <ul className="mt-1 space-y-1">
                      {lista.leitoriosparte.map((leitor, index) => (
                        <li key={index} className="text-gray-600">
                          {leitor.nome}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  Criado em: {new Date(lista.dataCriacao).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeitoresSentinela;