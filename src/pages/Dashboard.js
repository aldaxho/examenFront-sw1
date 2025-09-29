import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import DiagramaTituloModal from '../components/DiagramaTituloModal'; // Importar el modal
import { Plus, LogOut, UserPlus, FolderOpen, FileText, Calendar, User, Trash2 } from 'lucide-react';
import API_CONFIG from '../services/apiConfig';

// Estilos usando styled-components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
  padding: 40px 20px;
  max-width: 1400px;
  margin: 0 auto;
  color: #fff;
  position: relative;
  overflow-x: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  box-sizing: border-box;
  width: 100%;
  
  @media (min-width: 768px) {
    padding: 60px 40px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 15px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(120, 119, 198, 0.02) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Overlay = styled.div`
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(8px);
  padding: 40px 30px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  width: 100%;
  position: relative;
  z-index: 1;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  overflow: visible;
  box-sizing: border-box;
  
  @media (min-width: 768px) {
    padding: 50px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 15px;
    border-radius: 16px;
  }
`;

const Title = styled.h2`
  font-size: 3.5rem;
  margin-bottom: 40px;
  background: linear-gradient(135deg, #ffffff 0%, #a8a8ff 50%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 800;
  text-align: center;
  letter-spacing: -0.03em;
  position: relative;
  font-family: 'Inter', sans-serif;
  word-break: break-word;
  
  @media (max-width: 1024px) {
    font-size: 2.8rem;
    margin-bottom: 35px;
  }
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
    margin-bottom: 30px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
    margin-bottom: 25px;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
    
    @media (max-width: 480px) {
      width: 60px;
      height: 3px;
      bottom: -8px;
    }
  }
`;

const ButtonGroup = styled.div`
  margin-bottom: 40px;
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 16px;
    margin-bottom: 30px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-bottom: 25px;
  }
`;

const Button = styled.button`
  padding: 18px 36px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.01em;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 
      0 12px 35px rgba(102, 126, 234, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const DangerButton = styled(Button)`
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 
    0 8px 25px rgba(239, 68, 68, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);

  &:hover {
    box-shadow: 
      0 12px 35px rgba(239, 68, 68, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
`;

const DiagramList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 40px 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin: 30px 0;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
    margin: 20px 0;
  }
`;

const DiagramItem = styled.li`
  background: rgba(255, 255, 255, 0.06);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.4s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  min-height: 140px;
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 16px;
    min-height: 120px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px;
    min-height: 100px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-6px);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    
    &::before {
      transform: scaleX(1);
    }
    
    @media (max-width: 768px) {
      transform: translateY(-3px);
      box-shadow: 
        0 10px 20px rgba(0, 0, 0, 0.25),
        0 0 0 1px rgba(255, 255, 255, 0.1);
    }
  }
`;

const DiagramHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const DiagramIcon = styled.div`
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  color: white;
  font-size: 16px;
`;

const DiagramTitle = styled.h3`
  color: #fff;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.01em;
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const DiagramMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

const InlineActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 12px;
`;

const SmallDangerButton = styled(DangerButton)`
  padding: 10px 14px;
  font-size: 0.9rem;
  border-radius: 10px;
`;

const DiagramInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 500;
`;

const InvitationInput = styled.input`
  padding: 18px 24px;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  margin-bottom: 20px;
  color: #fff;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  box-sizing: border-box;
  
  @media (max-width: 768px) {
    max-width: 100%;
    padding: 16px 20px;
    font-size: 1rem;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 14px 16px;
    font-size: 0.95rem;
    margin-bottom: 12px;
  }

  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 0 0 4px rgba(102, 126, 234, 0.1),
      0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
  }
`;

const InvitationButton = styled(Button)`
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  box-shadow: 
    0 8px 25px rgba(16, 185, 129, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);

  &:hover {
    box-shadow: 
      0 12px 35px rgba(16, 185, 129, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
`;

const SectionTitle = styled.h3`
  font-size: 2.2rem;
  color: #fff;
  margin: 50px 0 30px;
  font-weight: 700;
  display: flex;
  align-items: center;
  position: relative;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.02em;
  
  &::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 36px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin-right: 20px;
    border-radius: 3px;
    box-shadow: 0 0 12px rgba(102, 126, 234, 0.4);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 26px;
    width: 50px;
    height: 2px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 1px;
  }
`;

const EmptyMessage = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  text-align: center;
  padding: 32px 20px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 16px;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  box-sizing: border-box;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    padding: 28px 16px;
    gap: 10px;
    flex-direction: column;
    text-align: center;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    padding: 24px 12px;
    gap: 8px;
    border-radius: 12px;
  }
`;

const Dashboard = () => {
  const [diagramas, setDiagramas] = useState([]); // Diagramas propios
  const [mostrarModal, setMostrarModal] = useState(false);
  const [codigoInvitacion, setCodigoInvitacion] = useState(''); // Input para unirse
  const [diagramasInvitados, setDiagramasInvitados] = useState([]); // Diagramas donde soy invitado
  const [cargandoPropios, setCargandoPropios] = useState(false);
  const [cargandoInvitados, setCargandoInvitados] = useState(false);
  const [errorPropios, setErrorPropios] = useState(null);
  const [errorInvitados, setErrorInvitados] = useState(null);
  const [mensajeAceptacion, setMensajeAceptacion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  const obtenerDiagramas = async () => {
    setCargandoPropios(true);
    setErrorPropios(null);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setErrorPropios('No hay token de autenticación.');
        return;
      }
      const response = await axios.get(API_CONFIG.getUrl('/api/diagramas'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiagramas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al obtener los diagramas:', error);
      setErrorPropios('No se pudieron cargar tus diagramas.');
    } finally {
      setCargandoPropios(false);
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
      const response = await axios.post(API_CONFIG.getUrl('/api/diagramas'), { titulo, contenido: {} }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiagramas((prevDiagramas) => [...prevDiagramas, response.data]);
    } catch (error) {
      console.error('Error al crear el diagrama:', error);
    }
  };

  const solicitarEliminacion = (diagrama) => {
    setDeleteTarget(diagrama);
    setShowDeleteConfirm(true);
  };

  const confirmarEliminacion = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        throw new Error('Sesión no válida. Inicia sesión nuevamente.');
      }
      await axios.delete(API_CONFIG.getUrl(`/api/diagramas/${deleteTarget.id}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiagramas((prev) => prev.filter((d) => String(d.id) !== String(deleteTarget.id)));
      setShowDeleteConfirm(false);
      setShowDeleteSuccess(true);
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error al eliminar el diagrama:', error);
      const msg = error?.response?.data?.message || error?.message || 'No se pudo eliminar el diagrama.';
      // Mostrar error en un modal simple
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      window.setTimeout(() => alert(msg), 0);
    } finally {
      setDeleting(false);
    }
  };

  const cancelarEliminacion = () => {
    setShowDeleteConfirm(false);
    setDeleteTarget(null);
  };

  const obtenerDiagramasInvitado = async () => {
    setCargandoInvitados(true);
    setErrorInvitados(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorInvitados('No hay token para cargar diagramas invitados.');
        return;
      }
      const response = await axios.get(API_CONFIG.getUrl('/api/invitations/invitados'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDiagramasInvitados(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error al obtener los diagramas donde eres invitado:', error);
      setErrorInvitados('No se pudieron cargar los diagramas invitados.');
    } finally {
      setCargandoInvitados(false);
    }
  };

  useEffect(() => {
    obtenerDiagramasInvitado();
  }, []);

  const aceptarInvitacion = async () => {
    setMensajeAceptacion(null);
    const codigoLimpio = (codigoInvitacion || '').trim();
    if (!codigoLimpio) {
      setMensajeAceptacion({ tipo: 'error', texto: 'Ingresa un código primero.' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMensajeAceptacion({ tipo: 'error', texto: 'Sesión no válida.' });
        return;
      }
      
      // Primero validar el código según documentación del backend
      console.log('Validando código de invitación:', codigoLimpio);
      const validationResponse = await axios.get(
        API_CONFIG.getUrl(`/api/invitations/code/${codigoLimpio}`),
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const validationData = validationResponse.data;
      console.log('Datos de validación:', validationData);
      
      if (!validationData.valido) {
        setMensajeAceptacion({ 
          tipo: 'error', 
          texto: 'El código de invitación no es válido o ha expirado.' 
        });
        return;
      }
      
      if (validationData.yaMiembro) {
        setMensajeAceptacion({ 
          tipo: 'error', 
          texto: 'Ya eres miembro de este diagrama.' 
        });
        return;
      }
      
      if (validationData.esPropietario) {
        setMensajeAceptacion({ 
          tipo: 'error', 
          texto: 'Eres el propietario de este diagrama.' 
        });
        return;
      }
      
      // Si la validación es exitosa, proceder a aceptar la invitación
      console.log('Código válido, aceptando invitación...');
      const response = await axios.post(
        API_CONFIG.getUrl('/api/invitations/accept'),
        { codigoInvitacion: codigoLimpio },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.status >= 200 && response.status < 300) {
        setMensajeAceptacion({ 
          tipo: 'ok', 
          texto: `Te uniste correctamente como ${validationData.permiso}. Actualizando listas...` 
        });
        setCodigoInvitacion('');
        obtenerDiagramasInvitado();
      } else {
        setMensajeAceptacion({
          tipo: 'error',
          texto: 'No se pudo aceptar la invitación.'
        });
      }
    } catch (error) {
      console.error('Error inesperado al aceptar la invitación:', error);
      const msg = error?.response?.data?.message || error?.response?.data?.error || 'Fallo inesperado.';
      setMensajeAceptacion({ tipo: 'error', texto: msg });
    }
  };

  return (
    <Container>
      <Overlay>
        <Title>Bienvenido al Dashboard</Title>
        <ButtonGroup>
          <Button onClick={crearNuevoDiagrama}>
            <Plus size={18} style={{ marginRight: '10px' }} />
            Crear Nuevo Diagrama
          </Button>
          <DangerButton onClick={cerrarSesion}>
            <LogOut size={18} style={{ marginRight: '10px' }} />
            Cerrar Sesión
          </DangerButton>
        </ButtonGroup>
        
  <SectionTitle>Mis Diagramas</SectionTitle>
  {cargandoPropios && <p>Cargando...</p>}
  {errorPropios && <p style={{ color: '#f87171' }}>{errorPropios}</p>}
        <DiagramList>
          {diagramas.map((diagrama) => (
            <DiagramItem key={diagrama.id} onClick={() => navigate(`/editor-diagrama/${diagrama.id}`)}>
              <DiagramHeader>
                <DiagramIcon>
                  <FileText size={18} />
                </DiagramIcon>
                <DiagramTitle>{diagrama.titulo}</DiagramTitle>
              </DiagramHeader>
              <DiagramMeta>
                <DiagramInfo>
                  <Calendar size={14} />
                  Creado: {new Date(diagrama.createdAt || Date.now()).toLocaleDateString()}
                </DiagramInfo>
                <DiagramInfo>
                  <FileText size={14} />
                  Diagrama UML
                </DiagramInfo>
              </DiagramMeta>
              <InlineActions>
                <SmallDangerButton
                  onClick={(e) => {
                    e.stopPropagation();
                    solicitarEliminacion(diagrama);
                  }}
                >
                  <Trash2 size={16} style={{ marginRight: '8px' }} />
                  Eliminar
                </SmallDangerButton>
              </InlineActions>
            </DiagramItem>
          ))}
        </DiagramList>

  <SectionTitle>Diagramas Donde Soy Invitado</SectionTitle>
  {cargandoInvitados && <p>Cargando...</p>}
  {errorInvitados && <p style={{ color: '#f87171' }}>{errorInvitados}</p>}
  {diagramasInvitados.length > 0 ? (
          <DiagramList>
            {diagramasInvitados.map((diagrama) => (
              <DiagramItem key={diagrama.id} onClick={() => navigate(`/editor-diagrama/${diagrama.id}`)}>
                <DiagramHeader>
                  <DiagramIcon>
                    <User size={18} />
                  </DiagramIcon>
                  <DiagramTitle>{diagrama.titulo}</DiagramTitle>
                </DiagramHeader>
                <DiagramMeta>
                  <DiagramInfo>
                    <User size={14} />
                    Propietario: {diagrama.propietarioNombre}
                  </DiagramInfo>
                  <DiagramInfo>
                    <Calendar size={14} />
                    Invitado: {new Date(diagrama.createdAt || Date.now()).toLocaleDateString()}
                  </DiagramInfo>
                </DiagramMeta>
              </DiagramItem>
            ))}
          </DiagramList>
        ) : (
          <EmptyMessage>
            <FolderOpen size={16} style={{ marginRight: '10px' }} />
            No tienes diagramas donde estás invitado.
          </EmptyMessage>
        )}

        <SectionTitle>Unirse a un Diagrama</SectionTitle>
        <InvitationInput
          type="text"
          placeholder="Ingrese el código de invitación"
          value={codigoInvitacion}
          onChange={(e) => setCodigoInvitacion(e.target.value)}
        />
        <InvitationButton onClick={aceptarInvitacion}>
          <UserPlus size={18} style={{ marginRight: '10px' }} />
          Unirse al Diagrama
        </InvitationButton>
        {mensajeAceptacion && (
          <p style={{
            marginTop: '10px',
            color: mensajeAceptacion.tipo === 'ok' ? '#10B981' : '#F87171',
            fontSize: '0.9rem'
          }}>
            {mensajeAceptacion.texto}
          </p>
        )}
        <DiagramaTituloModal
          isOpen={mostrarModal}
          onClose={() => setMostrarModal(false)}
          onSave={guardarTitulo}
        />

      {/* Modal confirmar eliminación */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
        }} onClick={cancelarEliminacion}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: '#0f172a', color: 'white', borderRadius: 16, padding: 24,
            width: '100%', maxWidth: 420, border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Confirmar eliminación</h3>
            <p style={{ marginTop: 0, opacity: 0.85 }}>
              ¿Seguro que deseas eliminar "{deleteTarget?.titulo}"? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={cancelarEliminacion} style={{
                padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'rgba(255,255,255,0.12)', color: 'white', fontWeight: 600
              }}>Cancelar</button>
              <button onClick={confirmarEliminacion} disabled={deleting} style={{
                padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', fontWeight: 700,
                opacity: deleting ? 0.7 : 1
              }}>{deleting ? 'Eliminando...' : 'Eliminar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal éxito eliminación */}
      {showDeleteSuccess && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
        }} onClick={() => setShowDeleteSuccess(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: '#0f172a', color: 'white', borderRadius: 16, padding: 24,
            width: '100%', maxWidth: 420, border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 12 }}>Eliminado</h3>
            <p style={{ marginTop: 0, opacity: 0.85 }}>
              El diagrama fue eliminado correctamente.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={() => setShowDeleteSuccess(false)} style={{
                padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', fontWeight: 700
              }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
      </Overlay>
    </Container>
  );
};

export default Dashboard;
