// src/pages/Home.js
import React, { useState } from 'react';
import Modal from 'react-modal';
import Login from '../components/Login';
import Register from '../components/Register';

// Configuración del modal
Modal.setAppElement('#root');

const Home = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  // Función para abrir el modal y definir si es login o registro
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
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Bienvenido a la Aplicación de Diagramas</h1>
      {/* Botones separados para Login y Registro */}
      <button onClick={openLoginModal} style={{ marginRight: '10px' }}>
        Iniciar Sesión
      </button>
      <button onClick={openRegisterModal}>
        Registrarse
      </button>

      {/* Modal que cambia su contenido basado en el estado */}
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
          },
        }}
      >
        <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
        <button onClick={closeModal} style={{ float: 'right' }}>
          Cerrar
        </button>
        {/* Muestra Login o Register basado en isLogin */}
        {isLogin ? <Login /> : <Register />}
      </Modal>
    </div>
  );
};

export default Home;
