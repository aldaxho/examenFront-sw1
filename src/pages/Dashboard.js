// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DiagramaTituloModal from '../components/DiagramaTituloModal'; // Importar el modal
//import DiagramaForm from '../components/DiagramaForm'; // Importar el componente DiagramaForm
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
  const [diagramas, setDiagramas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [diagramaSeleccionado, setDiagramaSeleccionado] = useState(null); // ID del diagrama seleccionado
 const [tituloDiagrama, setTituloDiagrama] = useState(''); // Título del nuevo diagrama
 // const [mostrarEditor, setMostrarEditor] = useState(false); // Mostrar el editor de diagramas
  const navigate = useNavigate();

  const obtenerDiagramas = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/diagramas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Respuesta del servidor:', response.data); // Verifica qué datos se están recibiendo
      setDiagramas(response.data);
    } catch (error) {
      console.error('Error al obtener los diagramas:', error);
    }
  };

  useEffect(() => {
    obtenerDiagramas();
  }, []);
    // Función para cerrar sesión
    const cerrarSesion = () => {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      navigate('/login'); // Redirigir a la página de inicio de sesión
    };
  const crearNuevoDiagrama = () => {
    setDiagramaSeleccionado(null); // No hay diagrama seleccionado
    setTituloDiagrama(''); // Limpiar el título del diagrama
    setMostrarModal(true); // Mostrar modal para ingresar título
  };

 // Guardar el nuevo diagrama con datos vacíos
 const guardarTitulo = async (titulo) => {
  setMostrarModal(false); // Cerrar el modal
  try {
    const token = localStorage.getItem('token');
    // Crear un nuevo diagrama con contenido vacío
    const response = await axios.post('http://localhost:3001/api/diagramas', { titulo, contenido: {} }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setDiagramas([...diagramas, response.data]); // Añadir el nuevo diagrama a la lista
  } catch (error) {
    console.error('Error al crear el diagrama:', error);
  }
};

  return (
    <div>
      <h2>Bienvenido al Dashboard</h2>
      <button onClick={crearNuevoDiagrama} style={{ marginRight: '10px' }}>
        Crear Nuevo Diagrama
      </button>
      <button onClick={cerrarSesion}>
        CERRAR SESION
      </button>
      <h3>Mis Diagramas</h3>
      <ul>
        {diagramas.map((diagrama) => (
          <li key={diagrama.id}>
            <span 
              style={{ cursor: 'pointer', color: 'blue' }}
              onClick={() => navigate(`/editor-diagrama/${diagrama.id}`)} // Redirigir al editor
            >
              {diagrama.titulo}
            </span>
          </li>
        ))}
      </ul>

      {/* Modal para el título del diagrama */}
      <DiagramaTituloModal
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onSave={guardarTitulo} // Guardar el título ingresado
      />
    </div>
  );
};

export default Dashboard;
