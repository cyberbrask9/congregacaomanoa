import React, { useState } from 'react';
import FormularioObjeto from './components/FormularioObjeto';
import ListaObjetos from './components/ListaObjetos';
import './globals.css';

function Index() {
  const [objetos, setObjetos] = useState([]);

  const handleObjetoCriado = (novoObjeto) => {
    setObjetos(prev => [...prev, novoObjeto]);
  };

  return (
    <div className="App">
      <header style={{ padding: '20px', backgroundColor: '#f8f9fa' }}>
        <h1>Sistema de Gerenciamento de Objetos</h1>
      </header>
      
      <main>
        <FormularioObjeto onObjetoCriado={handleObjetoCriado} />
        <ListaObjetos />
      </main>
    </div>
  );
}

export default Index;