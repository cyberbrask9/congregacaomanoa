'use client';

import { useState } from 'react';
import FormularioObjeto from './components/FormularioObjeto';
import ListaObjetos from './components/ListaObjetos';
import MenuGaveta from './components/MenuGaveta';
import { Objeto } from '@/types';

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