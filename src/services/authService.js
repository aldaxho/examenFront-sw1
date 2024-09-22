// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth/';

export const login = (correo, contraseña) => {
  return axios.post(`${API_URL}login`, { correo, contraseña });
};

export const register = (nombre, correo, contraseña) => {
  return axios.post(`${API_URL}register`, { nombre, correo, contraseña });
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};
