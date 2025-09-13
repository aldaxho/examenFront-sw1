import React, { useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { User, Mail, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
import API_CONFIG from '../services/apiConfig';

// Estilos usando styled-components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
  padding: 20px;
  position: relative;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(120, 119, 198, 0.02) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Form = styled.form`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 50px;
  width: 100%;
  max-width: 480px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  transition: all 0.4s ease;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 
      0 30px 60px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  text-align: center;
  margin-bottom: 40px;
  background: linear-gradient(135deg, #ffffff 0%, #a8a8ff 50%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.02em;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 32px;
  position: relative;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: #fff;
  font-size: 1rem;
  font-family: 'Inter', sans-serif;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 18px;
  z-index: 2;
  color: rgba(255, 255, 255, 0.6);
  transition: color 0.3s ease;
`;

const Input = styled.input`
  width: 100%;
  padding: 18px 20px 18px 50px;
  background: rgba(255, 255, 255, 0.06);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  font-size: 1.1rem;
  color: #fff;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  font-family: 'Inter', sans-serif;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 0 0 4px rgba(102, 126, 234, 0.1),
      0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }

  &:focus + ${InputIcon} {
    color: #667eea;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 18px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  z-index: 2;

  &:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  transition: all 0.3s ease;
  margin-top: 20px;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.01em;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    transition: left 0.5s;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 
      0 12px 35px rgba(102, 126, 234, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }
`;

const Message = styled.div`
  margin-top: 24px;
  padding: 16px 20px;
  border-radius: 12px;
  font-weight: 600;
  text-align: center;
  font-family: 'Inter', sans-serif;
  background: ${(props) => (props.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)')};
  color: ${(props) => (props.error ? '#f87171' : '#10B981')};
  border: 1px solid ${(props) => (props.error ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)')};
  backdrop-filter: blur(10px);
`;

const Register = () => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_CONFIG.getUrl('/api/auth/register'), {
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
      <Form onSubmit={handleRegister}>
        <Title>Crear Cuenta</Title>
        
        <FormGroup>
          <Label>Nombre completo</Label>
          <InputContainer>
            <Input
              type="text"
              placeholder="Tu nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <InputIcon>
              <User size={20} />
            </InputIcon>
          </InputContainer>
        </FormGroup>
        
        <FormGroup>
          <Label>Correo electrónico</Label>
          <InputContainer>
            <Input
              type="email"
              placeholder="tu@email.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
          </InputContainer>
        </FormGroup>
        
        <FormGroup>
          <Label>Contraseña</Label>
          <InputContainer>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Crea una contraseña segura"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
            />
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </PasswordToggle>
          </InputContainer>
        </FormGroup>
        
        <Button type="submit">
          <UserPlus size={20} style={{ marginRight: '10px' }} />
          Registrarse
        </Button>
        
        {mensaje && (
          <Message error={mensaje.includes('Error')}>
            {mensaje}
          </Message>
        )}
      </Form>
    </Container>
  );
};

export default Register;
