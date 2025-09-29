// EditorDiagrama.js - Sistema manual de diagramas UML
import axios from 'axios';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AssociationRelation from '../components/AssociationRelation';
import ClassComponent from '../components/ClassComponent';
import AIAssistant from '../components/AIAssistant';
import TourGuide from '../components/TourGuide';
import io from 'socket.io-client';
import API_CONFIG from '../services/apiConfig';
import {
  EditorContainer,
  Header,
  Title,
  ToolbarContainer,
  ToolbarGroup,
  Button,
  DiagramWrapper,
  CanvasContainer,
  ZoomableCanvas,
  Modal,
  ModalContent,
  CollaborationPanel,
} from './EditorDiagrama.styles';
import { 
  Plus, 
  Link, 
  CircleDot, 
  Circle, 
  ArrowUp, 
  ArrowRightLeft, 
  Code, 
  FileDown, 
  Download, 
  FileUp, 
  Bot, 
  Settings, 
  ArrowLeft, 
  Save, 
  Edit, 
  Users, 
  Key, 
  Copy, 
  X, 
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';

// Estilos CSS para animaciones
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  @keyframes relationPulse {
    0% { stroke-width: 3; opacity: 1; }
    50% { stroke-width: 4; opacity: 0.7; }
    100% { stroke-width: 3; opacity: 1; }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

// Crear un elemento style para los estilos globales
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
};

const EditorDiagrama = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const canvasContainerRef = useRef(null);
  // Viewport visible del canvas (área recortada por CanvasContainer)
  const viewportRef = useRef(null);
  // Controla si ya se aplicó el auto-fit para evitar auto-zoom molesto
  const hasAutoFitRef = useRef(false);

  // Estados principales
  const [classes, setClasses] = useState([]);
  const [relations, setRelations] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [httpConnected, setHttpConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  // Normalizar y deduplicar usuarios por id/userId/socketId
  const normalizeUsers = useCallback((users) => {
    if (!Array.isArray(users)) return [];
    const seen = new Set();
    const result = [];
    for (const u of users) {
      // Priorizar userId; si falta, usar socketId; como último recurso, id
      const key = u?.userId || u?.socketId || u?.id || u?.email || u?.username || u?.name;
      if (!key) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(u);
    }
    return result;
  }, []);

  // Estados para UI
  const [selectedClass, setSelectedClass] = useState(null);
  const [isCreatingRelation, setIsCreatingRelation] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [relationType, setRelationType] = useState('Asociación');
  
  // Estados para navegación del canvas
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Estados para invitaciones y usuarios
  const [codigoInvitacion, setCodigoInvitacion] = useState('');
  const [usuarios, setUsuarios] = useState([]);

  // Estados para modales y exportación
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para exportación y modales
  const [jdlContent, setJdlContent] = useState(null);
  const [exportError, setExportError] = useState(null);
  const [zipDownloadUrl, setZipDownloadUrl] = useState(null);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [showBackendModal, setShowBackendModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Estado para el asistente IA - UNIFICADO
  const [chatAIVisible, setChatAIVisible] = useState(false);

  // Utilidad: sanitizar posiciones de clases (evita NaN y valores indefinidos)
  const sanitizeClassesPositions = useCallback((list) => {
    const baseX = 200;
    const baseY = 150;
    const spacingX = 380;
    const spacingY = 260;
    let idx = 0;
    return (list || []).map((cls) => {
      let x = Number(cls.x);
      let y = Number(cls.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        const row = Math.floor(idx / 4);
        const col = idx % 4;
        x = baseX + col * spacingX;
        y = baseY + row * spacingY;
        idx += 1;
      }
      return { ...cls, x, y };
    });
  }, []);

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      console.log('No hay token de autenticación, redirigiendo al login');
      navigate('/');
    }
  }, [navigate]);

  // Inicializar Socket.IO
  useEffect(() => {
    socketRef.current = io(API_CONFIG.WS_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Conectado al servidor');
      setIsConnected(true);
      socketRef.current.emit('join-room', id);
      // Compatibilidad: algunos servidores usan 'join-diagram'
      socketRef.current.emit('join-diagram', { roomId: id });
      // Solicitar lista de usuarios con callback (contrato del backend)
      socketRef.current.emit('get-online-users', id, (users) => {
        console.log('Callback get-online-users:', users);
        setOnlineUsers(normalizeUsers(users || []));
      });
      // Compatibilidad adicional (si el backend soporta otros canales)
      socketRef.current.emit('request-users', { roomId: id });
      socketRef.current.emit('who-is-online', { roomId: id });
    });

    socketRef.current.on('disconnect', () => {
      console.log('Desconectado del servidor');
      setIsConnected(false);
    });

    socketRef.current.on('user-joined', (user) => {
      console.log('Usuario conectado:', user);
      setOnlineUsers(prev => normalizeUsers([...(prev || []), user]));
    });

    socketRef.current.on('user-left', (payload) => {
      // El backend puede enviar userId o socketId o un objeto
      const leftKey = typeof payload === 'string' ? payload : (payload?.userId || payload?.socketId || payload?.id);
      console.log('Usuario desconectado:', payload);
      setOnlineUsers(prev => (prev || []).filter(user => {
        const key = user?.userId || user?.socketId || user?.id;
        return key !== leftKey;
      }));
    });

    socketRef.current.on('users-updated', (users) => {
      console.log('Usuarios en línea actualizados:', users);
      setOnlineUsers(normalizeUsers(users));
    });

    // Escuchar eventos alternativos de presencia si el backend los usa
    socketRef.current.on('presence-update', (users) => {
      console.log('Presence update:', users);
      setOnlineUsers(normalizeUsers(users || []));
    });
    socketRef.current.on('online-users', (users) => {
      console.log('Online users:', users);
      setOnlineUsers(normalizeUsers(users || []));
    });
    socketRef.current.on('room-users', (users) => {
      console.log('Room users:', users);
      setOnlineUsers(normalizeUsers(users || []));
    });
    socketRef.current.on('users-in-room', (users) => {
      console.log('Users in room:', users);
      setOnlineUsers(normalizeUsers(users || []));
    });
    socketRef.current.on('participants', (users) => {
      console.log('Participants:', users);
      setOnlineUsers(normalizeUsers(users || []));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [id]);

  // Socket event listeners - MEJORADO
  useEffect(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;
    
    // Limpiar listeners anteriores
    socket.removeAllListeners();
    
    // Re-emitir join-room
    socket.emit('join-room', id);
    // actualizaciones del agente 
    socket.on('agent-update', (data) => {
      console.log('Actualizacion recibida del agente IA', data);

      if (data.type === 'diagram_modified' && data.updatedDiagram) {
        const { classes: newClasses, relations: newRelations, titulo: newTitulo } = data.updatedDiagram;
        if (newClasses) setClasses(newClasses);
        if (newRelations) setRelations(newRelations);
        if (newTitulo) setTitulo(newTitulo);

        window.dispatchEvent(new CustomEvent('agent-update', { detail: data}));
      }
    });

    // Listener para aplicar patches de IA directamente
    const handleAIPatchApply = (event) => {
      const { patch } = event.detail;
      console.log('Procesando patch de IA:', patch);
      console.log('Tipo del patch:', typeof patch);
      console.log('Es array?', Array.isArray(patch));
      
      // Verificar si es un patch de operaciones o datos directos
      if (patch.classes && patch.relations) {
        // Es la estructura directa de datos (como la de tu base de datos)
        console.log('Aplicando estructura de datos completa');
        console.log('Clases encontradas:', patch.classes.length);
        console.log('Relaciones encontradas:', patch.relations.length);
        
        // Aplicar las clases
        if (Array.isArray(patch.classes)) {
          setClasses(patch.classes);
        }
        
        // Aplicar las relaciones
        if (Array.isArray(patch.relations)) {
          setRelations(patch.relations);
        }
        
        if (patch.titulo) {
          setTitulo(patch.titulo);
        }
        
        console.log('✅ Estructura de datos aplicada exitosamente');
      } else if (Array.isArray(patch)) {
        // Es un array de operaciones patch
        console.log('Aplicando patch de operaciones');
        applyAIPatch(patch);
      } else if (typeof patch === 'object' && patch !== null) {
        // Es un objeto único, verificar si es una operación válida
        console.log('Procesando objeto único como operación');
        if (patch.type) {
          // Es una operación válida, convertir a array
          applyAIPatch([patch]);
        } else {
          console.error('Objeto no tiene tipo de operación válido:', patch);
        }
      } else {
        console.error('Formato de patch no reconocido:', patch);
        console.log('Estructura completa:', JSON.stringify(patch, null, 2));
      }
    };

    window.addEventListener('ai-patch-apply', handleAIPatchApply);
    // Eventos de clases
    socket.on('class-moved', ({ classId, position }) => {
      setClasses(prevClasses =>
        prevClasses.map(cls =>
          cls.id === classId ? { ...cls, x: position.x, y: position.y } : cls
        )
      );
    });

    socket.on('class-added', ({ newClass }) => {
      setClasses(prevClasses => [...prevClasses, newClass]);
    });

    socket.on('class-updated', ({ classId, updatedData }) => {
      setClasses(prevClasses =>
        prevClasses.map(cls =>
          cls.id === classId ? { ...cls, ...updatedData } : cls
        )
      );
    });

    socket.on('class-deleted', ({ classId }) => {
      setClasses(prevClasses => prevClasses.filter(cls => cls.id !== classId));
      setRelations(prevRelations => 
        prevRelations.filter(rel => rel.source !== classId && rel.target !== classId)
      );
    });

    // Eventos de relaciones
    socket.on('relation-added', ({ newRelation }) => {
      setRelations(prevRelations => [...prevRelations, newRelation]);
    });

    socket.on('relation-updated', ({ relationId, updatedData }) => {
      setRelations(prevRelations =>
        prevRelations.map(rel =>
          rel.id === relationId ? { ...rel, ...updatedData } : rel
        )
      );
    });

    socket.on('relation-deleted', ({ relationId }) => {
      setRelations(prevRelations => prevRelations.filter(rel => rel.id !== relationId));
    });

    return () => {
      // Limpiar listeners al desmontar
      socket.removeAllListeners();
      window.removeEventListener('ai-patch-apply', handleAIPatchApply);
    };
  }, [id, normalizeUsers]);

  // Cargar diagrama
  const cargarDiagrama = useCallback(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(API_CONFIG.getUrl(`/api/diagramas/${id}`), {
          headers: { Authorization: `Bearer ${token}` },
        });
  const diagrama = response.data;
        setTitulo(diagrama.titulo);
        
         const loadedClasses = diagrama.contenido.classes || [];
         const loadedRelations = diagrama.contenido.relations || [];
         
         // Eliminar duplicados por ID
         const uniqueClasses = loadedClasses.filter((cls, index, self) => 
           index === self.findIndex(c => c.id === cls.id)
         );
         const uniqueRelations = loadedRelations.filter((rel, index, self) => 
           index === self.findIndex(r => r.id === rel.id)
         );
         
         // Sanitizar posiciones para evitar NaN
         const sanitized = sanitizeClassesPositions(uniqueClasses);
         setClasses(sanitized);
         console.log('Clases cargadas:', uniqueClasses.length);
         
         setRelations(uniqueRelations);
        
        if (socketRef.current) {
          socketRef.current.emit('join-diagram', {
            roomId: id,
            diagramData: diagrama
          });
        }
        
        
        setHttpConnected(true); // Marcar HTTP como conectado
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar el diagrama:', error);
        setError('Error al cargar el diagrama. Verifica tu conexión.');
        setLoading(false);
      }
    }, [id, sanitizeClassesPositions]);

  useEffect(() => {
    cargarDiagrama();
  }, [cargarDiagrama]);

  // Mouse move effect for relations con mejor cálculo de posición
  useEffect(() => {
  if (isCreatingRelation && selectedClass) {
      const handleMouseMove = (e) => {
        const canvas = document.querySelector('.diagram-canvas');
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) / zoomLevel;
          const y = (e.clientY - rect.top) / zoomLevel;
          setCursorPosition({ x, y });
        }
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isCreatingRelation, selectedClass, zoomLevel]);

  // Manejar eventos globales del mouse para el arrastre
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isPanning) {
        e.preventDefault();
        setCanvasOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y
        });
      }
    };

    const handleGlobalMouseUp = (e) => {
      if (isPanning) {
        e.preventDefault();
        setIsPanning(false);
      }
    };

    if (isPanning) {
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isPanning, panStart]);

  // Inicializar motor de diagramas - SIMPLIFICADO (ya no necesitamos ProjectStorm)
  useEffect(() => {
    // El motor manual ya está funcionando correctamente
  }, []);

  // Sistema manual de renderizado - SIMPLIFICADO
  useEffect(() => {
    // El sistema manual ya está funcionando correctamente
  }, [classes, relations]);

  // Evitar el zoom del navegador (Ctrl/Meta + rueda, pinch en trackpad, atajos +/-/0, y gestos en Safari)
  useEffect(() => {
    const preventWheelZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    const preventKeyZoom = (e) => {
      const isPlus = e.key === '+' || e.key === '=';
      const isMinus = e.key === '-' || e.key === '_';
      const isZero = e.key === '0' || e.key === ')';
      const isNumpadPlus = e.key === 'Add';
      const isNumpadMinus = e.key === 'Subtract';
      if ((e.ctrlKey || e.metaKey) && (isPlus || isMinus || isZero || isNumpadPlus || isNumpadMinus)) {
        e.preventDefault();
      }
    };
    const preventGesture = (e) => {
      e.preventDefault();
    };

    // Captura temprana y bloquea en todos los navegadores
    window.addEventListener('wheel', preventWheelZoom, { passive: false, capture: true });
    window.addEventListener('mousewheel', preventWheelZoom, { passive: false, capture: true });
    window.addEventListener('DOMMouseScroll', preventWheelZoom, { passive: false, capture: true });
    window.addEventListener('keydown', preventKeyZoom, { passive: false, capture: true });
    window.addEventListener('gesturestart', preventGesture, { passive: false, capture: true });
    window.addEventListener('gesturechange', preventGesture, { passive: false, capture: true });
    window.addEventListener('gestureend', preventGesture, { passive: false, capture: true });

    return () => {
      window.removeEventListener('wheel', preventWheelZoom, { passive: false, capture: true });
      window.removeEventListener('mousewheel', preventWheelZoom, { passive: false, capture: true });
      window.removeEventListener('DOMMouseScroll', preventWheelZoom, { passive: false, capture: true });
      window.removeEventListener('keydown', preventKeyZoom, { passive: false, capture: true });
      window.removeEventListener('gesturestart', preventGesture, { passive: false, capture: true });
      window.removeEventListener('gesturechange', preventGesture, { passive: false, capture: true });
      window.removeEventListener('gestureend', preventGesture, { passive: false, capture: true });
    };
  }, []);

  const handleWheel = (e) => {
    const isPinchZoom = e.ctrlKey || e.metaKey;

    if (isPinchZoom) {
      // Zoom con gesto de pinza en touchpad o Ctrl+rueda
      const delta = e.deltaY * -0.005; // Zoom suave
      const newZoom = Math.max(0.1, Math.min(3, zoomLevel + delta));

      const rect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = newZoom / zoomLevel;
      setCanvasOffset(prev => ({
        x: mouseX - (mouseX - prev.x) * zoomFactor,
        y: mouseY - (mouseY - prev.y) * zoomFactor
      }));
      setZoomLevel(newZoom);
    } else {
      // Desplazamiento con dos dedos: pan horizontal/vertical
      setCanvasOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  // Manejar inicio del arrastre
  const handleMouseDown = (e) => {
    if (e.ctrlKey && e.button === 0) { // Control + Click izquierdo
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      setPanStart({
        x: e.clientX - canvasOffset.x,
        y: e.clientY - canvasOffset.y
      });
    }
  };

  // Manejar movimiento durante el arrastre
  const handleMouseMove = (e) => {
    if (isPanning) {
      e.preventDefault();
      e.stopPropagation();
      setCanvasOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  // Manejar fin del arrastre
  const handleMouseUp = (e) => {
    if (isPanning) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(false);
    }
  };

  // Prevenir el menú contextual en Control + Click derecho
  const handleContextMenu = (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
    }
  };

  // Función para aplicar patches de IA al diagrama
  const applyAIPatch = (patch) => {
    try {
      console.log('Aplicando patch de IA:', patch);
      
      // Verificar que patch sea un array válido
      if (!Array.isArray(patch)) {
        console.error('Patch no es un array válido:', patch);
        return;
      }
      
      patch.forEach((change, index) => {
        try {
          console.log(`Procesando cambio ${index + 1}:`, change);
          
          switch (change.type) {
            case 'modify_class':
              // Modificar una clase existente
              if (change.id && change.data) {
                setClasses(prevClasses =>
                  prevClasses.map(cls =>
                    cls.id === change.id ? { ...cls, ...change.data } : cls
                  )
                );
                console.log(`Clase ${change.id} modificada con datos:`, change.data);
              } else {
                console.warn('⚠️ Datos incompletos para modify_class:', change);
              }
              break;
              
                 case 'add_class':
                   // Agregar una nueva clase
                   const classData = change.data || change;
                   if (classData.id && classData.name) {
                     // Calcular posición mejorada para evitar solapamiento en espacio expandido
                     const baseX = 300;
                     const baseY = 300;
                     const spacingX = 400;
                     const spacingY = 300;
                     
                     // Usar el índice del cambio para calcular posición
                     const index = patch.findIndex(p => p === change);
                     const row = Math.floor(index / 4); // 4 clases por fila
                     const col = index % 4;
                     
                     const newClass = {
                       id: classData.id,
                       name: classData.name,
                       x: classData.x || baseX + (col * spacingX),
                       y: classData.y || baseY + (row * spacingY),
                       attributes: classData.attributes || [],
                       methods: classData.methods || []
                     };
                     setClasses(prevClasses => [...prevClasses, newClass]);
                     console.log(`Clase ${classData.name} agregada en posición (${newClass.x}, ${newClass.y}):`, newClass);
                   } else {
                     console.warn('⚠️ Datos incompletos para add_class:', change);
                   }
                   break;
              
            case 'modify_relation':
              // Modificar una relación existente
              if (change.id && change.data) {
                setRelations(prevRelations =>
                  prevRelations.map(rel =>
                    rel.id === change.id ? { ...rel, ...change.data } : rel
                  )
                );
                console.log(`Relación ${change.id} modificada con datos:`, change.data);
              } else {
                console.warn('⚠️ Datos incompletos para modify_relation:', change);
              }
              break;
              
            case 'add_relation':
              // Agregar una nueva relación
              if (change.data && change.data.id) {
                const newRelation = {
                  id: change.data.id,
                  source: change.data.source,
                  target: change.data.target,
                  type: change.data.type,
                  multiplicidadOrigen: change.data.multiplicidadOrigen,
                  multiplicidadDestino: change.data.multiplicidadDestino
                };
                setRelations(prevRelations => [...prevRelations, newRelation]);
                console.log(`Relación ${change.data.type} agregada:`, newRelation);
              } else {
                console.warn('⚠️ Datos incompletos para add_relation:', change);
              }
              break;
              
            case 'remove_relation':
              // Eliminar una relación
              if (change.id) {
                setRelations(prevRelations =>
                  prevRelations.filter(rel => rel.id !== change.id)
                );
                console.log(`Relación ${change.id} eliminada`);
              } else {
                console.warn('⚠️ ID faltante para remove_relation:', change);
              }
              break;
              
            case 'remove_class':
              // Eliminar una clase
              if (change.id) {
                setClasses(prevClasses => prevClasses.filter(cls => cls.id !== change.id));
                // También eliminar relaciones que involucren esta clase
                setRelations(prevRelations =>
                  prevRelations.filter(rel => rel.source !== change.id && rel.target !== change.id)
                );
                console.log(`Clase ${change.id} eliminada`);
              } else {
                console.warn('⚠️ ID faltante para remove_class:', change);
              }
              break;
              
            default:
              console.warn('⚠️ Tipo de cambio no reconocido:', change.type, change);
          }
        } catch (changeError) {
          console.error(`Error procesando cambio ${index + 1}:`, changeError, change);
        }
      });
      
      
      console.log('Patch de IA aplicado exitosamente');
    } catch (error) {
      console.error('Error aplicando patch de IA:', error);
    }
  };

  // Función para ajustar zoom y centrar contenido automáticamente (usa viewport visible)
  const fitToBounds = useCallback((padding = 80) => {
    if (classes.length === 0) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();

    const xs = classes.map(c => Number.isFinite(c.x) ? c.x : 0);
    const ys = classes.map(c => Number.isFinite(c.y) ? c.y : 0);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs.map((x, i) => x + 300)); // ancho aprox
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys.map((y, i) => y + 200)); // alto aprox

    const contentW = Math.max(1, maxX - minX);
    const contentH = Math.max(1, maxY - minY);

    const scaleX = (rect.width - padding * 2) / contentW;
    const scaleY = (rect.height - padding * 2) / contentH;
    let newZoom = Math.min(scaleX, scaleY);
    if (!Number.isFinite(newZoom) || newZoom <= 0) newZoom = 1;
    newZoom = Math.max(0.1, Math.min(2, newZoom));

    setZoomLevel(newZoom);

    let newOffsetX = Math.round(padding - minX * newZoom + (rect.width - padding * 2 - contentW * newZoom) / 2);
    let newOffsetY = Math.round(padding - minY * newZoom + (rect.height - padding * 2 - contentH * newZoom) / 2);
    if (!Number.isFinite(newOffsetX)) newOffsetX = 0;
    if (!Number.isFinite(newOffsetY)) newOffsetY = 0;

    setCanvasOffset({ x: newOffsetX, y: newOffsetY });
  }, [classes]);

  // Ajustar vista automáticamente solo una vez al cargar el diagrama
  useEffect(() => {
    if (!isLoading && classes.length > 0 && !hasAutoFitRef.current) {
      hasAutoFitRef.current = true;
      setTimeout(() => {
        fitToBounds();
      }, 300);
    }
  }, [isLoading, classes, fitToBounds]);

  // Reiniciar el flag cuando cambia de diagrama
  useEffect(() => {
    hasAutoFitRef.current = false;
  }, [id]);


  const handleClassUpdate = (classId, updatedData) => {
    setClasses(prevClasses =>
      prevClasses.map(cls =>
        cls.id === classId ? { ...cls, ...updatedData } : cls
      )
    );

    if (socketRef.current) {
      socketRef.current.emit('update-class', {
        roomId: id,
      classId,
        data: updatedData
    });
    }
  };

  const handleClassDelete = (classId) => {
    setClasses(prevClasses => prevClasses.filter(cls => cls.id !== classId));
    setRelations(prevRelations => 
      prevRelations.filter(rel => rel.source !== classId && rel.target !== classId)
    );

    if (socketRef.current) {
      socketRef.current.emit('delete-class', {
        roomId: id,
        classId
      });
    }
  };

  const agregarClase = () => {
    const newId = `class-${Date.now()}`;
    
    // Calcular posición inteligente basada en las clases existentes
    let newX = 200;
    let newY = 200;
    
    if (classes.length > 0) {
      // Encontrar una posición libre cerca del centro del viewport actual
      const viewportCenterX = -canvasOffset.x / zoomLevel + (viewportRef.current?.clientWidth || 800) / 2 / zoomLevel;
      const viewportCenterY = -canvasOffset.y / zoomLevel + (viewportRef.current?.clientHeight || 600) / 2 / zoomLevel;
      
      // Usar el centro del viewport como referencia
      newX = Math.max(50, viewportCenterX - 150);
      newY = Math.max(50, viewportCenterY - 75);
      
      // Evitar solapamiento con clases existentes
      const spacing = 350;
      let attempts = 0;
      let currentX = newX;
      let currentY = newY;
      
      const checkOverlap = (x, y) => {
        return classes.some(cls => 
          Math.abs(cls.x - x) < spacing && Math.abs(cls.y - y) < spacing
        );
      };
      
      while (attempts < 10) {
        if (!checkOverlap(currentX, currentY)) {
          newX = currentX;
          newY = currentY;
          break;
        }
        
        // Mover hacia la derecha y abajo en espiral
        currentX += spacing * 0.7;
        currentY += spacing * 0.3;
        attempts++;
      }
    }
    
    const newClass = {
      id: newId,
      name: 'Nueva Clase',
      x: newX,
      y: newY,
      attributes: [`id_${newId} (PK)`],
      methods: [],
    };
    
    setClasses((prevClasses) => [...prevClasses, newClass]);

    // Emitir evento específico
    if (socketRef.current) {
      socketRef.current.emit('add-class', {
        roomId: id,
        newClass,
      });
    }

    // Feedback visual
    console.log(`Clase "${newClass.name}" agregada exitosamente en posición (${Math.round(newX)}, ${Math.round(newY)})`);
  };

  const handleClassClick = (classItem) => {
    if (isCreatingRelation) {
      if (!selectedClass) {
        // Primera clase seleccionada
        setSelectedClass(classItem);
        console.log(`🔗 Primera clase seleccionada: ${classItem.name}`);
        
        // Feedback visual mejorado
        const classElement = document.querySelector(`[data-class-id="${classItem.id}"]`);
        if (classElement) {
          classElement.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.6)';
          classElement.style.transform = 'scale(1.05)';
        }
      } else if (selectedClass && selectedClass.id !== classItem.id) {
        // Segunda clase seleccionada - crear relación
        console.log(`Segunda clase seleccionada: ${classItem.name}, creando relación ${relationType}`);
        
        // Crear la relación según el tipo
        const success = createRelationByType(selectedClass, classItem, relationType);
        
        if (success) {
          // Feedback visual de éxito
          console.log(`Relación ${relationType} creada exitosamente entre ${selectedClass.name} y ${classItem.name}`);
        }
      } else if (selectedClass && selectedClass.id === classItem.id) {
        // Deseleccionar si se hace clic en la misma clase
        console.log(`Deseleccionando clase: ${classItem.name}`);
        setSelectedClass(null);
        
        // Limpiar feedback visual
        const classElement = document.querySelector(`[data-class-id="${classItem.id}"]`);
        if (classElement) {
          classElement.style.boxShadow = '';
          classElement.style.transform = '';
        }
      }
    } else {
      // Modo normal - solo seleccionar para edición
      setSelectedClass(classItem);
    }
  };

  // Función mejorada para crear relaciones según el tipo
  const createRelationByType = (sourceClass, targetClass, type) => {
    console.log(`Creando relación ${type} entre ${sourceClass.name} y ${targetClass.name}`);
    
    let success = true;
    
    switch (type) {
      case 'Composición':
        createComposicion(sourceClass, targetClass);
        break;
      case 'Agregacion':
        createAgregacion(sourceClass, targetClass);
        break;
      case 'Generalización':
        createGeneralizacion(sourceClass, targetClass);
        break;
      case 'Muchos a Muchos':
        createMuchosAMuchos(sourceClass, targetClass);
        break;
      case 'Asociación':
      default:
        success = createAsociacion(sourceClass, targetClass);
        break;
    }
    
    // Limpiar selecciones y salir del modo de creación solo si fue exitoso
    if (success) {
      resetRelationCreation();
    }
    
    return success;
  };

  // Función para resetear el estado de creación de relaciones
  const resetRelationCreation = () => {
    // Limpiar feedback visual de todas las clases
    const classElements = document.querySelectorAll('[data-class-id]');
    classElements.forEach(element => {
      element.style.boxShadow = '';
      element.style.transform = '';
    });
    
    setSelectedClass(null);
    setIsCreatingRelation(false);
    console.log('Estado de creación de relaciones reseteado - todas las clases deseleccionadas');
  };

  // Función auxiliar para limpiar la selección de clases
  const clearClassSelection = () => {
    // Limpiar feedback visual de todas las clases
    const classElements = document.querySelectorAll('[data-class-id]');
    classElements.forEach(element => {
      element.style.boxShadow = '';
      element.style.transform = '';
    });
    
    setSelectedClass(null);
    console.log('Selección de clases limpiada');
  };

  // Función para cancelar la creación de relaciones
  const cancelRelationCreation = () => {
    resetRelationCreation();
  };

  // Función para generar JDL usando el nuevo endpoint
  const generateSpringBootProject = async () => {
    const token = localStorage.getItem('token');
    setExportError(null);
    setJdlContent(null);
    setZipDownloadUrl(null);
    setLoading(true);
    
    try {
      const response = await fetch(API_CONFIG.getUrl(`/api/openapi/generate-backend/${id}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }
      
      // Verificar el tipo de contenido de la respuesta
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/zip')) {
        // Si es un ZIP, manejarlo como blob
        const blob = await response.blob();
        const zipUrl = window.URL.createObjectURL(blob);
        setZipDownloadUrl(zipUrl);
        setJdlContent('Archivo ZIP generado exitosamente');
        setExportError(null);
        
        // Descargar automáticamente el ZIP
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = `${titulo || 'diagrama'}-springboot-project.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('¡Proyecto Spring Boot generado y descargado exitosamente!');
      } else if (contentType && contentType.includes('application/json')) {
        // Si es JSON, manejarlo normalmente
        const result = await response.json();
        
        if (result.success) {
          setJdlContent(result.jdlContent);
          
          // Si el backend también devuelve un ZIP del proyecto generado
          if (result.zipUrl) {
            setZipDownloadUrl(result.zipUrl);
            
            // Descargar automáticamente el ZIP
            const link = document.createElement('a');
            link.href = result.zipUrl;
            link.download = `${titulo || 'diagrama'}-springboot-project.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
          
          setExportError(null);
          alert('¡Proyecto Spring Boot generado exitosamente!');
      } else {
          setExportError(result.message || 'No se pudo generar el JDL.');
          setJdlContent(null);
          setZipDownloadUrl(null);
      }
      } else {
        // Intentar como texto plano (podría ser JDL directo)
        const textResult = await response.text();
        setJdlContent(textResult);
        setExportError(null);
        alert('¡JDL generado exitosamente!');
      }
    } catch (error) {
      console.error('Error generando proyecto:', error);
      setExportError('Error generando proyecto: ' + error.message);
      setJdlContent(null);
      setZipDownloadUrl(null);
      alert('Error al generar el proyecto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para descargar el JDL
  const downloadJDL = () => {
    if (!jdlContent) return;
    
    const blob = new Blob([jdlContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagrama-${id}.jdl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Función para descargar el ZIP del proyecto Spring Boot
  const downloadSpringBootProject = () => {
    if (!zipDownloadUrl) return;
    
    const a = document.createElement('a');
    a.href = zipDownloadUrl;
    a.download = `spring-boot-project-${id}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Función para manejar actualizaciones del diagrama desde la IA - REMOVIDA
  // Esta función no se usa actualmente, se maneja directamente en los eventos de Socket.IO

  // Función para copiar al portapapeles
  const copyToClipboard = async () => {
    if (!jdlContent) return;
    
    try {
      await navigator.clipboard.writeText(jdlContent);
      alert('JDL copiado al portapapeles!');
    } catch (err) {
      console.error('Error copiando al portapapeles:', err);
      alert('No se pudo copiar al portapapeles');
    }
  };

  // Funciones mejoradas para crear relaciones
  const createComposicion = (sourceClass, targetClass) => {
      const newRelation = {
        id: `rel-${Date.now()}`,
      source: sourceClass.id,
        target: targetClass.id,
        type: 'Composición',
      multiplicidadOrigen: '1',
      multiplicidadDestino: '0..*',
      marker: 'diamondFilled'
      };
  
      setRelations((prevRelations) => [...prevRelations, newRelation]);
    
    if (socketRef.current) {
      socketRef.current.emit('add-relation', { roomId: id, newRelation });
    }
    
    console.log('Composición creada exitosamente');
  };

  // Función agregarComposicion removida - se usa createComposicion directamente

  const createAgregacion = (sourceClass, targetClass) => {
      const newRelation = {
        id: `rel-${Date.now()}`,
      source: sourceClass.id,
        target: targetClass.id,
        type: 'Agregación',
      multiplicidadOrigen: '1',
      multiplicidadDestino: '0..*',
      marker: 'diamondEmpty',
      };
  
      setRelations((prevRelations) => [...prevRelations, newRelation]);
    
    if (socketRef.current) {
      socketRef.current.emit('add-relation', { roomId: id, newRelation });
    }
    
    console.log('Agregación creada exitosamente');
  };

  // Función agregarAgregacion removida - se usa createAgregacion directamente

  const createGeneralizacion = (sourceClass, targetClass) => {
      const newRelation = {
        id: `rel-${Date.now()}`,
      source: sourceClass.id,
        target: targetClass.id,
        type: 'Generalización',
      multiplicidadOrigen: '',
      multiplicidadDestino: '',
      marker: 'triangle'
      };
  
      setRelations((prevRelations) => [...prevRelations, newRelation]);
    
    if (socketRef.current) {
      socketRef.current.emit('add-relation', { roomId: id, newRelation });
    }
    
    console.log('Generalización creada exitosamente');
  };

  // Función agregarGeneralizacion removida - se usa createGeneralizacion directamente

  const createMuchosAMuchos = (sourceClass, targetClass) => {
      const classIntermediaId = `class-${Date.now()}`;
      const classIntermedia = {
        id: classIntermediaId,
      name: `${sourceClass.name}_${targetClass.name}`,
      x: (sourceClass.x + targetClass.x) / 2,
      y: (sourceClass.y + targetClass.y) / 2 - 50,
      attributes: [`${sourceClass.name.toLowerCase()}_id (FK)`, `${targetClass.name.toLowerCase()}_id (FK)`],
        methods: []
      };
    
      setClasses((prevClasses) => [...prevClasses, classIntermedia]);
  
      const relation1 = {
        id: `rel-${Date.now()}-1`,
      source: sourceClass.id,
        target: classIntermediaId,
        type: 'Uno a Muchos',
        multiplicidadOrigen: '1',
        multiplicidadDestino: '*'
      };
      const relation2 = {
        id: `rel-${Date.now()}-2`,
        source: targetClass.id,
        target: classIntermediaId,
        type: 'Uno a Muchos',
        multiplicidadOrigen: '1',
        multiplicidadDestino: '*'
      };
  
      setRelations((prevRelations) => [...prevRelations, relation1, relation2]);
    
    if (socketRef.current) {
      socketRef.current.emit('add-class', { roomId: id, newClass: classIntermedia });
      socketRef.current.emit('add-relation', { roomId: id, newRelation: relation1 });
      socketRef.current.emit('add-relation', { roomId: id, newRelation: relation2 });
    }
    
    console.log('Relación Muchos a Muchos creada exitosamente con clase intermedia');
  };

  // Función agregarMuchosAMuchos removida - se usa createMuchosAMuchos directamente

  const createAsociacion = (sourceClass, targetClass) => {
    const multiplicidadOrigen = prompt("Ingrese la multiplicidad del origen", "1");
    const multiplicidadDestino = prompt("Ingrese la multiplicidad del destino", "1..*");

    if (multiplicidadOrigen && multiplicidadDestino) {
      const newRelation = {
        id: `rel-${Date.now()}`,
        source: sourceClass.id,
        target: targetClass.id,
        type: 'Asociación',
        multiplicidadOrigen,
        multiplicidadDestino,
      };
      
      setRelations((prevRelations) => [...prevRelations, newRelation]);

      if (socketRef.current) {
        socketRef.current.emit('add-relation', { roomId: id, newRelation });
      }
      
      console.log('Asociación creada exitosamente');
      } else {
      alert("Debe ingresar las multiplicidades.");
      // Si cancela, no resetear para permitir reintentar
      return false;
    }
    return true;
  };

  // Función agregarRelacion removida - se usa createAsociacion directamente

  // Función para generar UUID único
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
  });
};

  // Función para exportar a XMI
const exportarXMI = () => {
  const xmlDoc = document.implementation.createDocument(null, null, null);
  const xmiElement = xmlDoc.createElement('xmi:XMI');
  xmiElement.setAttribute('xmi:version', '2.1');
  xmiElement.setAttribute('xmlns:xmi', 'http://schema.omg.org/spec/XMI/2.1');
  xmiElement.setAttribute('xmlns:uml', 'http://schema.omg.org/spec/UML/2.1');

  const xmiDocumentation = xmlDoc.createElement('xmi:Documentation');
  xmiDocumentation.setAttribute('exporter', 'Tu Aplicación');
  xmiDocumentation.setAttribute('exporterVersion', '1.0');
  xmiElement.appendChild(xmiDocumentation);

  const umlModel = xmlDoc.createElement('uml:Model');
  umlModel.setAttribute('xmi:type', 'uml:Model');
  umlModel.setAttribute('name', titulo || 'ModeloExportado');
  umlModel.setAttribute('visibility', 'public');

  const umlPackage = xmlDoc.createElement('packagedElement');
  umlPackage.setAttribute('xmi:type', 'uml:Package');
  umlPackage.setAttribute('xmi:id', `pkg_${generateUUID()}`);
  umlPackage.setAttribute('name', 'PaqueteExportado');
  umlPackage.setAttribute('visibility', 'public');

  // Agregar clases
  classes.forEach((cls) => {
    const classElement = xmlDoc.createElement('packagedElement');
    classElement.setAttribute('xmi:type', 'uml:Class');
    classElement.setAttribute('xmi:id', cls.id);
    classElement.setAttribute('name', cls.name);
    classElement.setAttribute('visibility', 'public');

    // Agregar atributos
    cls.attributes.forEach((attr) => {
      const attributeElement = xmlDoc.createElement('ownedAttribute');
      attributeElement.setAttribute('xmi:type', 'uml:Property');
      attributeElement.setAttribute('xmi:id', `attr_${generateUUID()}`);
      attributeElement.setAttribute('name', attr);
      attributeElement.setAttribute('visibility', 'private');
      classElement.appendChild(attributeElement);
    });

    // Agregar métodos
    cls.methods.forEach((method) => {
      const methodElement = xmlDoc.createElement('ownedOperation');
      methodElement.setAttribute('xmi:type', 'uml:Operation');
      methodElement.setAttribute('xmi:id', `op_${generateUUID()}`);
      methodElement.setAttribute('name', method);
      methodElement.setAttribute('visibility', 'public');
      classElement.appendChild(methodElement);
    });

    umlPackage.appendChild(classElement);
  });

    // Agregar relaciones
  relations.forEach((rel) => {
    if (rel.type === 'Association Class') {
      const associationClassElement = xmlDoc.createElement('packagedElement');
      associationClassElement.setAttribute('xmi:type', 'uml:AssociationClass');
      associationClassElement.setAttribute('xmi:id', rel.id);
        associationClassElement.setAttribute('name', 'ClaseIntermedia');

      const ownedEnd1 = xmlDoc.createElement('ownedEnd');
      ownedEnd1.setAttribute('xmi:type', 'uml:Property');
      ownedEnd1.setAttribute('xmi:id', `end1_${generateUUID()}`);
      ownedEnd1.setAttribute('type', rel.source);
      associationClassElement.appendChild(ownedEnd1);

      const ownedEnd2 = xmlDoc.createElement('ownedEnd');
      ownedEnd2.setAttribute('xmi:type', 'uml:Property');
      ownedEnd2.setAttribute('xmi:id', `end2_${generateUUID()}`);
      ownedEnd2.setAttribute('type', rel.target);
      associationClassElement.appendChild(ownedEnd2);

      umlPackage.appendChild(associationClassElement);
    } else {
      const associationElement = xmlDoc.createElement('packagedElement');
      associationElement.setAttribute('xmi:type', 'uml:Association');
      associationElement.setAttribute('xmi:id', rel.id);
      associationElement.setAttribute('visibility', 'public');

      const ownedEnd1 = xmlDoc.createElement('ownedEnd');
      ownedEnd1.setAttribute('xmi:type', 'uml:Property');
      ownedEnd1.setAttribute('xmi:id', `end1_${generateUUID()}`);
      ownedEnd1.setAttribute('aggregation', rel.type === 'Composición' ? 'composite' : 'none');
      ownedEnd1.setAttribute('type', rel.source);
      associationElement.appendChild(ownedEnd1);

      const ownedEnd2 = xmlDoc.createElement('ownedEnd');
      ownedEnd2.setAttribute('xmi:type', 'uml:Property');
      ownedEnd2.setAttribute('xmi:id', `end2_${generateUUID()}`);
      ownedEnd2.setAttribute('aggregation', 'none');
      ownedEnd2.setAttribute('type', rel.target);
      associationElement.appendChild(ownedEnd2);

      umlPackage.appendChild(associationElement);
    }
  });

  umlModel.appendChild(umlPackage);
  xmiElement.appendChild(umlModel);

  const serializer = new XMLSerializer();
  const xmiString = serializer.serializeToString(xmiElement);
  const blob = new Blob([xmiString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${titulo || 'diagrama'}.xmi`;
  link.click();
    URL.revokeObjectURL(url);
  };

  // Función para descargar JSON
  const downloadJSON = (data) => {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagrama.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Función mejorada para manejar importación de archivos XMI
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No se seleccionó ningún archivo");
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const xmiText = e.target.result;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmiText, "application/xml");
  
      const importedClasses = [];
      const importedRelations = [];
      const classIdMap = new Map(); // Mapeo de IDs XMI a IDs internos
  
      console.log("Iniciando importación XMI mejorada...");
  
      // 1. Extraer clases regulares (uml:Class)
      const classElements = xmlDoc.getElementsByTagName("packagedElement");
      for (let i = 0; i < classElements.length; i++) {
        const classEl = classElements[i];
        const xmiType = classEl.getAttribute("xmi:type");
        
        if (xmiType === "uml:Class") {
          const attributes = [];
          const attributeElements = classEl.getElementsByTagName("ownedAttribute");
          
          for (let j = 0; j < attributeElements.length; j++) {
            const attrEl = attributeElements[j];
            const attributeName = attrEl.getAttribute("name");
            if (attributeName) {
              attributes.push(attributeName);
            }
          }
  
          const classObj = {
            id: classEl.getAttribute("xmi:id"),
            name: classEl.getAttribute("name") || "ClaseSinNombre",
            x: 200 + importedClasses.length * 350,
            y: 200 + (importedClasses.length % 3) * 250,
            attributes,
            methods: [],
          };
          
          classIdMap.set(classObj.id, classObj.id);
          importedClasses.push(classObj);
          console.log(`Clase importada: ${classObj.name} (${classObj.id})`);
        }
      }
  
      // 2. Extraer AssociationClass (clases intermedias)
      for (let i = 0; i < classElements.length; i++) {
        const classEl = classElements[i];
        const xmiType = classEl.getAttribute("xmi:type");
        
        if (xmiType === "uml:AssociationClass") {
          const attributes = [];
          const attributeElements = classEl.getElementsByTagName("ownedAttribute");
          
          for (let j = 0; j < attributeElements.length; j++) {
            const attrEl = attributeElements[j];
            const attributeName = attrEl.getAttribute("name");
            if (attributeName) {
              attributes.push(attributeName);
            }
          }
  
          const classObj = {
            id: classEl.getAttribute("xmi:id"),
            name: classEl.getAttribute("name") || "ClaseIntermedia",
            x: 400 + importedClasses.length * 350,
            y: 300 + (importedClasses.length % 3) * 250,
            attributes,
            methods: [],
          };
          
          classIdMap.set(classObj.id, classObj.id);
          importedClasses.push(classObj);
          console.log(`Clase intermedia importada: ${classObj.name} (${classObj.id})`);
        }
      }
  
      // 3. Extraer relaciones de asociación - MEJORADO
      console.log(`Procesando ${classElements.length} elementos para relaciones...`);
      let associationCount = 0;
      
      for (let i = 0; i < classElements.length; i++) {
        const classEl = classElements[i];
        const xmiType = classEl.getAttribute("xmi:type");
        
        if (xmiType === "uml:Association") {
          associationCount++;
          console.log(`Procesando asociación ${associationCount}: ${classEl.getAttribute("xmi:id")}`);
          const ownedEnds = classEl.getElementsByTagName("ownedEnd");
          console.log(`   - ownedEnds encontrados: ${ownedEnds.length}`);
          
          if (ownedEnds.length >= 2) {
            // Buscar los ends correctos basándose en los memberEnd
            const memberEnds = classEl.getElementsByTagName("memberEnd");
            let sourceEnd = null;
            let targetEnd = null;
            
            if (memberEnds.length >= 2) {
              const sourceMemberId = memberEnds[0].getAttribute("xmi:idref");
              const targetMemberId = memberEnds[1].getAttribute("xmi:idref");
              
              // Encontrar los ownedEnd correspondientes
              for (let j = 0; j < ownedEnds.length; j++) {
                const endId = ownedEnds[j].getAttribute("xmi:id");
                if (endId === sourceMemberId) {
                  sourceEnd = ownedEnds[j];
                } else if (endId === targetMemberId) {
                  targetEnd = ownedEnds[j];
                }
              }
            } else {
              // Fallback: usar los primeros dos ownedEnd
              sourceEnd = ownedEnds[0];
              targetEnd = ownedEnds[1];
            }
            
            if (sourceEnd && targetEnd) {
              // Buscar el tipo de diferentes maneras
              let sourceId = sourceEnd.getAttribute("type");
              let targetId = targetEnd.getAttribute("type");
              
              // Si no encuentra type, buscar en elementos hijo
              if (!sourceId) {
                const sourceTypeEl = sourceEnd.querySelector("type");
                if (sourceTypeEl) {
                  sourceId = sourceTypeEl.getAttribute("xmi:idref");
                }
              }
              
              if (!targetId) {
                const targetTypeEl = targetEnd.querySelector("type");
                if (targetTypeEl) {
                  targetId = targetTypeEl.getAttribute("xmi:idref");
                }
              }
              
              const aggregation = sourceEnd.getAttribute("aggregation") || "none";
              
              console.log(`Procesando relación:`);
              console.log(`   - sourceEnd HTML:`, sourceEnd.outerHTML);
              console.log(`   - targetEnd HTML:`, targetEnd.outerHTML);
              console.log(`   - sourceId: ${sourceId}`);
              console.log(`   - targetId: ${targetId}`);
              console.log(`   - aggregation: ${aggregation}`);
              
              if (sourceId && targetId && classIdMap.has(sourceId) && classIdMap.has(targetId)) {
                let relationType = "Asociación";
                let multiplicidadOrigen = "1";
                let multiplicidadDestino = "1";
                
                // Determinar tipo de relación basado en aggregation
                if (aggregation === "composite") {
                  relationType = "Composición";
                  multiplicidadOrigen = "1";
                  multiplicidadDestino = "0..*";
                } else if (aggregation === "shared") {
                  relationType = "Agregación";
                  multiplicidadOrigen = "1";
                  multiplicidadDestino = "0..*";
                }
                
                const relationObj = {
                  id: classEl.getAttribute("xmi:id"),
                  source: sourceId,
                  target: targetId,
                  type: relationType,
                  multiplicidadOrigen,
                  multiplicidadDestino,
                };
                
                importedRelations.push(relationObj);
                console.log(`Relación importada: ${relationType} (${sourceId} → ${targetId})`);
              } else {
                console.log(`⚠️ Relación omitida: clases no encontradas (${sourceId}, ${targetId})`);
              }
            }
          } else {
            console.log(`⚠️ Asociación ${associationCount} omitida: solo ${ownedEnds.length} ownedEnds (necesita 2)`);
            console.log(`   - Buscando ownedEnds en clases relacionadas...`);
            
            // Buscar ownedEnds en las clases que referencian esta asociación
            const associationId = classEl.getAttribute("xmi:id");
            const relatedOwnedEnds = [];
            
            // Buscar en todas las clases por ownedEnds que referencien esta asociación
            const seenOwnedEndIds = new Set();
            for (let j = 0; j < classElements.length; j++) {
              const classElement = classElements[j];
              
              // Buscar en ownedEnds directos
              const classOwnedEnds = classElement.getElementsByTagName("ownedEnd");
              for (let k = 0; k < classOwnedEnds.length; k++) {
                const ownedEnd = classOwnedEnds[k];
                const ownedEndId = ownedEnd.getAttribute("xmi:id");
                
                if (ownedEnd.getAttribute("association") === associationId && !seenOwnedEndIds.has(ownedEndId)) {
                  seenOwnedEndIds.add(ownedEndId);
                  relatedOwnedEnds.push(ownedEnd);
                  console.log(`   - Encontrado ownedEnd en clase ${classElement.getAttribute("name")}: ${ownedEndId}`);
                  console.log(`   - ownedEnd HTML:`, ownedEnd.outerHTML);
                }
              }
              
              // Buscar en atributos de clase que pueden ser ownedEnds
              const classAttributes = classElement.getElementsByTagName("ownedAttribute");
              for (let k = 0; k < classAttributes.length; k++) {
                const attribute = classAttributes[k];
                const attributeId = attribute.getAttribute("xmi:id");
                
                if (attribute.getAttribute("association") === associationId && !seenOwnedEndIds.has(attributeId)) {
                  seenOwnedEndIds.add(attributeId);
                  relatedOwnedEnds.push(attribute);
                  console.log(`   - Encontrado ownedAttribute en clase ${classElement.getAttribute("name")}: ${attributeId}`);
                  console.log(`   - ownedAttribute HTML:`, attribute.outerHTML);
                }
              }
            }
            
            console.log(`   - Total ownedEnds encontrados: ${relatedOwnedEnds.length}`);
            
            if (relatedOwnedEnds.length >= 2) {
              console.log(`   - Procesando con ${relatedOwnedEnds.length} ownedEnds encontrados en clases`);
              const sourceEnd = relatedOwnedEnds[0];
              const targetEnd = relatedOwnedEnds[1];
              
              // Buscar el tipo de diferentes maneras
              let sourceId = sourceEnd.getAttribute("type");
              let targetId = targetEnd.getAttribute("type");
              
              // Si no encuentra type, buscar en elementos hijo
              if (!sourceId) {
                const sourceTypeEl = sourceEnd.querySelector("type");
                if (sourceTypeEl) {
                  sourceId = sourceTypeEl.getAttribute("xmi:idref");
                }
              }
              
              if (!targetId) {
                const targetTypeEl = targetEnd.querySelector("type");
                if (targetTypeEl) {
                  targetId = targetTypeEl.getAttribute("xmi:idref");
                }
              }
              
              const aggregation = sourceEnd.getAttribute("aggregation") || "none";
              
              console.log(`   - sourceId: ${sourceId}`);
              console.log(`   - targetId: ${targetId}`);
              console.log(`   - aggregation: ${aggregation}`);
              
              // Debug específico para la composición auto-empleados
              if ((sourceId === "EAID_1018C124_0A6B_4c2f_9D5D_162B9D4613D3" && targetId === "EAID_2D645AEB_B784_4d5b_BFB9_DF6A841238F7") ||
                  (sourceId === "EAID_2D645AEB_B784_4d5b_BFB9_DF6A841238F7" && targetId === "EAID_1018C124_0A6B_4c2f_9D5D_162B9D4613D3")) {
                console.log(`   - ESTA ES LA COMPOSICIÓN AUTO-EMPLEADOS!`);
                console.log(`   - sourceEnd aggregation: ${sourceEnd.getAttribute("aggregation")}`);
                console.log(`   - targetEnd aggregation: ${targetEnd.getAttribute("aggregation")}`);
              }
              
              if (sourceId && targetId && classIdMap.has(sourceId) && classIdMap.has(targetId)) {
                let relationType = "Asociación";
                let multiplicidadOrigen = "1";
                let multiplicidadDestino = "1";
                
                // Determinar tipo de relación basado en aggregation
                const sourceAggregation = sourceEnd.getAttribute("aggregation");
                const targetAggregation = targetEnd.getAttribute("aggregation");
                
                console.log(`   - sourceAggregation: ${sourceAggregation}`);
                console.log(`   - targetAggregation: ${targetAggregation}`);
                
                // Determinar tipo y dirección de la relación
                let finalSourceId = sourceId;
                let finalTargetId = targetId;
                
                if (sourceAggregation === "composite" || targetAggregation === "composite") {
                  relationType = "Composición";
                  // En composición, el que tiene composite es el contenedor (target)
                  if (sourceAggregation === "composite") {
                    finalSourceId = targetId;
                    finalTargetId = sourceId;
                  }
                } else if (sourceAggregation === "shared" || targetAggregation === "shared") {
                  relationType = "Agregación";
                  // En agregación, el que tiene shared es el contenedor (target)
                  if (sourceAggregation === "shared") {
                    finalSourceId = targetId;
                    finalTargetId = sourceId;
                  }
                }
                
                console.log(`   - Dirección final: ${finalSourceId} → ${finalTargetId}`);
                
                const relationObj = {
                  id: associationId,
                  source: finalSourceId,
                  target: finalTargetId,
                  type: relationType,
                  multiplicidadOrigen,
                  multiplicidadDestino,
                };
                
                importedRelations.push(relationObj);
                console.log(`Relación importada desde clases: ${relationType} (${finalSourceId} → ${finalTargetId})`);
              } else {
                console.log(`⚠️ Relación desde clases omitida: clases no encontradas (${sourceId}, ${targetId})`);
              }
            } else {
              console.log(`   - Solo ${relatedOwnedEnds.length} ownedEnds encontrados en clases (necesita 2)`);
              console.log(`   - IDs de ownedEnds encontrados:`, relatedOwnedEnds.map(end => end.getAttribute("xmi:id")));
            }
          }
        }
      }
      
      console.log(`Total de asociaciones procesadas: ${associationCount}`);
  
      // 4. Extraer relaciones de generalización
      const generalizationElements = xmlDoc.getElementsByTagName("generalization");
      console.log(`Encontradas ${generalizationElements.length} generalizaciones`);
      
      for (let i = 0; i < generalizationElements.length; i++) {
        const relationEl = generalizationElements[i];
        const sourceId = relationEl.getAttribute("specific");
        const targetId = relationEl.getAttribute("general");
        
        console.log(`Procesando generalización ${i + 1}: ${sourceId} → ${targetId}`);
        console.log(`   - Elemento HTML:`, relationEl.outerHTML);
        console.log(`   - sourceId en mapa: ${classIdMap.has(sourceId)}`);
        console.log(`   - targetId en mapa: ${classIdMap.has(targetId)}`);
  
        if (sourceId && targetId && classIdMap.has(sourceId) && classIdMap.has(targetId)) {
          const relationObj = {
            id: relationEl.getAttribute("xmi:id"),
            source: sourceId,
            target: targetId,
            type: "Generalización",
            multiplicidadOrigen: "",
            multiplicidadDestino: "",
          };
          importedRelations.push(relationObj);
          console.log(`Generalización importada: ${sourceId} → ${targetId}`);
        } else {
          console.log(`⚠️ Generalización omitida: clases no encontradas (${sourceId}, ${targetId})`);
          
          // Si falta sourceId, buscar en el elemento padre (clase)
          if (!sourceId && targetId) {
            const parentClass = relationEl.parentElement;
            if (parentClass && parentClass.getAttribute("xmi:type") === "uml:Class") {
              const parentId = parentClass.getAttribute("xmi:id");
              console.log(`   - Buscando sourceId en clase padre: ${parentId}`);
              
              if (classIdMap.has(parentId)) {
                console.log(`   - Usando clase padre como sourceId: ${parentId}`);
                
                const relationObj = {
                  id: relationEl.getAttribute("xmi:id"),
                  source: parentId,
                  target: targetId,
                  type: "Generalización",
                  multiplicidadOrigen: "",
                  multiplicidadDestino: "",
                };
                
                importedRelations.push(relationObj);
                console.log(`Generalización importada desde clase padre: ${parentId} → ${targetId}`);
              } else {
                console.log(`   - Clase padre no encontrada en mapa: ${parentId}`);
              }
            }
          }
        }
      }
  
      // 5. Procesar relaciones de AssociationClass - MEJORADO
      for (let i = 0; i < classElements.length; i++) {
        const classEl = classElements[i];
        const xmiType = classEl.getAttribute("xmi:type");
        
        if (xmiType === "uml:AssociationClass") {
          const ownedEnds = classEl.getElementsByTagName("ownedEnd");
          const memberEnds = classEl.getElementsByTagName("memberEnd");
          
          console.log(`Procesando AssociationClass: ${classEl.getAttribute("name")} (${classEl.getAttribute("xmi:id")})`);
          console.log(`   - ownedEnds: ${ownedEnds.length}`);
          console.log(`   - memberEnds: ${memberEnds.length}`);
          
          if (ownedEnds.length >= 2) {
            let sourceEnd = null;
            let targetEnd = null;
            
            // Usar memberEnd para encontrar los ends correctos
            if (memberEnds.length >= 2) {
              const sourceMemberId = memberEnds[0].getAttribute("xmi:idref");
              const targetMemberId = memberEnds[1].getAttribute("xmi:idref");
              
              for (let j = 0; j < ownedEnds.length; j++) {
                const endId = ownedEnds[j].getAttribute("xmi:id");
                if (endId === sourceMemberId) {
                  sourceEnd = ownedEnds[j];
                } else if (endId === targetMemberId) {
                  targetEnd = ownedEnds[j];
                }
              }
            } else {
              sourceEnd = ownedEnds[0];
              targetEnd = ownedEnds[1];
            }
            
            if (sourceEnd && targetEnd) {
              // Buscar el tipo de diferentes maneras
              let sourceId = sourceEnd.getAttribute("type");
              let targetId = targetEnd.getAttribute("type");
              
              // Si no encuentra type, buscar en elementos hijo
              if (!sourceId) {
                const sourceTypeEl = sourceEnd.querySelector("type");
                if (sourceTypeEl) {
                  sourceId = sourceTypeEl.getAttribute("xmi:idref");
                }
              }
              
              if (!targetId) {
                const targetTypeEl = targetEnd.querySelector("type");
                if (targetTypeEl) {
                  targetId = targetTypeEl.getAttribute("xmi:idref");
                }
              }
              
              console.log(`   - sourceEnd HTML:`, sourceEnd.outerHTML);
              console.log(`   - targetEnd HTML:`, targetEnd.outerHTML);
              console.log(`   - sourceId: ${sourceId}`);
              console.log(`   - targetId: ${targetId}`);
              console.log(`   - sourceId en mapa: ${classIdMap.has(sourceId)}`);
              console.log(`   - targetId en mapa: ${classIdMap.has(targetId)}`);
              
              if (sourceId && targetId && classIdMap.has(sourceId) && classIdMap.has(targetId)) {
                // Crear dos relaciones: una desde cada clase hacia la clase intermedia
                const relation1 = {
                  id: `${classEl.getAttribute("xmi:id")}_1`,
                  source: sourceId,
                  target: classEl.getAttribute("xmi:id"),
                  type: "Uno a Muchos",
                  multiplicidadOrigen: "1",
                  multiplicidadDestino: "*",
                };
                
                const relation2 = {
                  id: `${classEl.getAttribute("xmi:id")}_2`,
                  source: targetId,
                  target: classEl.getAttribute("xmi:id"),
                  type: "Uno a Muchos",
                  multiplicidadOrigen: "1",
                  multiplicidadDestino: "*",
                };
                
                importedRelations.push(relation1, relation2);
                console.log(`Relaciones de clase intermedia creadas: ${sourceId} → ${classEl.getAttribute("xmi:id")} ← ${targetId}`);
              } else {
                console.log(`⚠️ AssociationClass omitida: clases no encontradas (${sourceId}, ${targetId})`);
              }
            }
          }
        }
      }
  
      console.log(`Resumen de importación:`);
      console.log(`   - Clases: ${importedClasses.length}`);
      console.log(`   - Relaciones: ${importedRelations.length}`);
      console.log("Clases importadas:", importedClasses);
      console.log("Relaciones importadas:", importedRelations);
      
      // Debug adicional
      console.log("Mapa de IDs de clases:", Array.from(classIdMap.keys()));
      console.log("Todas las clases encontradas en XMI:");
      for (let i = 0; i < classElements.length; i++) {
        const classEl = classElements[i];
        const xmiType = classEl.getAttribute("xmi:type");
        if (xmiType === "uml:Class" || xmiType === "uml:AssociationClass") {
          console.log(`   - ${classEl.getAttribute("name")} (${classEl.getAttribute("xmi:id")}) - ${xmiType}`);
        }
      }
  
      // Aplicar las clases y relaciones importadas
      setClasses(sanitizeClassesPositions(importedClasses));
      setRelations(importedRelations);
      
      // Feedback visual
      alert(`Importación exitosa!\n\nClases: ${importedClasses.length}\nRelaciones: ${importedRelations.length}`);
    };
  
    reader.readAsText(file);
  };

  const handleUpdateRelation = (relationId, updates) => {
    setRelations(prevRelations =>
      prevRelations.map(rel =>
        rel.id === relationId ? { ...rel, ...updates } : rel
      )
    );

    if (socketRef.current) {
      socketRef.current.emit('update-relation', {
        roomId: id,
        relationId,
        updates
      });
    }
  };

  const handleDeleteRelation = (relationId) => {
    setRelations(prevRelations => 
      prevRelations.filter(rel => rel.id !== relationId)
    );

    if (socketRef.current) {
      socketRef.current.emit('delete-relation', {
        roomId: id,
        relationId
      });
    }
  };

  // Función removida - no se usa manejo de archivos ZIP

  // --- Invitaciones & Usuarios ---
  const fetchUsuarios = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const resp = await axios.get(API_CONFIG.getUrl(`/api/invitations/${id}/users`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      const lista = resp.data || [];
      setUsuarios(lista);
      // También sincronizar el contador visual de usuarios en línea si el backend devuelve presencia
      if (Array.isArray(lista)) {
        setOnlineUsers(lista);
      }
    } catch (err) {
      console.error('Error obteniendo usuarios del diagrama:', err?.response?.data || err.message);
    }
  }, [id]);

  const fetchCodigoInvitacion = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      // 1) Intentar recuperar desde localStorage (guardado al generarlo)
      const localKey = `invitationCode:${id}`;
      const stored = localStorage.getItem(localKey);
      if (stored) {
        setCodigoInvitacion(stored);
        console.log('Código de invitación recuperado de localStorage:', stored);
        return;
      }

      // 2) Si no hay en localStorage, no llamamos al endpoint por ID de diagrama
      // porque el backend expone GET /api/invitations/code/{codigoInvitacion} (no por diagramId)
      console.log('No hay código en localStorage. Omite petición por diagramId para evitar 404.');
    } catch (err) {
      // Solo mostrar error si no es un 404 (endpoint no existe)
      if (err?.response?.status !== 404) {
        console.error('Error obteniendo código de invitación:', err?.response?.data || err.message);
      } else {
        console.log('Endpoint de código de invitación no disponible - esto es normal');
      }
      // No mostrar error al usuario si no hay código existente
    }
  }, [id]);

  const generarCodigoInvitacion = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No hay token de autenticación. Inicia sesión nuevamente.');
        return;
      }
      console.log('Generando nuevo código de invitación...');
      const resp = await axios.post(API_CONFIG.getUrl(`/api/invitations/generate`), {
        diagramId: id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Intentar distintas claves posibles que pueda devolver el backend
      const nuevoCodigo = resp.data?.codigo || resp.data?.code || resp.data?.codigoInvitacion || resp.data?.invitationCode;
      console.log('Respuesta del servidor al generar:', resp.data);
      console.log('Nuevo código generado:', nuevoCodigo);
      if (nuevoCodigo) {
        setCodigoInvitacion(nuevoCodigo);
        // Guardar para próximas cargas (el backend no expone GET por diagramId)
        try {
          localStorage.setItem(`invitationCode:${id}`, nuevoCodigo);
        } catch {}
        console.log('Código de invitación actualizado:', nuevoCodigo);
      } else {
        console.warn('Respuesta inesperada al generar código de invitación:', resp.data);
        alert('Código generado pero no se pudo interpretar la respuesta. Revisa consola.');
      }
    } catch (err) {
      console.error('Error generando código de invitación:', err?.response?.data || err.message);
      
      // Manejar diferentes tipos de errores
      if (err?.response?.status === 404) {
        alert('El endpoint de invitaciones no está disponible en el backend.');
      } else if (err?.response?.status === 401) {
        alert('No tienes permisos para generar códigos de invitación.');
      } else if (err?.response?.status === 500) {
        alert('Error interno del servidor al generar código de invitación.');
      } else {
        alert('No se pudo generar el código de invitación. Verifica la conexión.');
      }
    }
  };

  const invalidarCodigoInvitacion = async () => {
    if (!codigoInvitacion) return;
    if (!window.confirm('¿Seguro que deseas invalidar este código?')) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No hay token de autenticación. Inicia sesión nuevamente.');
        return;
      }
      await axios.delete(API_CONFIG.getUrl(`/api/invitations/${id}/invitations/${codigoInvitacion}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCodigoInvitacion('');
      alert('Código invalidado.');
    } catch (err) {
      console.error('Error invalidando código de invitación:', err?.response?.data || err.message);
      alert('No se pudo invalidar el código.');
    }
  };

  // Cargar solo código de invitación al montar / cambiar id (presencia va por sockets)
  useEffect(() => {
    fetchCodigoInvitacion();
  }, [id, fetchCodigoInvitacion]);

  // Funciones adicionales del editor limpio
  const abrirModalTitulo = () => {
    setNewTitle(titulo);
    setShowTitleModal(true);
  };

  const guardarTitulo = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(API_CONFIG.getUrl(`/api/diagramas/${id}`), {
        titulo: newTitle,
        contenido: { classes, relations },
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTitulo(newTitle);
      setShowTitleModal(false);
    } catch (error) {
      console.error('Error guardando título:', error);
    }
  };

  const guardarDiagrama = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No hay token de autenticación. Inicia sesión nuevamente.');
        return;
      }
      
      await axios.put(API_CONFIG.getUrl(`/api/diagramas/${id}`), {
        titulo,
        contenido: { classes, relations },
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Sincronizar con otros usuarios
      if (socketRef.current) {
        socketRef.current.emit('diagram-saved', {
          roomId: id,
          diagramData: { titulo, classes, relations }
        });
      }

      console.log('Diagrama guardado exitosamente');
      
      // Feedback visual opcional
      const saveButton = document.querySelector('[data-save-button]');
      if (saveButton) {
        const originalText = saveButton.textContent;
        saveButton.textContent = 'Guardado';
        saveButton.style.background = '#10B981';
        setTimeout(() => {
          saveButton.textContent = originalText;
          saveButton.style.background = '';
        }, 2000);
      }
      
    } catch (error) {
      console.error('Error guardando diagrama:', error);
      alert(`Error al guardar: ${error.response?.data?.message || error.message}`);
    }
  };

  const volverAInicio = () => {
    navigate('/dashboard');
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setJdlContent(null);
    setExportError(null);
  };
  const handleDiagramUpdateFromAgent = useCallback((updatedData) => {
    if (updatedData.classes) {
      setClasses(updatedData.classes);
    }
    if (updatedData.relations) {
      setRelations(updatedData.relations);
    }
    if (updatedData.titulo) {
      setTitulo(updatedData.titulo);
    }
    console.log('Diagrama actualizado desde la IA');
  }, []);
  
  

  // Pantallas de loading y error - MEJORADAS
  if (isLoading) {
    return (
      <EditorContainer>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>Cargando diagrama...</h2>
            <p style={{ margin: 0, opacity: 0.8 }}>Conectando con el servidor</p>
          </div>
        </div>
      </EditorContainer>
    );
  }

  if (error) {
    return (
      <EditorContainer>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <AlertCircle size={64} color="#ef4444" />
          <div style={{ textAlign: 'center', color: 'white' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>Error de Conexión</h2>
            <p style={{ margin: '0 0 20px 0', opacity: 0.8, maxWidth: '400px' }}>{error}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button onClick={() => window.location.reload()} $variant="primary">
                <RefreshCw size={16} />
                Reintentar
              </Button>
          </div>
          </div>
        </div>
      </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      <Header>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Title>{titulo || 'Diagrama sin título'}</Title>
          <Button onClick={abrirModalTitulo} $variant="secondary">
            <Edit size={16} />
            Editar título
          </Button>
          <TourGuide isVisible={true} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button onClick={volverAInicio} $variant="secondary">
            <ArrowLeft size={16} />
            Volver
          </Button>
          <Button onClick={guardarDiagrama} $variant="primary" data-save-button>
            <Save size={16} />
            Guardar
          </Button>
        </div>
      </Header>

      <ToolbarContainer>
        <ToolbarGroup>
            <Button $variant="primary" id="agregar-clase" onClick={() => {
              clearClassSelection();
              agregarClase();
            }}>
            <Plus size={16} />
              Agregar Clase
          </Button>
          {!isCreatingRelation && (
            <>
              <Button $variant="secondary" id="crear-asociacion" onClick={() => { 
                clearClassSelection();
                setRelationType('Asociación'); 
                setIsCreatingRelation(true); 
              }}>
                <Link size={16} />
                Crear Asociación
          </Button>
              <Button $variant="secondary" id="crear-composicion" onClick={() => { 
                clearClassSelection();
                setRelationType('Composición'); 
                setIsCreatingRelation(true); 
              }}>
                <CircleDot size={16} />
                Crear Composición
            </Button>
            <Button $variant="secondary" id="crear-agregacion" onClick={() => { 
                clearClassSelection();
                setRelationType('Agregacion'); 
                setIsCreatingRelation(true); 
              }}>
                <Circle size={16} />
                Crear Agregación
            </Button>
            <Button $variant="secondary" id="crear-generalizacion" onClick={() => { 
                clearClassSelection();
                setRelationType('Generalización'); 
                setIsCreatingRelation(true); 
              }}>
                <ArrowUp size={16} />
                Crear Generalización
            </Button>
            <Button $variant="secondary" id="crear-muchos-muchos" onClick={() => { 
                clearClassSelection();
                setRelationType('Muchos a Muchos'); 
                setIsCreatingRelation(true); 
              }}>
                <ArrowRightLeft size={16} />
                Crear Muchos a Muchos
            </Button>
            </>
          )}
          {isCreatingRelation && (
            <>
              <Button 
                $variant="danger" 
                onClick={cancelRelationCreation}
                style={{
                  padding: '12px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  color: 'white'
                }}
              >
                <X size={16} style={{ marginRight: '8px' }} />
                Cancelar Relación
              </Button>
              <div style={{ 
                padding: '12px 20px', 
                background: selectedClass 
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg,rgb(0, 0, 0) 0%,rgb(14, 14, 15) 100%)', 
                borderRadius: '12px', 
                fontSize: '15px',
                border: selectedClass 
                  ? '2px solid rgba(16, 185, 129, 0.3)' 
                  : '2px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: '600',
                boxShadow: selectedClass 
                  ? '0 6px 20px rgba(16, 185, 129, 0.4)' 
                  : '0 6px 20px rgba(102, 126, 234, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
                  animation: 'shimmer 2s infinite'
                }} />
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: selectedClass ? '#22c55e' : '#667eea',
                  animation: 'pulse 1.5s infinite',
                  boxShadow: selectedClass 
                    ? '0 0 10px rgba(34, 197, 94, 0.6)' 
                    : '0 0 10px rgba(102, 126, 234, 0.6)',
                  position: 'relative',
                  zIndex: 1
                }} />
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {!selectedClass 
                    ? `🔗 Creando ${relationType}: Haz clic en la primera clase` 
                    : `📍 ${relationType}: "${selectedClass.name}" → Selecciona la clase destino`}
                </span>
              </div>
            </>
          )}
        </ToolbarGroup>

        <ToolbarGroup>
          <Button $variant="primary" id="exportar-backend" onClick={generateSpringBootProject}>
            <Code size={16} />
            Exportar a Backend
          </Button>
            <Button $variant="secondary" id="exportar-xmi" onClick={exportarXMI}>
            <FileDown size={16} />
            Exportar a XMI
            </Button>
          <Button $variant="secondary" onClick={() => downloadJSON({ titulo, classes, relations })}>
            <Download size={16} />
              Descargar JSON
            </Button>
          <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', borderRadius: '4px', fontSize: '14px', fontWeight: '500' }}>
            <FileUp size={16} style={{ marginRight: '8px' }} />
            Importar XMI
            <input 
              type="file" 
              accept=".xmi,.xml" 
              onChange={handleFileImport} 
              style={{ display: 'none' }} 
            />
          </label>
          <Button $variant="primary" id="mostrar-ia" onClick={() => {
            console.log('Toggle AI Chat desde toolbar:', !chatAIVisible);
            setChatAIVisible(!chatAIVisible);
          }}>
            <Bot size={16} />
            {chatAIVisible ? 'Ocultar IA' : 'Mostrar IA'}
            </Button>
          {!codigoInvitacion && (
            <Button $variant="success" id="generar-codigo-invitacion" onClick={generarCodigoInvitacion}>
              <Key size={16} />
              Generar Código Invitación
            </Button>
          )}
        </ToolbarGroup>
        
        {/* Status bar en toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Estado de conexión */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {(isConnected || httpConnected) ? <Wifi size={16} color="#48bb78" /> : <WifiOff size={16} color="#f56565" />}
              <span style={{ fontSize: '13px', color: (isConnected || httpConnected) ? '#48bb78' : '#f56565', fontWeight: '500' }}>
                {(isConnected || httpConnected) ? 
                  (isConnected && httpConnected ? 'Conectado (HTTP + WebSocket)' : 
                   isConnected ? 'Conectado (WebSocket)' : 'Conectado (HTTP)') 
                  : 'Desconectado'}
              </span>
            </div>
            
            {/* Separador */}
            <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
            
            {/* Usuarios en línea */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={14} color="#667eea" />
              <span style={{ fontSize: '13px', color: '#667eea', fontWeight: '500' }}>
                {onlineUsers.length} usuario(s) en línea
              </span>
            </div>
            
            {/* Separador */}
            <div style={{ width: '1px', height: '16px', background: 'rgba(255, 255, 255, 0.2)' }}></div>
            
            {/* Información del canvas */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: '600' }}>
                Zoom: {Math.round(zoomLevel * 100)}%
              </span>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: '600' }}>
                Pos: ({Math.round(canvasOffset.x)}, {Math.round(canvasOffset.y)})
              </span>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: '600' }}>
                Clases: {classes.length}
              </span>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: '600' }}>
                Relaciones: {relations.length}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button id="centrar-vista" onClick={() => {
              fitToBounds();
            }} $variant="primary">
              <RefreshCw size={16} />
              Centrar Vista
            </Button>
          </div>
        </div>
      </ToolbarContainer>

      {/* Panel de Colaboración Unificado */}
      {(usuarios.length > 0 || codigoInvitacion) && (
        <CollaborationPanel>
          {/* Sección de Usuarios */}
          {usuarios.length > 0 && (
            <div className="users-section">
              <h3>
                <Users size={20} />
                Usuarios con acceso
              </h3>
              <ul>
                {usuarios.map((item) => (
                  <li key={item.id}>
                    <span>
                      <Users size={16} style={{ marginRight: '8px' }} />
                      {item.Usuario.nombre}
                    </span>
                    <span className="badge">{item.permiso}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sección de Código de Invitación */}
          <div className="invitation-section">
            {codigoInvitacion ? (
              <>
                <p>
                  <Key size={16} />
                  <strong>Código de Invitación:</strong>
                </p>
                <div className="code-display">
                  {codigoInvitacion}
                </div>
                <div className="button-group">
                  <Button
                    $variant="primary"
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    onClick={() => {
                      navigator.clipboard.writeText(codigoInvitacion).then(() => {
                        alert('Código copiado al portapapeles');
                      });
                    }}
                  >
                    <Copy size={12} />
                    Copiar
                  </Button>
                  <Button $variant="danger" onClick={invalidarCodigoInvitacion}>
                    <X size={16} />
                    Invalidar
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p>
                  <Key size={16} />
                  No hay código activo.
                </p>
                <div className="button-group">
                  <Button $variant="success" onClick={generarCodigoInvitacion}>
                    <Plus size={16} />
                    Generar Código
                  </Button>
                </div>
              </>
            )}
          </div>
        </CollaborationPanel>
      )}

      <DiagramWrapper>
        {/* Indicador de posición del viewport */}
        <div className="viewport-chip" style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '8px 10px',
          color: 'white',
          fontSize: '12px',
          fontFamily: 'monospace',
          backdropFilter: 'blur(6px)',
          transition: 'opacity 0.2s',
          opacity: 0.8
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px', color: '#667eea' }}>Viewport</div>
          <div>X: {Math.round(canvasOffset.x)}</div>
          <div>Y: {Math.round(canvasOffset.y)}</div>
          <div>Zoom: {Math.round(zoomLevel * 100)}%</div>
        </div>

        {/* Mini-mapa del canvas */}
        <div className="minimap" style={{
          position: 'absolute',
          right: '16px',
          bottom: '16px',
          zIndex: 10,
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px',
          backdropFilter: 'blur(6px)',
          width: '300px',
          height: '200px'
        }}>
          <div style={{ 
            color: 'white', 
            fontSize: '12px', 
            fontWeight: '600', 
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            Mini-mapa
          </div>
          
          {/* Representación del canvas completo */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '140px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            overflow: 'hidden'
          }}>
           {/* Puntos que representan las clases */}
           {classes.map((cls, index) => (
             <div
               key={cls.id}
               style={{
                 position: 'absolute',
                 left: `${(cls.x / 6000) * 100}%`,
                 top: `${(cls.y / 4000) * 100}%`,
                 width: '4px',
                 height: '4px',
                 background: '#10B981',
                 borderRadius: '50%',
                 boxShadow: '0 0 4px rgba(16, 185, 129, 0.6)'
               }}
               title={cls.name}
             />
           ))}
           
           {/* Rectángulo del viewport actual (usa tamaño real del contenedor y zoom) */}
           {(() => {
             const viewport = viewportRef.current;
             const vpW = viewport ? viewport.clientWidth : window.innerWidth;
             const vpH = viewport ? viewport.clientHeight : window.innerHeight;
             const viewLeft = Math.max(0, Math.min(6000, -canvasOffset.x / zoomLevel));
             const viewTop = Math.max(0, Math.min(4000, -canvasOffset.y / zoomLevel));
             const viewW = Math.min(6000, vpW / zoomLevel);
             const viewH = Math.min(4000, vpH / zoomLevel);
             return (
               <div style={{
                 position: 'absolute',
                 left: `${(viewLeft / 6000) * 100}%`,
                 top: `${(viewTop / 4000) * 100}%`,
                 width: `${(viewW / 6000) * 100}%`,
                 height: `${(viewH / 4000) * 100}%`,
                 border: '2px solidrgb(24, 25, 27)',
                 background: 'rgba(102, 126, 234, 0.2)',
                 borderRadius: '2px',
                 boxShadow: '0 0 8px rgba(39, 40, 43, 0.4)'
               }} />
             );
           })()}
            
            {/* Líneas de referencia en el mini-mapa */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '0',
              right: '0',
              height: '1px',
              background: 'rgba(255, 255, 255, 0.3)',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '0',
              bottom: '0',
              width: '1px',
              background: 'rgba(255, 255, 255, 0.3)',
              pointerEvents: 'none'
            }} />
          </div>
        </div>

        <CanvasContainer 
          ref={viewportRef}
          $isCreatingRelation={isCreatingRelation}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={handleContextMenu}
          style={{
            cursor: isPanning ? 'grabbing' : (isCreatingRelation ? 'crosshair' : 'grab'),
            userSelect: 'none'
          }}
        >
               <ZoomableCanvas
            style={{
              transform: `translate(${Number.isFinite(canvasOffset.x) ? canvasOffset.x : 0}px, ${Number.isFinite(canvasOffset.y) ? canvasOffset.y : 0}px) scale(${Number.isFinite(zoomLevel) && zoomLevel > 0 ? zoomLevel : 1})`,
              transformOrigin: '0 0',
              willChange: 'transform'
            }}
          >
            <div
              ref={canvasContainerRef}
              className="diagram-canvas"
              style={{
                position: 'absolute',     // no participa del flujo
                left: 0,
                top: 0,
                width: '6000px',          // plano más grande para grid extendido
                height: '4000px',         // pero sin afectar el body
                border: isCreatingRelation ? '2px dashed rgba(74, 108, 247, 0.5)' : 'none',
                backgroundColor: 'transparent'
              }}
            >
              {/* HUD y puntos de depuración removidos para una vista limpia */}

               {/* Renderizar clases UML */}
               {classes.map((classItem) => {
                 return (
                   <ClassComponent
                     key={classItem.id}
                     id={classItem.id}
                     className={classItem.name}
                     x={classItem.x}
                     y={classItem.y}
                     attributes={classItem.attributes}
                     methods={classItem.methods}
                     onPositionChange={(pos) => handleClassUpdate(classItem.id, pos)}
                     onUpdate={handleClassUpdate}
                     onDelete={() => handleClassDelete(classItem.id)}
                     onSelect={() => handleClassClick(classItem)}
                     $isSelected={selectedClass && selectedClass.id === classItem.id}
                     $isHighlighted={isCreatingRelation}
                     $isFirstSelection={isCreatingRelation && selectedClass && selectedClass.id === classItem.id}
                     $canBeTarget={isCreatingRelation && selectedClass && selectedClass.id !== classItem.id}
                     socket={socketRef.current}
                     idDiagrama={id}
                   />
                 );
               })}
               
               {/* Renderizar relaciones UML */}
               {relations.map((relation) => {
                 const sourceClass = classes.find((cls) => cls.id === relation.source);
                 const targetClass = classes.find((cls) => cls.id === relation.target);
                 if (!sourceClass || !targetClass) return null;
                 return (
                   <AssociationRelation
                     key={relation.id}
                     sourceClass={sourceClass}
                     targetClass={targetClass}
                     relation={relation}
                     onUpdate={handleUpdateRelation}
                     onDelete={handleDeleteRelation}
                   />
                 );
               })}

              {isCreatingRelation && selectedClass && cursorPosition && (
                <svg 
                  style={{ 
                    position: 'absolute', 
                    left: -500, 
                    top: -500, 
                    pointerEvents: 'none', 
                    width: 'calc(100% + 1000px)', 
                    height: 'calc(100% + 1000px)',
                    zIndex: 1000,
                    overflow: 'visible'
                  }}
                >
                  <defs>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
              <line
                x1={selectedClass.x + 100}
                y1={selectedClass.y + 30}
                x2={cursorPosition.x}
                y2={cursorPosition.y}
                    stroke="#4A6CF7"
                    strokeDasharray="8,4"
                    strokeWidth="3"
                    filter="url(#glow)"
                    style={{
                      animation: 'pulse 1.5s ease-in-out infinite'
                    }}
                  />
                  <circle
                    cx={cursorPosition.x}
                    cy={cursorPosition.y}
                    r="6"
                    fill="#4A6CF7"
                    filter="url(#glow)"
                    style={{
                      animation: 'pulse 1s ease-in-out infinite'
                    }}
                  />
                  <circle
                    cx={selectedClass.x + 100}
                    cy={selectedClass.y + 30}
                    r="4"
                    fill="#22C55E"
                    stroke="#fff"
                    strokeWidth="2"
              />
            </svg>
          )}
          </div>
          </ZoomableCanvas>
      </CanvasContainer>
      </DiagramWrapper>

      {isModalOpen && (
        <Modal>
          <ModalContent style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                <Code size={24} />
                Exportar a Spring Boot
              </h2>
              <Button onClick={cerrarModal} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
                <X size={24} />
              </Button>
            </div>

            {/* Loading */}
            {isLoading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ 
                  border: '3px solid #f3f3f3',
                  borderTop: '3px solid #4a6cf7',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}></div>
                <p style={{ marginTop: '16px', color: '#666' }}>Generando archivo JDL...</p>
              </div>
            )}

            {/* Error */}
            {exportError && (
              <div style={{ 
                textAlign: 'center', 
              padding: '20px', 
                color: '#d32f2f',
                background: '#ffebee',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <p>{exportError}</p>
                <Button 
                  $variant="primary" 
                  onClick={generateSpringBootProject}
                  style={{ marginTop: '12px' }}
                >
                  <RefreshCw size={16} />
                  Reintentar
                </Button>
            </div>
            )}

            {/* Success - JDL Content */}
            {jdlContent && (
              <div>
                <div style={{ marginBottom: '16px', color: '#2e7d32' }}>
                  <h3>JDL generado exitosamente</h3>
                  <p style={{ color: '#666' }}>Tu archivo JDL está listo para usar con JHipster:</p>
                </div>
                
                {/* JDL Preview */}
            <div style={{ 
                  background: '#f8f9fa',
                  border: '1px solid #e9ecef',
              borderRadius: '8px', 
                  marginBottom: '16px',
                  maxHeight: '300px',
                  overflow: 'auto'
                }}>
                  <pre style={{
                    padding: '16px',
                    margin: '0',
                    fontFamily: 'Courier New, monospace',
                    fontSize: '12px',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word'
                  }}>
                    {jdlContent}
                  </pre>
            </div>
            
                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <Button 
                    $variant="primary" 
                    onClick={downloadJDL}
                    style={{ flex: 1 }}
                  >
                    <Download size={16} />
                    Descargar JDL
              </Button>
              <Button 
                $variant="success" 
                    onClick={copyToClipboard}
                    style={{ flex: 1 }}
              >
                    <Copy size={16} />
                    Copiar al portapapeles
              </Button>
                  {zipDownloadUrl && (
                    <Button 
                      $variant="warning" 
                      onClick={downloadSpringBootProject}
                      style={{ flex: 1 }}
                    >
                      <Download size={16} />
                      Descargar Proyecto ZIP
                    </Button>
                  )}
            </div>

                {/* Instructions */}
            <div style={{ 
                  background: '#e3f2fd',
                  padding: '16px',
                  borderRadius: '8px'
                }}>
                  <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>Pasos para usar el JDL:</h4>
                  <ol style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    <li style={{ marginBottom: '4px' }}>
                      Instala JHipster: <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>npm install -g generator-jhipster</code>
                    </li>
                    <li style={{ marginBottom: '4px' }}>Crea una carpeta para tu proyecto</li>
                    <li style={{ marginBottom: '4px' }}>Guarda el archivo JDL en esa carpeta</li>
                    <li style={{ marginBottom: '4px' }}>
                      Ejecuta: <code style={{ background: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>jhipster jdl archivo.jdl</code>
                    </li>
                  </ol>
            </div>
          </div>
        )}

            {/* Initial state - show generate button */}
            {!isLoading && !exportError && !jdlContent && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                  Genera automáticamente un archivo JDL de Spring Boot basado en tu diagrama UML.
                </p>
              <Button 
                  $variant="primary"
                  onClick={generateSpringBootProject}
                  style={{ padding: '12px 24px', fontSize: '16px' }}
                >
                  <Code size={20} />
                  Generar JDL
              </Button>
              </div>
            )}

            {/* Footer buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
              <Button onClick={cerrarModal}>
                <X size={16} />
                Cerrar
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de título */}
      {showTitleModal && (
        <Modal onClick={() => setShowTitleModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px 0', color: '#1a202c', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit size={20} />
              Editar Título
            </h2>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ingresa el título del diagrama"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '1rem',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowTitleModal(false)} $variant="secondary">
                Cancelar
              </Button>
              <Button onClick={guardarTitulo} $variant="primary">
                Guardar
              </Button>
          </div>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de configuración */}
      {showBackendModal && (
        <Modal onClick={() => setShowBackendModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: '0 0 16px 0', color: '#1a202c', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={20} />
              Configuración del Editor
            </h2>
            <div style={{ marginBottom: '16px' }}>
              <h3>Funciones disponibles:</h3>
              <ul>
                <li>Guardar diagrama automático</li>
                <li>Exportar a JDL/Spring Boot</li>
                <li>Colaboración en tiempo real</li>
                <li>Asistente IA integrado</li>
                <li>Gestión de invitaciones</li>
                <li>Control de zoom y navegación</li>
              </ul>
              
              <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>Controles de Navegación:</h3>
          <div style={{ 
                background: '#f8f9fa', 
                padding: '12px', 
                borderRadius: '8px',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Zoom:</strong> Ctrl + Rueda del mouse
          </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>🖱️ Arrastrar:</strong> Ctrl + Click izquierdo y arrastrar
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Reset:</strong> Botón "Reset" para volver al zoom 100%
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Centrar:</strong> Botón "Centrar" para mostrar todas las clases
                </div>
                <div>
                  <strong>Indicador:</strong> El porcentaje de zoom se muestra en la barra de estado
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <Button onClick={() => setShowBackendModal(false)} $variant="secondary">
                Cerrar
              </Button>
            </div>
          </ModalContent>
        </Modal>
      )}

      {/* Asistente IA */}
      <AIAssistant
        isOpen={chatAIVisible}
        onToggle={() => {
          console.log('Toggle AI Chat:', !chatAIVisible);
          setChatAIVisible(!chatAIVisible);
        }}
        zIndexBase={1700}
        width={400}
        hideFloatingButton={true}
        diagramId={id}
        currentDiagram={
          {
            titulo,
            classes,
            relations
          }
        }
        onDiagramUpdate={handleDiagramUpdateFromAgent}
      />
    </EditorContainer>
  );
};

export default EditorDiagrama;