import React, { useState } from 'react';
import Modal from 'react-modal';
import Login from '../components/Login';
import Register from '../components/Register';
import styled from 'styled-components';

// Configuración del modal
Modal.setAppElement('#root');

// Estilos usando styled-components
const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: url('https://th.bing.com/th/id/OIP.kGZ7qMkavoObEfsoD-u4mgHaGK?rs=1&pid=ImgDetMain') no-repeat center center fixed; /* Cambia la URL por la de tu imagen */
  background-size: cover;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: #fff; /* Cambiar a blanco para que sea visible sobre el fondo */
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7); /* Sombra para mejor legibilidad */
`;

const ButtonGroup = styled.div`
  margin-top: 20px;
`;

const Button = styled.button`
  background-color: #007BFF;
  color: white;
  border: none;
  padding: 10px 20px;
  margin: 0 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }
`;

const ModalHeader = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
`;

const Home = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const openLoginModal = () => {
    setIsLogin(true);
    setModalIsOpen(true);
  };

  const openRegisterModal = () => {
    setIsLogin(false);
    setModalIsOpen(true);
  };

  const closeModal = () => setModalIsOpen(false);

  return (
    <HomeContainer>
      <Title>Bienvenido a mi Editor de Diagramas Online</Title>
      <ButtonGroup>
        <Button onClick={openLoginModal}>Iniciar Sesión</Button>
        <Button onClick={openRegisterModal}>Registrarse</Button>
      </ButtonGroup>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            padding: '40px',
            borderRadius: '10px',
            width: '400px',
          },
        }}
      >
        <ModalHeader>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</ModalHeader>
        <CloseButton onClick={closeModal}>✖</CloseButton>
        {isLogin ? <Login /> : <Register />}
      </Modal>
    </HomeContainer>
  );
};

export default Home;
