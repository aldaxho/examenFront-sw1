import React, { useState } from 'react';
import axios from 'axios';
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

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        nombre,
        correo,
        contraseña,
      });
      setMensaje('Registro exitoso. Ahora puedes iniciar sesión.');
    } catch (error) {
      setMensaje(error.response.data.mensaje || 'Error al registrar el usuario.');
    }
  };

  return (
    <Container>
      <Title>Registrarse</Title>
      <Form onSubmit={handleRegister}>
        <FormGroup>
          <Label>Nombre:</Label>
          <Input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </FormGroup>
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
        <Button type="submit">Registrarse</Button>
      </Form>
      {mensaje && <Message error={mensaje.includes('Error')}>{mensaje}</Message>}
    </Container>
  );
};

export default Register;
