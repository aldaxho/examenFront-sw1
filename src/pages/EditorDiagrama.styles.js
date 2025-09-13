import styled from 'styled-components';

export const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg,rgb(9, 9, 9) 0%,rgb(23, 23, 24) 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  position: relative;
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: visible;
  min-height: 40px; /* Reducido para dar más espacio al canvas */
`;

export const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
`;

export const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 99;
  gap: 8px;
  flex-wrap: wrap;
  row-gap: 6px;
  min-height: 50px; /* Reducido para dar más espacio al canvas */

  .toolbar-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    overscroll-behavior: contain;
    padding-bottom: 4px;
  }
`;

export const ToolbarGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => !['variant'].includes(prop),
})`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  ${props => props.$variant === 'primary' && `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  `}
  
  ${props => props.$variant === 'secondary' && `
    background: rgba(255, 255, 255, 0.9);
    color: #4a5568;
    border: 1px solid rgba(0, 0, 0, 0.1);
    
    &:hover {
      background: white;
      transform: translateY(-1px);
    }
  `}

  ${props => props.$variant === 'danger' && `
    background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(245, 101, 101, 0.4);
    }
  `}

  ${props => props.$variant === 'success' && `
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
    }
  `}

  ${props => props.$variant === 'warning' && `
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
    }
  `}
`;

export const DiagramWrapper = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 400px; /* Asegura visibilidad del área del diagrama */
`;

export const CanvasContainer = styled.div`
  position: relative;
  flex: 1;
  overflow: hidden;          /* CLAVE: corta lo que se sale */
  overscroll-behavior: none; /* no propaga el scroll al body */
  touch-action: none;        /* evita gestos por defecto */
  cursor: ${props => props.$isCreatingRelation ? 'crosshair' : 'default'};
  /* Fondo uniforme oscuro con grid extendido */
  background: #0f1117;
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.3) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 200px 200px, 200px 200px, 50px 50px, 50px 50px;
  background-position: 0 0, 0 0, 0 0, 0 0;
  min-height: 85vh; /* Ampliado para ocupar más espacio hacia abajo */
  height: calc(100vh - 100px); /* Altura fija para ocupar casi toda la pantalla */
`;

export const ZoomableCanvas = styled.div`
  width: 100%;
  height: 100%;
  transform-origin: 0 0;
  transition: transform 0.1s ease;
  position: relative;
  will-change: transform;
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

export const UsersList = styled.div`
  position: absolute;
  top: 120px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  max-width: 280px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;

  h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #2d3748;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    &:last-child {
      border-bottom: none;
    }

    span {
      font-size: 13px;
      color: #4a5568;
    }

    .badge {
      background: #e2e8f0;
      color: #2d3748;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
    }
  }
`;

export const InvitationCode = styled.div`
  position: absolute;
  top: 120px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  max-width: 320px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  z-index: 1000;

  p {
    margin: 0 0 12px 0;
    font-size: 13px;
    color: #2d3748;
    font-weight: 500;
  }

  div {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
`;

export const CollaborationPanel = styled.div`
  position: absolute;
  top: 120px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 50;
  max-width: 350px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1a202c;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .users-section {
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);

      &:last-child {
        border-bottom: none;
      }

      span {
        font-size: 0.9rem;
        color: #4a5568;
      }

      .badge {
        background: #667eea;
        color: white;
        padding: 4px 8px;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 500;
      }
    }
  }

  .invitation-section {
    padding-top: 16px;
    border-top: 1px solid rgba(0, 0, 0, 0.1);

    p {
      margin: 0 0 12px 0;
      font-size: 0.9rem;
      color: #4a5568;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .code-display {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      font-family: 'Courier New', monospace;
      font-size: 0.9rem;
      color: #495057;
      word-break: break-all;
    }

    .button-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  }
`;
