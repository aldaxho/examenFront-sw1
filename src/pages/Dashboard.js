import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import DiagramaTituloModal from '../components/DiagramaTituloModal'; // Importar el modal

// Estilos usando styled-components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  min-height: 100vh;
  background: url('https://th.bing.com/th/id/R.29fd30f0b4d94adae7eba56d5bc7fa84?rik=faJv4yGmHRaioQ&riu=http%3a%2f%2f4.bp.blogspot.com%2f-QfQ-EewbC1U%2fUL6BNi4g--I%2fAAAAAAAAFww%2fCH5pbh6lkRs%2fs1600%2fOndas%2bsuaves%2bde%2bcolores%2babstractos.jpg') no-repeat center center fixed; 
  background-size: cover; 
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
  color: #fff; 
`;

const Overlay = styled.div`
  background-color: rgb(182 47 158 / 53%); /* Banda semi-translúcida */
  padding: 20px;
  border-radius: 8px; /* Bordes redondeados para la banda */
`;

const Title = styled.h2`
  font-size: 2.5rem;
  margin-bottom: 30px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); /* Sombra para mejorar la legibilidad */
`;

const ButtonGroup = styled.div`
  margin-bottom: 20px;
`;

const Button = styled.button`
  margin-right: 15px;
  padding: 12px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const DiagramList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 20px 0;
  width: 100%;
  max-width: 600px;
`;

const DiagramItem = styled.li`
  margin-bottom: 15px;
  display: flex;
  align-items: center;
`;

const Checkbox = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #007bff;
  background-color: white;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
`;

const DiagramLink = styled.span`
  cursor: pointer;
  color: #591717;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`;

const InvitationInput = styled.input`
  padding: 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  width: 100%;
  max-width: 400px;
  margin-bottom: 10px;
`;

const InvitationButton = styled.button`
  padding: 12px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #218838;
  }
`;

const Dashboard = () => {
  const [diagramas, setDiagramas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [codigoInvitacion, setCodigoInvitacion] = useState('');
  const [diagramasInvitados, setDiagramasInvitados] = useState([]);
  const navigate = useNavigate();

  const obtenerDiagramas = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/diagramas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiagramas(response.data);
    } catch (error) {
      console.error('Error al obtener los diagramas:', error);
    }
  };

  useEffect(() => {
    obtenerDiagramas();
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    navigate('/');
  };

  const crearNuevoDiagrama = () => {
    setMostrarModal(true);
  };

  const guardarTitulo = async (titulo) => {
    setMostrarModal(false);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3001/api/diagramas', { titulo, contenido: {} }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiagramas((prevDiagramas) => [...prevDiagramas, response.data]);
    } catch (error) {
      console.error('Error al crear el diagrama:', error);
    }
  };

  useEffect(() => {
    const obtenerDiagramasInvitado = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3001/api/invitations/invitados', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDiagramasInvitados(response.data);
      } catch (error) {
        console.error('Error al obtener los diagramas donde eres invitado:', error);
      }
    };

    obtenerDiagramasInvitado();
  }, []);

  const aceptarInvitacion = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3001/api/invitations/accept',
        { codigoInvitacion },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Te has unido al diagrama correctamente.');
    } catch (error) {
      console.error('Error al aceptar la invitación:', error);
      alert('El código de invitación es inválido o ha expirado.');
    }
  };

  return (
    <Container>
      <Overlay>
        <Title>Bienvenido al Dashboard</Title>
        <ButtonGroup>
          <Button onClick={crearNuevoDiagrama}>Crear Nuevo Diagrama</Button>
          <Button onClick={cerrarSesion}>Cerrar Sesión</Button>
        </ButtonGroup>
        <h3>Mis Diagramas</h3>
        <DiagramList>
          {diagramas.map((diagrama) => (
            <DiagramItem key={diagrama.id}>
              <Checkbox />
              <DiagramLink onClick={() => navigate(`/editor-diagrama/${diagrama.id}`)}>
                {diagrama.titulo}
              </DiagramLink>
            </DiagramItem>
          ))}
        </DiagramList>
        <h3>Diagramas Donde Soy Invitado</h3>
        {diagramasInvitados.length > 0 ? (
          <DiagramList>
            {diagramasInvitados.map((diagrama) => (
              <DiagramItem key={diagrama.id}>
                <Checkbox />
                <DiagramLink onClick={() => navigate(`/editor-diagrama/${diagrama.id}`)}>
                  {diagrama.titulo} - Propietario: {diagrama.propietarioNombre}
                </DiagramLink>
              </DiagramItem>
            ))}
          </DiagramList>
        ) : (
          <p>No tienes diagramas donde estás invitado.</p>
        )}
        <h3>Unirse a un Diagrama con Código de Invitación</h3>
        <InvitationInput
          type="text"
          placeholder="Ingrese el código de invitación"
          value={codigoInvitacion}
          onChange={(e) => setCodigoInvitacion(e.target.value)}
        />
        <InvitationButton onClick={aceptarInvitacion}>Unirse</InvitationButton>
        <DiagramaTituloModal
          isOpen={mostrarModal}
          onClose={() => setMostrarModal(false)}
          onSave={guardarTitulo}
        />
      </Overlay>
    </Container>
  );
};

export default Dashboard;
