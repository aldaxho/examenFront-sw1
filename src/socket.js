// src/socket.js
import io from 'socket.io-client';

// Cambia la URL al puerto correcto donde corre tu backend
const socket = io('http://localhost:3001', {
  withCredentials: true,
  extraHeaders: {
    'my-custom-header': 'abcd'
  },
  path : '/socket.io'
});

export default socket;
