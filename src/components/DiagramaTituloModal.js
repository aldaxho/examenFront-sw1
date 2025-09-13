// src/components/DiagramaTituloModal.js
import React, { useState } from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';
import { FileText, X, Save } from 'lucide-react';

// Configuración del modal
Modal.setAppElement('#root');

// Estilos usando styled-components
const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 40px 30px;
  width: 100%;
  max-width: 480px;
  min-width: 320px;
  max-height: 80vh;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
  margin: 0 auto;
  box-sizing: border-box;
  animation: modalSlideIn 0.3s ease-out;
  
  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  
  @media (max-width: 768px) {
    max-width: 400px;
    min-width: 280px;
    padding: 30px 20px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    max-width: calc(100vw - 40px);
    min-width: calc(100vw - 40px);
    padding: 25px 15px;
    border-radius: 12px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: #fff;
  text-align: center;
  margin-bottom: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #a8a8ff 50%, #ffffff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.02em;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  line-height: 1.3;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
    margin-bottom: 16px;
    gap: 6px;
    flex-direction: column;
  }
  
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
    
    @media (max-width: 480px) {
      width: 40px;
      height: 3px;
      bottom: -8px;
    }
  }
`;

const InputContainer = styled.div`
  position: relative;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  outline: none;

  &:focus {
    border-color: #667eea;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 0 0 4px rgba(102, 126, 234, 0.1),
      0 8px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  &:focus + ${InputIcon} {
    color: #667eea;
    transform: scale(1.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.6);
    font-weight: 400;
    transition: color 0.3s ease;
  }

  &:focus::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  &:invalid {
    border-color: rgba(239, 68, 68, 0.5);
  }

  &:valid {
    border-color: rgba(16, 185, 129, 0.5);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const Button = styled.button`
  padding: 16px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.01em;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 25px rgba(102, 126, 234, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
  justify-content: center;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    transition: left 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 35px rgba(102, 126, 234, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    
    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(0);
    box-shadow: 
      0 4px 15px rgba(102, 126, 234, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    
    &:hover {
      transform: none;
      box-shadow: 
        0 8px 25px rgba(102, 126, 234, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }
  }
`;

const CancelButton = styled(Button)`
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

  &:active {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 
      0 4px 15px rgba(0, 0, 0, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    transform: scale(1.1) rotate(90deg);
  }

  &:active {
    transform: scale(0.95) rotate(90deg);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ErrorMessage = styled.div`
  color: #f87171;
  font-size: 0.9rem;
  margin-top: 8px;
  text-align: center;
  font-weight: 500;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  
  &.show {
    opacity: 1;
    transform: translateY(0);
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const DiagramaTituloModal = ({ isOpen, onClose, onSave }) => {
  const [titulo, setTitulo] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!titulo.trim()) {
      setError('Por favor ingresa un nombre para el diagrama');
      return;
    }

    if (titulo.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave(titulo.trim());
      setTitulo('');
      onClose();
    } catch (err) {
      setError('Error al crear el diagrama. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSave();
    }
  };

  const handleInputChange = (e) => {
    setTitulo(e.target.value);
    if (error) setError('');
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitulo('');
      setError('');
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
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
          width: 'fit-content',
          maxWidth: '90vw',
          minWidth: '300px',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          overflow: 'visible',
          zIndex: 1001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      }}
    >
      <ModalContent>
        <CloseButton onClick={handleClose} disabled={isLoading}>
          <X size={20} />
        </CloseButton>
        
        <Title>
          <FileText size={24} />
          Crear Nuevo Diagrama
        </Title>
        
        <InputContainer>
          <Input
            type="text"
            value={titulo}
            onChange={handleInputChange}
            placeholder="Ingresa el nombre del diagrama"
            required
            onKeyPress={handleKeyPress}
            autoFocus
            disabled={isLoading}
            maxLength={50}
          />
          <InputIcon>
            <FileText size={20} />
          </InputIcon>
        </InputContainer>
        
        {error && (
          <ErrorMessage className="show">
            {error}
          </ErrorMessage>
        )}
        
        <ButtonGroup>
          <Button onClick={handleSave} disabled={isLoading || !titulo.trim()}>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <Save size={18} />
            )}
            {isLoading ? 'Creando...' : 'Crear Diagrama'}
          </Button>
          <CancelButton onClick={handleClose} disabled={isLoading}>
            <X size={18} />
            Cancelar
          </CancelButton>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};

export default DiagramaTituloModal;