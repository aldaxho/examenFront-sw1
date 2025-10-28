// Configuración simple de la API
const API_CONFIG = {
  // URL base del backend - CAMBIAR AQUÍ PARA CAMBIAR EL SERVIDOR
  BASE_URL: 'http://localhost:3001',//'https://157-245-1-74.sslip.io',
  WS_URL: 'ws://localhost:3001',//'wss://157-245-1-74.sslip.io',
  
  // Función helper para construir URLs completas
  getUrl: (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`,
};

export default API_CONFIG;