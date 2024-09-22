// src/pages/EditorDiagrama.js
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import createEngine, { DiagramModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import socket from '../socket';
import { ClassNodeFactory } from '../nodes/ClassNodeFactory';
import ClassNodeModel from '../nodes/ClassNodeModel';

const EditorDiagrama = () => {
  const { id } = useParams(); // Obtener el ID del diagrama desde la URL
  const engineRef = useRef(null); // Usar useRef para mantener la referencia del engine
  const [model, setModel] = useState(null); // Inicializar con null para verificar más adelante
  const [titulo, setTitulo] = useState('');
  const [loading, setLoading] = useState(true); // Estado de carga

  if (!engineRef.current) {
    engineRef.current = createEngine();
    engineRef.current.getNodeFactories().registerFactory(new ClassNodeFactory());
  }
  const engine = engineRef.current;

  useEffect(() => {
    // Cargar el diagrama desde la base de datos
    const cargarDiagrama = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3001/api/diagramas/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const { titulo, contenido } = response.data;
        setTitulo(titulo);

        // Inicializar el modelo del diagrama
        const newModel = new DiagramModel();
        if (contenido) {
          try {
            newModel.deserializeModel(contenido, engine);
          } catch (error) {
            console.error('Error deserializando el modelo:', error);
          }
        }
        engine.setModel(newModel);
        setModel(newModel); // Actualizar el estado del modelo
        setLoading(false); // Desactivar el estado de carga
      } catch (error) {
        console.error('Error al cargar el diagrama:', error);
        setLoading(false); // Desactivar el estado de carga aunque haya error
      }
    };

    cargarDiagrama();

    // Escuchar actualizaciones del diagrama desde el servidor
    socket.connect();
    socket.emit('join-room', id);

    socket.on('diagram-updated', (diagram) => {
      const newModel = new DiagramModel();
      try {
        newModel.deserializeModel(diagram, engine);
        engine.setModel(newModel);
        setModel(newModel);
      } catch (error) {
        console.error('Error deserializando el modelo actualizado:', error);
      }
    });

    return () => {
      socket.disconnect(); // Desconectar cuando el componente se desmonte
    };
  }, [id, engine]);

  const agregarClase = () => {
    if (!(model instanceof DiagramModel)) {
      console.error('El modelo no es una instancia de DiagramModel');
      return;
    }

    // Crear un nuevo nodo
    const node = new ClassNodeModel({
      name: 'Nueva Clase',
      color: 'rgb(0,192,255)'
    });

    node.setPosition(100, 100);
    model.addNode(node);
    engine.setModel(model); // Actualizar el modelo en el engine
    engine.repaintCanvas(); // Repaint del canvas

    // Emitir la actualización al servidor
    socket.emit('update-diagram', { roomId: id, diagram: model.serialize() });

    setModel({ ...model }); // Forzar la actualización del estado del modelo
  };

  const guardarDiagrama = async () => {
    if (!(model instanceof DiagramModel)) {
      console.error('El modelo no es una instancia de DiagramModel');
      return;
    }

    const contenidoActual = model.serialize();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/diagramas/${id}`, { titulo, contenido: contenidoActual }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Diagrama guardado con éxito');
    } catch (error) {
      console.error('Error al guardar el diagrama:', error);
    }
  };

  // Mostrar un mensaje de carga mientras se inicializa el modelo
  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>{titulo}</h2>
      <button onClick={agregarClase}>Agregar Clase</button>
      <button onClick={guardarDiagrama}>Guardar Diagrama</button>
      <div style={{ height: '500px', backgroundColor: '#f0f0f0' }}>
        <CanvasWidget engine={engine} />
      </div>
    </div>
  );
};

export default EditorDiagrama;
