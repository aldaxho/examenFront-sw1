// src/components/DiagramaTituloModal.js
import React, { useState } from 'react';
import Modal from 'react-modal';

// Configuración del modal
Modal.setAppElement('#root');

const DiagramaTituloModal = ({ isOpen, onClose, onSave }) => {
  const [titulo, setTitulo] = useState('');

  const handleSave = () => {
    if (titulo.trim()) {
      onSave(titulo); // Enviar el título ingresado
      onClose(); // Cerrar el modal después de guardar
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
          padding: '40px',
        },
      }}
    >
      <h2>Ingrese el Título del Diagrama</h2>
      <input
        type="text"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título del diagrama"
        required
        style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
      />
      <button onClick={handleSave} style={{ marginRight: '10px' }}>Guardar</button>
      <button onClick={onClose}>Cancelar</button>
    </Modal>
  );
};

export default DiagramaTituloModal;
