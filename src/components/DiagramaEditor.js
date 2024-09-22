// src/components/DiagramaEditor.js
import React, { useState, useEffect } from 'react';
import createEngine, {
  DiagramModel,
  DefaultNodeModel,
  DefaultLinkModel
} from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';

const DiagramaEditor = ({ contenido, onSave }) => {
  const [engine] = useState(() => createEngine());
  const [model, setModel] = useState(null); // Estado para el modelo del diagrama

  useEffect(() => {
    // Inicializar el modelo del diagrama
    const newModel = new DiagramModel();
    
    if (contenido) {
      // Si existe contenido, deserializarlo en el modelo
      try {
        newModel.deserializeModel(contenido, engine);
      } catch (error) {
        console.error('Error al deserializar el modelo:', error);
      }
    }

    // Asignar el modelo al engine
    engine.setModel(newModel);
    setModel(newModel); // Actualizar el estado del modelo
  }, [contenido, engine]);

  const agregarClase = () => {
    if (!model) return; // Verificar si el modelo está inicializado
    const node = new DefaultNodeModel({
      name: 'Clase',
      color: 'rgb(0,192,255)'
    });
    node.setPosition(100, 100);
    node.addOutPort('Salida');
    model.addNode(node);
    engine.repaintCanvas();
  };

  const guardarDiagrama = () => {
    if (!model) return; // Verificar si el modelo está inicializado
    const contenidoActual = model.serialize();
    onSave(contenidoActual); // Guardar el contenido actual
  };

  // No renderizar el CanvasWidget hasta que el modelo esté listo
  if (!model) return <div>Loading...</div>;

  return (
    <div>
      <button onClick={agregarClase}>Agregar Clase</button>
      <button onClick={guardarDiagrama}>Guardar Diagrama</button>
      <CanvasWidget engine={engine} style={{ height: '500px' }} />
    </div>
  );
};

export default DiagramaEditor;
