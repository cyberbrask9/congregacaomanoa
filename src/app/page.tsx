'use client';
import MenuGaveta from './components/MenuGaveta';
import { Objeto } from '@/types';
//

import { useState, useEffect } from 'react';
import { Container, Box, Typography, CircularProgress } from '@mui/material';
import { projetoService } from '@/services/api';
import { Projeto } from '@/types/projeto';
import Territorios from './components/Territorios';
import TerritorioLista from './components/TerritorioLista';

export default function Home() {
  const [, setObjetos] = useState<Objeto[]>([]);

  const handleObjetoCriado = (novoObjeto: Objeto) => {
    setObjetos(prev => [...prev, novoObjeto]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <MenuGaveta />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4">
       {/*  <FormularioObjeto onObjetoCriado={handleObjetoCriado} /> */}
         <div className="mt-12"> 
          {/* <ListaObjetos /> */}
       </div>
      </main>
    </div>
  );
}
