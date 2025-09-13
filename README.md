# 🎨 Editor de Diagramas UML Colaborativo con IA

Un editor de diagramas UML moderno, colaborativo y asistido por IA construido con React, Node.js y tecnologías de vanguardia.

## ✨ Características Principales

### 🎯 **Editor Visual Avanzado**
- **Editor de diagramas UML** con persistencia en tiempo real
- **Navegación independiente** del canvas (Ctrl + Scroll para zoom, Ctrl + Click para pan)
- **Canvas ampliado** para evitar recorte de flechas y relaciones
- **Botón "Centrar"** para organizar automáticamente las clases
- **Interfaz moderna** con iconos Lucide React

### 👥 **Colaboración en Tiempo Real**
- **Múltiples usuarios** pueden trabajar simultáneamente
- **Sistema de invitaciones** con códigos únicos
- **Permisos granulares** (propietario/editor/lector)
- **Panel de colaboración unificado** con fondo sólido
- **Sincronización instantánea** de cambios

### 🤖 **Asistente IA Integrado**
- **Chat contextual** que entiende el diagrama actual
- **Modificaciones automáticas** aplicadas en tiempo real
- **Generación de diagramas** desde descripción natural
- **Análisis inteligente** de relaciones y patrones
- **Integración con DigitalOcean Agents** (GPT-4o compatible)

### 🚀 **Generación Automática de Backends**
- **Spring Boot completo** generado automáticamente
- **Detección automática de Foreign Keys**
- **CRUD completo** para cada tabla
- **Seeders automáticos** para pruebas
- **Swagger UI** habilitado
- **Base de datos H2** para desarrollo

## 🛠️ Tecnologías

### **Frontend**
- **React** - Framework de UI
- **Styled Components** - CSS-in-JS para estilos
- **Lucide React** - Iconos modernos
- **Socket.IO Client** - Comunicación en tiempo real
- **Axios** - Cliente HTTP
- **React Router DOM** - Navegación

### **Backend** (Requerido)
- **Node.js** + Express.js
- **PostgreSQL** con Sequelize ORM
- **Socket.IO** para tiempo real
- **JWT** para autenticación
- **DigitalOcean Agents** para IA
- **OpenAPI Generator** para Spring Boot

## 🚀 Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- npm o yarn
- Backend configurado (ver sección API)

### Instalación del Frontend

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd examenFront-sw1

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

El frontend estará disponible en `http://localhost:3000`

## 🏗️ Estructura del Proyecto

```
src/
├── components/              # Componentes reutilizables
│   ├── ClassComponent.js        # Componente de clase UML
│   ├── AssociationRelation.js   # Componente de relación
│   ├── AIAssistant.js           # Panel de chat con IA
│   ├── Login.js                 # Componente de login
│   └── Register.js              # Componente de registro
├── pages/                   # Páginas principales
│   ├── Home.js                  # Página de inicio
│   ├── Dashboard.js             # Panel de control
│   ├── EditorDiagrama.js        # Editor principal
│   └── EditorDiagrama.styles.js # Estilos del editor
├── services/                # Servicios y utilidades
│   ├── apiConfig.js             # Configuración de API
│   └── aiService.js             # Servicio de IA
└── index.js                 # Punto de entrada
```

## 🎯 Uso

### **1. Crear y Editar Diagramas**
1. **Crear un nuevo diagrama**: Haz clic en "Nuevo Diagrama"
2. **Agregar clases**: Usa el botón "+" para agregar nuevas clases
3. **Crear relaciones**: Conecta las clases arrastrando entre ellas
4. **Navegar el canvas**: 
   - `Ctrl + Scroll` para zoom independiente
   - `Ctrl + Click` para pan
   - Botón "Centrar" para organizar automáticamente
5. **Guardar**: Usa Ctrl+S o el botón "Guardar"

### **2. Colaboración**
1. **Generar código de invitación**: Botón "Ver Colaboradores"
2. **Compartir código**: Copiar y enviar el código generado
3. **Aceptar invitaciones**: En el Dashboard, usar el código recibido
4. **Ver usuarios activos**: Panel de colaboración unificado

### **3. Asistente IA**
1. **Abrir chat**: Botón flotante de IA
2. **Chat contextual**: La IA entiende el diagrama actual
3. **Modificaciones automáticas**: Los cambios se aplican en tiempo real
4. **Generar diagramas**: Describir en lenguaje natural

### **4. Generar Backend**
1. **Crear diagrama UML** completo
2. **Hacer clic** en "Generar Backend"
3. **Descargar ZIP** con proyecto Spring Boot
4. **Ejecutar**: `mvnw.cmd spring-boot:run -DskipTests`

## 📋 API del Backend

### **🔐 Autenticación**
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión

### **📊 Diagramas**
- `GET /api/diagramas` - Obtener diagramas del usuario
- `POST /api/diagramas` - Crear nuevo diagrama
- `GET /api/diagramas/:id` - Obtener diagrama específico
- `PUT /api/diagramas/:id` - Actualizar diagrama
- `DELETE /api/diagramas/:id` - Eliminar diagrama

### **👥 Invitaciones y Colaboración**
- `POST /api/invitations/:diagramId/invitations` - Generar código de invitación
- `GET /api/invitations/code/:codigoInvitacion` - Validar código
- `POST /api/invitations/accept` - Aceptar invitación
- `GET /api/invitations/invitados` - Diagramas donde soy invitado
- `GET /api/invitations/:id/users` - Lista usuarios del diagrama
- `PUT /api/invitations/:id/permissions` - Cambiar permisos
- `DELETE /api/invitations/:id/users` - Eliminar usuario

### **🤖 Asistente IA**
- `POST /api/assistant/analyze` - Análisis general y chat libre
- `POST /api/assistant/chat/:diagramId` - Chat contextual con aplicación automática

### **🚀 Generación de Backends**
- `POST /api/openapi/generate-backend/:id` - Generar Spring Boot completo

### **🔄 WebSocket Events**
- `join-room` - Unirse a una sala
- `diagram-updated` - Diagrama actualizado
- `agent-update` - Actualización automática por IA
- `class-added/updated/deleted` - Cambios en clases
- `relation-added/updated/deleted` - Cambios en relaciones
- `user-joined/left` - Usuarios conectados

## 🔧 Desarrollo

### Scripts disponibles

```bash
npm start          # Inicia el servidor de desarrollo
npm run build      # Construye para producción
npm test           # Ejecuta las pruebas
npm run lint       # Ejecuta el linter
npm run lint:fix   # Corrige errores de linting
npm run analyze    # Analiza el bundle
```

### Configuración de API

El archivo `src/services/apiConfig.js` centraliza la configuración:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3001',
  getUrl: (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`
};
```

## 🎨 Características del Editor

### **Navegación del Canvas**
- **Zoom independiente**: `Ctrl + Scroll` (no afecta el zoom del navegador)
- **Pan del canvas**: `Ctrl + Click` y arrastrar
- **Centrado automático**: Botón "Centrar" para organizar clases
- **Canvas ampliado**: SVG extendido para evitar recorte de flechas

### **Panel de Colaboración**
- **Diseño unificado**: Fondo sólido con efecto de desenfoque
- **Sección de usuarios**: Lista de colaboradores con permisos
- **Código de invitación**: Caja destacada para fácil lectura
- **Botones organizados**: Copiar, invalidar, generar código

### **Asistente IA**
- **Chat contextual**: Entiende el estado actual del diagrama
- **Modificaciones automáticas**: Aplica cambios en tiempo real
- **Botón flotante**: Acceso rápido desde cualquier parte
- **Sincronización**: Todos los colaboradores ven los cambios de IA

## 🐛 Solución de Problemas

### **Problemas comunes**

1. **Error 500 al aceptar invitaciones**
   - ✅ **Resuelto**: El backend maneja conflictos de restricción única
   - **Solución**: Usar códigos de invitación únicos

2. **Errores de webpack con iconos**
   - ✅ **Resuelto**: Iconos Lucide React corregidos
   - **Solución**: Usar nombres correctos de iconos

3. **Canvas limitado**
   - ✅ **Resuelto**: SVG ampliado para evitar recorte
   - **Solución**: Canvas extendido con márgenes

4. **Elementos flotando**
   - ✅ **Resuelto**: Panel de colaboración con fondo sólido
   - **Solución**: Diseño unificado con backdrop blur

### **Logs de depuración**

- **Frontend**: Consola del navegador
- **Backend**: Terminal del servidor
- **WebSocket**: Eventos en tiempo real
- **IA**: Respuestas del asistente

## 🚀 Generación de Backend Spring Boot

### **Características del Backend Generado**
- **Framework**: Spring Boot 2.6.2 con Java 11
- **Base de datos**: H2 para desarrollo (configurable a PostgreSQL)
- **Arquitectura**: API REST con patrón MVC
- **Documentación**: Swagger UI automático
- **Autenticación**: JWT incluida
- **CRUD completo**: Para todas las entidades

### **Estructura del Proyecto Generado**
```
spring-backend-simple-{timestamp}/
├── src/main/java/com/example/demo/
│   ├── DemoApplication.java      # Clase principal
│   ├── entity/                   # Entidades JPA
│   ├── repository/               # Repositorios
│   ├── service/                  # Servicios
│   └── controller/               # Controladores REST
├── pom.xml                       # Dependencias Maven
├── mvnw                          # Maven Wrapper
└── README.md                     # Instrucciones
```

### **Ejecutar el Backend Generado**
```bash
# Extraer el ZIP descargado
# Abrir terminal en el directorio del proyecto
mvnw.cmd spring-boot:run -DskipTests

# Esperar: "Started SpringBackendApp in X.XXX seconds"
# Abrir: http://localhost:8080/swagger-ui.html
```

## 🎉 Casos de Uso Ideales

### **🎓 Educación**
- Enseñanza interactiva de patrones de diseño
- Colaboración en tiempo real entre estudiantes
- Generación automática de código desde diagramas

### **⚡ Prototipado**
- De idea a MVP funcional en minutos
- Iteración rápida con sugerencias de IA
- Demos interactivas con clientes

### **🏢 Empresas**
- Arquitectura colaborativa asistida por IA
- Documentación automática de sistemas
- Generación de backends enterprise-grade

### **🚀 Startups**
- Desarrollo ágil con IA
- Prototipado rápido de modelos de datos
- Colaboración distribuida en tiempo real

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

Si tienes problemas o preguntas, por favor abre un issue en el repositorio.

---

## 🎯 **¡El Futuro del Desarrollo Colaborativo con IA!**

Este proyecto combina **IA, colaboración en tiempo real y generación de código** para crear la primera plataforma de desarrollo no-code asistida por IA, donde:

1. **💭 Usuario describe** lo que necesita en lenguaje natural
2. **🤖 IA genera** el diagrama UML automáticamente  
3. **👥 Equipo colabora** en tiempo real con modificaciones de IA
4. **⚡ IA aplica cambios** instantáneamente mientras todos observan
5. **📦 Backend Spring Boot** se genera con un clic
6. **🎯 Proyecto completo** listo para producción

**¡La nueva era del desarrollo colaborativo asistido por IA ya está aquí!** 🚀🤖