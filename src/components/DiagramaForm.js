// src/components/DiagramaForm.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DiagramaEditor from './DiagramaEditor'; // Importar el editor de diagramas

const DiagramaForm = ({ tituloInicial, id }) => {
  const [titulo, setTitulo] = useState(tituloInicial || '');
  const [contenido, setContenido] = useState(null); // Empezar con contenido vacío

  useEffect(() => {
    if (id) {
      // Cargar contenido del diagrama existente si se proporciona un ID
      const cargarDiagrama = async () => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:3001/api/diagramas/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setTitulo(response.data.titulo);
          setContenido(response.data.contenido);
        } catch (error) {
          console.error('Error al cargar el diagrama:', error);
        }
      };
      cargarDiagrama();
    }
  }, [id]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = { titulo, contenido };

      if (id) {
        // Editar diagrama existente
        await axios.put(`http://localhost:3001/api/diagramas/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Crear un nuevo diagrama
        await axios.post('http://localhost:3001/api/diagramas', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Error al guardar el diagrama:', error);
    }
  };

  return (
    <div>
      <h2>{id ? 'Editar Diagrama' : 'Crear Nuevo Diagrama'}</h2>
      <form onSubmit={manejarSubmit}>
        <div>
          <label>Título:</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contenido del Diagrama:</label>
          <DiagramaEditor
            contenido={contenido}
            onSave={setContenido} // Guardar el contenido cuando se haga clic en guardar en el editor
          />
        </div>
        <button type="submit">{id ? 'Guardar Cambios' : 'Crear Diagrama'}</button>
      </form>
    </div>
  );
};

export default DiagramaForm;
