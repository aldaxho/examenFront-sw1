import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

// Estilos usando styled-components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 2rem;
  color: #333;
  margin-bottom: 20px;
`;

const Form = styled.form`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  max-width: 400px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.3s;

  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
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

const Message = styled.p`
  margin-top: 15px;
  color: ${(props) => (props.error ? 'red' : 'green')};
`;

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        correo,
        contraseña,
      });
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        sessionStorage.setItem('token', response.data.token);
        setMensaje('Inicio de sesión exitoso');
        navigate('/dashboard');
      } else {
        setMensaje('Error en la respuesta del servidor.');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.mensaje || 'Error al iniciar sesión.';
      setMensaje(errorMsg);
    }
  };

  return (
    <Container>
      <Title>Iniciar Sesión</Title>
      <Form onSubmit={handleLogin}>
        <FormGroup>
          <Label>Correo:</Label>
          <Input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>Contraseña:</Label>
          <Input
            type="password"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
        </FormGroup>
        <Button type="submit">Ingresar</Button>
      </Form>
      {mensaje && <Message error={mensaje.includes('Error')}>{mensaje}</Message>}
    </Container>
  );
};

export default Login;
