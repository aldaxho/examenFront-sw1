import React, { useState } from 'react';
import Modal from 'react-modal';
import Login from '../components/Login';
import Register from '../components/Register';
import styled from 'styled-components';
import { LogIn, UserPlus, Sparkles, ArrowRight } from 'lucide-react';

// Configuración del modal
Modal.setAppElement('#root');

// Estilos usando styled-components
const HomeContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%);
  padding: 40px 20px;
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
      radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(120, 119, 198, 0.03) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.02) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const Content = styled.div`
  text-align: center;
  max-width: 800px;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  color: #fff;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #a8a8ff 50%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.03em;
  line-height: 1.1;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 2px;
  }
`;

const Subtitle = styled.p`
  font-size: 1.4rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 50px;
  font-weight: 500;
  line-height: 1.6;
  font-family: 'Inter', sans-serif;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 20px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 700;
  transition: all 0.3s ease;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.01em;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  
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

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 
      0 12px 35px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
`;

const Features = styled.div`
  margin-top: 80px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 32px;
  max-width: 1000px;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-8px);
    box-shadow: 
      0 20px 40px rgba(0, 0, 0, 0.25),
      0 0 0 1px rgba(255, 255, 255, 0.1);
    
    &::before {
      transform: scaleX(1);
    }
  }
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: white;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;
  font-family: 'Inter', sans-serif;
`;

const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
  line-height: 1.6;
  font-family: 'Inter', sans-serif;
`;

const ModalContent = styled.div`
  background: transparent;
  border: none;
  padding: 0;
  max-width: 500px;
  width: 100%;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  z-index: 10;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    transform: scale(1.1);
  }
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
      <Content>
        <Title>Editor de Diagramas UML</Title>
        <Subtitle>
          Crea diagramas profesionales de forma colaborativa y en tiempo real
        </Subtitle>
        
        <ButtonGroup>
          <Button onClick={openLoginModal}>
            <LogIn size={24} />
            Iniciar Sesión
          </Button>
          <SecondaryButton onClick={openRegisterModal}>
            <UserPlus size={24} />
            Crear Cuenta
          </SecondaryButton>
        </ButtonGroup>

        <Features>
          <FeatureCard>
            <FeatureIcon>
              <Sparkles size={24} />
            </FeatureIcon>
            <FeatureTitle>Diseño Intuitivo</FeatureTitle>
            <FeatureDescription>
              Interfaz moderna y fácil de usar para crear diagramas UML profesionales sin complicaciones.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <ArrowRight size={24} />
            </FeatureIcon>
            <FeatureTitle>Colaboración en Tiempo Real</FeatureTitle>
            <FeatureDescription>
              Trabaja junto con tu equipo en el mismo diagrama con actualizaciones instantáneas.
            </FeatureDescription>
          </FeatureCard>
          
          <FeatureCard>
            <FeatureIcon>
              <Sparkles size={24} />
            </FeatureIcon>
            <FeatureTitle>IA Integrada</FeatureTitle>
            <FeatureDescription>
              Asistente inteligente que te ayuda a crear y mejorar tus diagramas automáticamente.
            </FeatureDescription>
          </FeatureCard>
        </Features>
      </Content>

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
            padding: '0',
            borderRadius: '0',
            width: 'auto',
            maxWidth: '500px',
            background: 'transparent',
            border: 'none',
            boxShadow: 'none',
            overflow: 'visible',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
          }
        }}
      >
        <ModalContent>
          <CloseButton onClick={closeModal}>×</CloseButton>
          {isLogin ? <Login /> : <Register />}
        </ModalContent>
      </Modal>
    </HomeContainer>
  );
};

export default Home;
