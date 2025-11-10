// Configuración simple de la API
const API_CONFIG = {
  // URL base del backend - CAMBIAR AQUÍ PARA CAMBIAR EL SERVIDOR
  BASE_URL: 'https://138-197-38-159.sslip.io',//'https://157-245-1-74.sslip.io',
  WS_URL: 'wss://138-197-38-159.sslip.io',//'wss://157-245-1-74.sslip.io',
  
  // Función helper para construir URLs completas
  getUrl: (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`,
};

export default API_CONFIG;