// src/components/Diagrama.js
import React from 'react';
import ReactFlow from 'react-flow-renderer';

const elements = [
  { id: '1', data: { label: 'Clase 1' }, position: { x: 250, y: 5 } },
  { id: '2', data: { label: 'Clase 2' }, position: { x: 100, y: 100 } },
  { id: 'e1-2', source: '1', target: '2', animated: true },
];

const Diagrama = () => {
  return (
    <div style={{ height: '500px', width: '100%' }}>
      <ReactFlow elements={elements} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Diagrama;
