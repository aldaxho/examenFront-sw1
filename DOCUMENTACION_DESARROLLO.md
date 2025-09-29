# DOCUMENTACIÓN TÉCNICA DE DESARROLLO
## Editor de Diagramas UML Colaborativo con IA

---

## 1. INTRODUCCIÓN TÉCNICA

### 1.1 Descripción del Sistema
El **Editor de Diagramas UML Colaborativo** es una aplicación web desarrollada con React que permite a múltiples usuarios crear, editar y colaborar en diagramas de clases UML en tiempo real. El sistema integra inteligencia artificial para asistir en la generación automática de diagramas y exportación a proyectos Spring Boot.

### 1.2 Arquitectura General
- **Frontend**: React 18.3.1 con Vite como build tool
- **Backend**: Express.js con WebSockets para colaboración en tiempo real
- **Base de Datos**: Sistema de persistencia para diagramas y usuarios
- **IA**: Integración con Gemini-2.5-flash para generación automática
- **Comunicación**: WebSockets para sincronización en tiempo real

---

## 2. ARQUITECTURA DEL SOFTWARE

### 2.1 Estructura del Frontend (React)

```
src/
├── components/           # Componentes reutilizables
│   ├── AIAssistant.js   # Asistente de IA integrado
│   ├── ClassComponent.js # Componente para clases UML
│   ├── AssociationRelation.js # Componente para relaciones
│   ├── TourGuide.js     # Tour guiado con Driver.js
│   ├── Login.js         # Autenticación de usuarios
│   └── Register.js      # Registro de usuarios
├── pages/               # Páginas principales
│   ├── Dashboard.js     # Panel de proyectos
│   ├── EditorDiagrama.js # Editor principal
│   ├── Home.js          # Página de inicio
│   └── EditorDiagrama.styles.js # Estilos del editor
├── services/            # Servicios y configuración
│   ├── aiService.js     # Servicio de IA
│   └── apiConfig.js     # Configuración de API
└── App.js              # Componente principal
```

### 2.2 Tecnologías Implementadas

#### Frontend Stack:
- **React 18.3.1**: Framework principal con hooks modernos
- **React Router DOM 6.26.2**: Navegación entre páginas
- **Styled Components 6.1.13**: Estilos CSS-in-JS
- **Lucide React 0.543.0**: Iconografía moderna
- **Socket.io Client 4.7.5**: Comunicación en tiempo real
- **Driver.js**: Sistema de tours guiados
- **Axios 1.7.7**: Cliente HTTP para APIs

#### Backend Stack:
- **Express.js**: Servidor web y API REST
- **Socket.io**: WebSockets para colaboración
- **JWT**: Autenticación basada en tokens
- **Base de Datos**: Persistencia de diagramas y usuarios

---

## 3. FUNCIONALIDADES IMPLEMENTADAS

### 3.1 Sistema de Autenticación
```javascript
// Implementación de Login/Register con JWT
const authenticateUser = async (credentials) => {
  const response = await axios.post('/api/auth/login', credentials);
  const { token } = response.data;
  localStorage.setItem('authToken', token);
  return token;
};
```

### 3.2 Editor de Diagramas UML

#### 3.2.1 Creación de Clases
```javascript
// Componente ClassComponent.js
const ClassComponent = ({ 
  id, 
  className, 
  x, 
  y, 
  attributes, 
  methods, 
  onPositionChange, 
  onUpdate 
}) => {
  // Implementación de clase UML interactiva
  // - Arrastre y soltado
  // - Edición de propiedades
  // - Sincronización en tiempo real
};
```

#### 3.2.2 Tipos de Relaciones UML
- **Asociación**: Relación básica entre clases
- **Composición**: Relación fuerte de propiedad
- **Agregación**: Relación débil de contención
- **Generalización**: Herencia entre clases
- **Muchos a Muchos**: Relación bidireccional

### 3.3 Colaboración en Tiempo Real

#### 3.3.1 WebSockets Implementation
```javascript
// EditorDiagrama.js - Conexión WebSocket
useEffect(() => {
  const socket = io('ws://localhost:3001');
  
  socket.on('diagram-update', (data) => {
    // Sincronizar cambios entre usuarios
    updateDiagramFromServer(data);
  });
  
  socket.on('user-joined', (userData) => {
    // Notificar nuevo usuario en la sala
    addCollaborator(userData);
  });
  
  return () => socket.disconnect();
}, []);
```

#### 3.3.2 Sincronización de Estados
- **Operaciones CRUD**: Crear, leer, actualizar, eliminar elementos
- **Resolución de Conflictos**: Estrategia "último en guardar gana"
- **Reconciliación**: Sincronización al reconectar

### 3.4 Asistente de Inteligencia Artificial

#### 3.4.1 Integración con Gemini
```javascript
// aiService.js
const generateDiagramWithAI = async (description) => {
  const response = await axios.post('/api/ai/generate', {
    prompt: description,
    model: 'gemini-2.5-flash'
  });
  
  return response.data.diagram;
};
```

#### 3.4.2 Funcionalidades de IA
- **Generación Automática**: Crear diagramas desde descripción textual
- **Sugerencias Inteligentes**: Mejoras basadas en mejores prácticas
- **Validación**: Verificar consistencia del diagrama
- **Optimización**: Sugerir refactorizaciones

### 3.5 Sistema de Tours Guiados

#### 3.5.1 Implementación con Driver.js
```javascript
// TourGuide.js
const driverObj = driver({
  showProgress: true,
  showButtons: ['next', 'previous', 'close'],
  steps: [
    {
      element: '#agregar-clase',
      popover: {
        title: '🎯 ¡Comienza aquí!',
        description: 'Haz clic en "Agregar Clase" para crear tu primera clase UML.'
      }
    }
    // ... más pasos del tour
  ]
});
```

#### 3.5.2 Características del Tour
- **10 pasos guiados**: Desde creación hasta exportación
- **Progreso visual**: Indicador de paso actual
- **Navegación completa**: Anterior, siguiente, cerrar
- **Reproducible**: Botón siempre accesible en el header

### 3.6 Exportación y Generación de Código

#### 3.6.1 Exportación a Spring Boot
```javascript
const generateSpringBootProject = async () => {
  const diagramData = {
    classes: classes,
    relations: relations,
    title: titulo
  };
  
  const response = await axios.post('/api/export/springboot', diagramData);
  
  // Descargar archivo ZIP generado
  downloadFile(response.data.projectZip);
};
```

#### 3.6.2 Formatos de Exportación
- **XMI**: Compatible con Enterprise Architect
- **JSON**: Formato nativo para intercambio
- **Spring Boot**: Proyecto completo con entidades JPA

---

## 4. CASOS DE USO IMPLEMENTADOS

### 4.1 CU1: Crear Cuenta / Registrarse
**Implementación**: `src/components/Register.js`
```javascript
const handleRegister = async (userData) => {
  try {
    const response = await axios.post('/api/auth/register', userData);
    const { token } = response.data;
    localStorage.setItem('authToken', token);
    navigate('/dashboard');
  } catch (error) {
    setError('Error al crear cuenta');
  }
};
```

### 4.2 CU2: Iniciar Sesión / Autenticarse
**Implementación**: `src/components/Login.js`
```javascript
const handleLogin = async (credentials) => {
  const response = await axios.post('/api/auth/login', credentials);
  const { token, user } = response.data;
  localStorage.setItem('authToken', token);
  setUser(user);
  navigate('/dashboard');
};
```

### 4.3 CU3: Crear Nuevo Proyecto/Pizarra
**Implementación**: `src/pages/Dashboard.js`
```javascript
const createNewProject = async (projectName) => {
  const response = await axios.post('/api/projects', {
    name: projectName,
    userId: user.id
  });
  
  const projectId = response.data.id;
  navigate(`/editor-diagrama/${projectId}`);
};
```

### 4.4 CU4: Unirse a Sala / Abrir Pizarra
**Implementación**: `src/pages/EditorDiagrama.js`
```javascript
useEffect(() => {
  const loadDiagram = async () => {
    const response = await axios.get(`/api/diagrams/${id}`);
    const diagramData = response.data;
    
    setClasses(diagramData.classes || []);
    setRelations(diagramData.relations || []);
    setTitulo(diagramData.title);
  };
  
  loadDiagram();
}, [id]);
```

### 4.5 CU5: Crear Clase UML en Canvas
**Implementación**: `src/pages/EditorDiagrama.js`
```javascript
const agregarClase = () => {
  const nuevaClase = {
    id: generateUUID(),
    name: 'NuevaClase',
    x: Math.random() * 400 + 100,
    y: Math.random() * 300 + 100,
    attributes: [],
    methods: []
  };
  
  setClasses(prev => [...prev, nuevaClase]);
  
  // Emitir cambio vía WebSocket
  socket.emit('class-created', nuevaClase);
};
```

### 4.6 CU6: Editar Clase
**Implementación**: `src/components/ClassComponent.js`
```javascript
const handleUpdate = (updatedData) => {
  onUpdate(id, updatedData);
  
  // Sincronizar con otros usuarios
  socket.emit('class-updated', { id, ...updatedData });
};
```

### 4.7 CU7: Crear/Editar Relación UML
**Implementación**: `src/components/AssociationRelation.js`
```javascript
const createRelation = (sourceClass, targetClass, relationType) => {
  const relation = {
    id: generateUUID(),
    sourceId: sourceClass.id,
    targetId: targetClass.id,
    type: relationType
  };
  
  setRelations(prev => [...prev, relation]);
  socket.emit('relation-created', relation);
};
```

### 4.8 CU8: Eliminar Objeto
**Implementación**: `src/pages/EditorDiagrama.js`
```javascript
const handleDeleteClass = (classId) => {
  setClasses(prev => prev.filter(cls => cls.id !== classId));
  setRelations(prev => prev.filter(rel => 
    rel.sourceId !== classId && rel.targetId !== classId
  ));
  
  socket.emit('class-deleted', classId);
};
```

### 4.9 CU9: Guardar/auto-guardar Diagrama
**Implementación**: `src/pages/EditorDiagrama.js`
```javascript
const guardarDiagrama = async () => {
  const diagramData = {
    id,
    title: titulo,
    classes,
    relations,
    lastModified: new Date().toISOString()
  };
  
  await axios.put(`/api/diagrams/${id}`, diagramData);
  setSaved(true);
};

// Auto-guardado cada 30 segundos
useEffect(() => {
  const interval = setInterval(guardarDiagrama, 30000);
  return () => clearInterval(interval);
}, [classes, relations]);
```

### 4.10 CU10: Sincronización en Tiempo Real
**Implementación**: WebSockets en `EditorDiagrama.js`
```javascript
useEffect(() => {
  socket.on('diagram-update', (data) => {
    switch(data.type) {
      case 'class-created':
        setClasses(prev => [...prev, data.class]);
        break;
      case 'class-updated':
        setClasses(prev => prev.map(cls => 
          cls.id === data.id ? { ...cls, ...data.updates } : cls
        ));
        break;
      case 'class-deleted':
        setClasses(prev => prev.filter(cls => cls.id !== data.id));
        break;
    }
  });
}, []);
```

### 4.11 CU11: Compartir Sala / Generar Enlace
**Implementación**: `src/pages/EditorDiagrama.js`
```javascript
const generarCodigoInvitacion = async () => {
  const response = await axios.post(`/api/projects/${id}/invite`);
  const inviteCode = response.data.code;
  
  const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
  navigator.clipboard.writeText(inviteUrl);
  
  setCodigoInvitacion(inviteCode);
};
```

### 4.12 CU12: Generar Diagrama con IA
**Implementación**: `src/components/AIAssistant.js`
```javascript
const generateWithAI = async (description) => {
  setIsLoading(true);
  
  try {
    const response = await axios.post('/api/ai/generate-diagram', {
      description,
      diagramId: id
    });
    
    const { classes: aiClasses, relations: aiRelations } = response.data;
    
    setClasses(prev => [...prev, ...aiClasses]);
    setRelations(prev => [...prev, ...aiRelations]);
    
    // Sincronizar con otros usuarios
    socket.emit('ai-generated', { classes: aiClasses, relations: aiRelations });
    
  } catch (error) {
    setError('Error al generar diagrama con IA');
  } finally {
    setIsLoading(false);
  }
};
```

### 4.13 CU13: Exportar a Spring Boot
**Implementación**: `src/pages/EditorDiagrama.js`
```javascript
const generateSpringBootProject = async () => {
  setIsLoading(true);
  
  try {
    const diagramData = {
      title: titulo,
      classes,
      relations
    };
    
    const response = await axios.post('/api/export/springboot', diagramData, {
      responseType: 'blob'
    });
    
    // Crear y descargar archivo ZIP
    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${titulo}-springboot-project.zip`;
    link.click();
    
  } catch (error) {
    setExportError('Error al generar proyecto Spring Boot');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 5. ARQUITECTURA DE DATOS

### 5.1 Estructura de Diagrama
```javascript
const diagramSchema = {
  id: "uuid",
  title: "string",
  classes: [
    {
      id: "uuid",
      name: "string",
      x: "number",
      y: "number",
      attributes: [
        {
          name: "string",
          type: "string",
          visibility: "public|private|protected"
        }
      ],
      methods: [
        {
          name: "string",
          parameters: "string",
          returnType: "string",
          visibility: "public|private|protected"
        }
      ]
    }
  ],
  relations: [
    {
      id: "uuid",
      sourceId: "uuid",
      targetId: "uuid",
      type: "association|composition|aggregation|generalization|many-to-many",
      label: "string"
    }
  ],
  createdAt: "datetime",
  lastModified: "datetime",
  ownerId: "uuid"
};
```

### 5.2 Estructura de Usuario
```javascript
const userSchema = {
  id: "uuid",
  email: "string",
  password: "hashed_string",
  name: "string",
  createdAt: "datetime",
  lastLogin: "datetime"
};
```

### 5.3 Estructura de Proyecto
```javascript
const projectSchema = {
  id: "uuid",
  name: "string",
  description: "string",
  ownerId: "uuid",
  collaborators: ["uuid"],
  inviteCode: "string",
  createdAt: "datetime",
  lastModified: "datetime"
};
```

---

## 6. CONFIGURACIÓN Y DESPLIEGUE

### 6.1 Variables de Entorno
```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:3001
REACT_APP_WS_URL=ws://localhost:3001

# Backend (.env)
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/diagramdb
JWT_SECRET=your-jwt-secret
GEMINI_API_KEY=your-gemini-api-key
```

### 6.2 Scripts de Desarrollo
```json
{
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "test": "craco test",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix"
  }
}
```

### 6.3 Dependencias Principales
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "styled-components": "^6.1.13",
    "socket.io-client": "^4.7.5",
    "axios": "^1.7.7",
    "driver.js": "^1.0.0",
    "lucide-react": "^0.543.0"
  }
}
```

---

## 7. ESTÁNDARES DE CÓDIGO

### 7.1 Convenciones de Nomenclatura
- **Variables y funciones**: camelCase (`handleClick`, `userData`)
- **Componentes**: PascalCase (`ClassComponent`, `AIAssistant`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Archivos**: PascalCase para componentes, camelCase para utilidades

### 7.2 Estructura de Componentes
```javascript
// Estructura estándar de componente React
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ComponentName = ({ prop1, prop2, onAction }) => {
  // 1. Estados
  const [state, setState] = useState(initialValue);
  
  // 2. Efectos
  useEffect(() => {
    // Lógica de efectos
  }, [dependencies]);
  
  // 3. Funciones auxiliares
  const handleAction = () => {
    // Lógica de manejo
  };
  
  // 4. Render
  return (
    <Container>
      {/* JSX */}
    </Container>
  );
};

export default ComponentName;
```

### 7.3 Manejo de Errores
```javascript
// Patrón estándar para manejo de errores
const handleAsyncOperation = async () => {
  try {
    setIsLoading(true);
    const result = await apiCall();
    setData(result);
  } catch (error) {
    console.error('Error:', error);
    setError('Mensaje de error para el usuario');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 8. TESTING Y CALIDAD

### 8.1 Testing de Componentes
```javascript
// Ejemplo de test con React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import ClassComponent from '../ClassComponent';

test('renders class component with correct name', () => {
  render(
    <ClassComponent 
      id="1" 
      className="TestClass" 
      x={100} 
      y={100} 
    />
  );
  
  expect(screen.getByText('TestClass')).toBeInTheDocument();
});
```

### 8.2 Testing de Integración
```javascript
// Test de flujo completo de creación de clase
test('creates class and syncs with other users', async () => {
  const mockSocket = {
    emit: jest.fn(),
    on: jest.fn()
  };
  
  render(<EditorDiagrama socket={mockSocket} />);
  
  fireEvent.click(screen.getByText('Agregar Clase'));
  fireEvent.click(screen.getByTestId('canvas'));
  
  expect(mockSocket.emit).toHaveBeenCalledWith('class-created', expect.any(Object));
});
```

---

## 9. OPTIMIZACIÓN Y RENDIMIENTO

### 9.1 Optimizaciones de React
```javascript
// Memoización de componentes pesados
const ClassComponent = React.memo(({ id, className, x, y, attributes, methods }) => {
  // Componente optimizado
});

// Callbacks memoizados
const handleClassUpdate = useCallback((classId, updates) => {
  setClasses(prev => prev.map(cls => 
    cls.id === classId ? { ...cls, ...updates } : cls
  ));
}, []);
```

### 9.2 Optimizaciones de Red
```javascript
// Debounce para operaciones frecuentes
const debouncedSave = useMemo(
  () => debounce(guardarDiagrama, 1000),
  [classes, relations]
);

// Lazy loading de componentes
const AIAssistant = lazy(() => import('./AIAssistant'));
```

---

## 10. SEGURIDAD

### 10.1 Autenticación y Autorización
```javascript
// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};
```

### 10.2 Validación de Datos
```javascript
// Validación de entrada
const validateDiagramData = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(1).max(100).required(),
    classes: Joi.array().items(Joi.object({
      name: Joi.string().min(1).max(50).required(),
      x: Joi.number().min(0).required(),
      y: Joi.number().min(0).required()
    })),
    relations: Joi.array().items(Joi.object({
      sourceId: Joi.string().uuid().required(),
      targetId: Joi.string().uuid().required(),
      type: Joi.string().valid('association', 'composition', 'aggregation', 'generalization').required()
    }))
  });
  
  return schema.validate(data);
};
```

---

## 11. MONITOREO Y LOGGING

### 11.1 Logging de Aplicación
```javascript
// Sistema de logging estructurado
const logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${message}`, data);
  },
  error: (message, error = {}) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message, data = {}) => {
    console.warn(`[WARN] ${message}`, data);
  }
};

// Uso en componentes
useEffect(() => {
  logger.info('Diagrama cargado', { diagramId: id, classesCount: classes.length });
}, [id, classes.length]);
```

### 11.2 Métricas de Rendimiento
```javascript
// Medición de tiempo de operaciones
const measurePerformance = (operationName, operation) => {
  const start = performance.now();
  const result = operation();
  const end = performance.now();
  
  logger.info(`Performance: ${operationName}`, { 
    duration: `${end - start}ms` 
  });
  
  return result;
};
```

---

## 12. DOCUMENTACIÓN DE API

### 12.1 Endpoints Principales

#### Autenticación
```javascript
POST /api/auth/register
Body: { email, password, name }
Response: { token, user }

POST /api/auth/login  
Body: { email, password }
Response: { token, user }
```

#### Diagramas
```javascript
GET /api/diagrams/:id
Response: { id, title, classes, relations, lastModified }

PUT /api/diagrams/:id
Body: { title, classes, relations }
Response: { success: true }

POST /api/diagrams
Body: { title, ownerId }
Response: { id, title, createdAt }
```

#### IA
```javascript
POST /api/ai/generate-diagram
Body: { description, diagramId }
Response: { classes, relations }
```

#### Exportación
```javascript
POST /api/export/springboot
Body: { title, classes, relations }
Response: Binary ZIP file
```

### 12.2 WebSocket Events
```javascript
// Eventos del cliente al servidor
socket.emit('join-room', { diagramId, userId });
socket.emit('class-created', classData);
socket.emit('class-updated', { id, updates });
socket.emit('class-deleted', classId);
socket.emit('relation-created', relationData);

// Eventos del servidor al cliente
socket.on('diagram-update', (data) => {});
socket.on('user-joined', (userData) => {});
socket.on('user-left', (userId) => {});
socket.on('ai-generated', (aiData) => {});
```

---

## 13. GUÍAS DE DESARROLLO

### 13.1 Cómo Agregar un Nuevo Tipo de Relación
1. **Actualizar el componente AssociationRelation.js**:
```javascript
const RELATION_TYPES = {
  ASSOCIATION: 'association',
  COMPOSITION: 'composition',
  AGGREGATION: 'aggregation',
  GENERALIZATION: 'generalization',
  MANY_TO_MANY: 'many-to-many',
  DEPENDENCY: 'dependency' // Nuevo tipo
};
```

2. **Agregar botón en EditorDiagrama.js**:
```javascript
<Button $variant="secondary" id="crear-dependencia" onClick={() => { 
  setRelationType('Dependencia'); 
  setIsCreatingRelation(true); 
}}>
  <ArrowRight size={16} />
  Crear Dependencia
</Button>
```

3. **Actualizar el tour en TourGuide.js**:
```javascript
{
  element: '#crear-dependencia',
  popover: {
    title: '📋 Dependencia',
    description: 'La dependencia muestra que una clase necesita otra para funcionar.'
  }
}
```

### 13.2 Cómo Agregar una Nueva Funcionalidad de IA
1. **Extender aiService.js**:
```javascript
const generateCodeFromDiagram = async (diagramData) => {
  const response = await axios.post('/api/ai/generate-code', {
    diagram: diagramData,
    language: 'java'
  });
  
  return response.data.code;
};
```

2. **Integrar en AIAssistant.js**:
```javascript
const handleGenerateCode = async () => {
  const code = await generateCodeFromDiagram({ classes, relations });
  setGeneratedCode(code);
};
```

### 13.3 Cómo Implementar un Nuevo Formato de Exportación
1. **Crear servicio de exportación**:
```javascript
// services/exportService.js
const exportToPlantUML = (diagramData) => {
  let plantUML = '@startuml\n';
  
  diagramData.classes.forEach(cls => {
    plantUML += `class ${cls.name} {\n`;
    cls.attributes.forEach(attr => {
      plantUML += `  ${attr.name}: ${attr.type}\n`;
    });
    plantUML += '}\n';
  });
  
  plantUML += '@enduml';
  return plantUML;
};
```

2. **Agregar botón de exportación**:
```javascript
<Button $variant="secondary" onClick={exportToPlantUML}>
  <FileText size={16} />
  Exportar PlantUML
</Button>
```

---

## 14. TROUBLESHOOTING

### 14.1 Problemas Comunes

#### WebSocket no conecta
```javascript
// Verificar conexión
socket.on('connect', () => {
  console.log('Conectado al servidor');
});

socket.on('disconnect', () => {
  console.log('Desconectado del servidor');
});

socket.on('connect_error', (error) => {
  console.error('Error de conexión:', error);
});
```

#### IA no responde
```javascript
// Verificar API key y endpoint
const checkAIService = async () => {
  try {
    const response = await axios.get('/api/ai/health');
    console.log('IA Service:', response.data);
  } catch (error) {
    console.error('IA Service Error:', error);
  }
};
```

#### Sincronización de datos
```javascript
// Debug de sincronización
const debugSync = (event, data) => {
  console.log(`[SYNC] ${event}:`, data);
  console.log('Estado actual:', { classes: classes.length, relations: relations.length });
};
```

### 14.2 Logs de Debug
```javascript
// Habilitar logs detallados en desarrollo
if (process.env.NODE_ENV === 'development') {
  window.debugMode = true;
  
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    if (window.debugMode) {
      originalConsoleLog('[DEBUG]', ...args);
    }
  };
}
```

---

## 15. ROADMAP Y MEJORAS FUTURAS

### 15.1 Funcionalidades Pendientes
- [ ] **Historial de cambios**: Sistema de versionado de diagramas
- [ ] **Comentarios colaborativos**: Sistema de anotaciones
- [ ] **Plantillas predefinidas**: Diagramas de ejemplo
- [ ] **Validación automática**: Reglas de UML
- [ ] **Exportación a más formatos**: Mermaid, Draw.io
- [ ] **Modo offline**: Funcionalidad sin conexión
- [ ] **Notificaciones push**: Alertas en tiempo real
- [ ] **Dashboard analítico**: Métricas de uso

### 15.2 Optimizaciones Técnicas
- [ ] **Service Workers**: Cache inteligente
- [ ] **Virtual Scrolling**: Para diagramas grandes
- [ ] **WebAssembly**: Rendering optimizado
- [ ] **PWA**: Aplicación web progresiva
- [ ] **Microservicios**: Arquitectura distribuida

---

## 16. CONCLUSIÓN

Esta documentación técnica proporciona una guía completa para el desarrollo, mantenimiento y extensión del Editor de Diagramas UML Colaborativo. El sistema implementa todas las funcionalidades requeridas con tecnologías modernas y mejores prácticas de desarrollo.

### Características Destacadas:
- ✅ **Colaboración en tiempo real** con WebSockets
- ✅ **Asistente de IA** integrado con Gemini
- ✅ **Tour guiado** para onboarding de usuarios
- ✅ **Exportación automática** a Spring Boot
- ✅ **Arquitectura escalable** y mantenible
- ✅ **Estándares de código** consistentes
- ✅ **Documentación completa** para desarrolladores

El sistema está listo para producción y puede ser extendido fácilmente con nuevas funcionalidades siguiendo las guías establecidas en este documento.

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Mantenido por**: Equipo de Desarrollo
