// src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate


const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate(); // Inicializar useNavigate


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        correo,
        contraseña,
      });
      localStorage.setItem('token', response.data.token);
      // Guardar el token en sessionStorage
      sessionStorage.setItem('token', response.data.token);
      alert('Inicio de sesión exitoso');
      setMensaje('Inicio de sesión exitoso');
      // Redirigir al dashboard o vista principal
      navigate('/dashboard');
    } catch (error) {
      alert('Error al iniciar sesión: ' + error.response.data.mensaje);
      setMensaje(error.response.data.mensaje || 'Error al iniciar sesión.');
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Correo:</label>
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
        </div>
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
};

export default Login;
