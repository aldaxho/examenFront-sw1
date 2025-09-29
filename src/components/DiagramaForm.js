import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const FormCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: #1a202c;
  margin-bottom: 24px;
  font-size: 1.8rem;
  font-weight: 700;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' && `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: rgba(255, 255, 255, 0.9);
    color: #4a5568;
    border: 1px solid rgba(0, 0, 0, 0.1);
    
    &:hover {
      background: white;
      transform: translateY(-1px);
    }
  `}
`;

const DiagramaForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cargarDiagrama = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3001/api/diagramas/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTitulo(response.data.titulo || '');
      setDescripcion(response.data.descripcion || '');
    } catch (error) {
      console.error('Error al cargar diagrama:', error);
      setError('Error al cargar el diagrama');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isEditing) {
      cargarDiagrama();
    }
  }, [id, isEditing, cargarDiagrama]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!titulo.trim()) {
      setError('El título es requerido');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const data = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        contenido: { classes: [], relations: [] }
      };

      if (isEditing) {
        await axios.put(`http://localhost:3001/api/diagramas/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        const response = await axios.post('http://localhost:3001/api/diagramas', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Redirigir al editor del nuevo diagrama
        navigate(`/editor-diagrama/${response.data.id}`);
        return;
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error al guardar diagrama:', error);
      setError('Error al guardar el diagrama');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  if (loading && isEditing) {
    return (
      <FormContainer>
        <FormCard>
          <div style={{ textAlign: 'center' }}>
            <h3>Cargando diagrama...</h3>
          </div>
        </FormCard>
      </FormContainer>
    );
  }

  return (
    <FormContainer>
      <FormCard>
        <Title>
          {isEditing ? 'Editar Diagrama' : 'Crear Nuevo Diagrama'}
        </Title>
        
        {error && (
          <div style={{ 
            background: '#fed7d7', 
            color: '#c53030', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="titulo">Título del Diagrama</Label>
            <Input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ingrese el título del diagrama"
              disabled={loading}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <TextArea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ingrese una descripción del diagrama"
              disabled={loading}
            />
          </FormGroup>
          
          <ButtonGroup>
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </Button>
          </ButtonGroup>
        </form>
      </FormCard>
    </FormContainer>
  );
};

export default DiagramaForm;
