import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Plus, Edit3, GripVertical, Settings } from 'lucide-react';

const ClassContainer = styled.div`
  position: absolute;
  background: #2d3748;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  width: 300px;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  border: 2px solid #ffffff;
  transition: ${props => props.$isDragging ? 'none' : 'all 0.2s ease'};
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  z-index: ${props => props.$isDragging ? 1000 : 10};
  cursor: ${props => props.$isDragging ? 'grabbing' : 'grab'};
  will-change: ${props => props.$isDragging ? 'transform' : 'auto'};

  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    border-color: #667eea;
  }

  ${props => props.$isSelected && `
    border-color: #10B981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
    transform: scale(1.02);
  `}

  ${props => props.$isDragging && `
    transform: scale(1.05) rotate(1deg);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
    border-color: #667eea;
  `}
`;

const ClassHeader = styled.div`
  background: #4a5568;
  color: white;
  padding: 16px;
  text-align: center;
  position: relative;
  cursor: move;
  user-select: none;
  -webkit-user-select: none;
  border-radius: 6px 6px 0 0;

  h4 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    color: white;
  }

  input {
    width: 90%;
    padding: 8px 12px;
    border: none;
    border-radius: 8px;
    font-size: 1.2rem;
    font-weight: 600;
    background: rgba(255, 255, 255, 0.9);
    color: #1a202c;
    text-align: center;

    &:focus {
      outline: none;
      background: white;
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.3);
    }
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  right: 12px;
  top: 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  padding: 0;
  border-radius: 0;
  transition: color 0.2s ease, transform 0.2s ease;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #EF4444;
    transform: scale(1.05);
  }
`;

const Section = styled.div`
  padding: 16px;
  border-bottom: 1px solid #4a5568;
  background: #2d3748;

  &:last-child {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h5`
  margin: 0 0 12px 0;
  color: white;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 8px;

  i {
    font-size: 12px;
  }
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 8px 0;
  position: relative;
  border-radius: 8px;
  transition: background-color 0.2s ease;

  &:hover {
    background: rgba(102, 126, 234, 0.1);
  }

  input {
    flex: 1;
    padding: 8px 12px;
    border: 2px solid #4a5568;
    border-radius: 8px;
    font-size: 0.9rem;
    background: #1a202c;
    color: white;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      color: #94a3b8;
      font-style: italic;
    }
  }
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  width: 100%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  i {
    font-size: 14px;
  }
`;

const RemoveButton = styled.button`
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  border: none;
  border-radius: 6px;
  padding: 0;
  margin-left: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 800;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease, transform 0.2s ease;

  &:hover {
    color: #EF4444;
    transform: scale(1.05);
  }
`;

const DragHandle = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  opacity: 0.8;
  transition: all 0.3s ease;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.5);
  }

  i {
    font-size: 10px;
    color: white;
  }
`;

const ClassComponent = ({
  id,
  className,
  x,
  y,
  attributes = [],
  methods = [],
  onPositionChange,
  onUpdate,
  onDelete,
  onSelect,
  $isSelected,
  socket,
  idDiagrama
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(className);
  const [localAttributes, setLocalAttributes] = useState(attributes);
  const [localMethods, setLocalMethods] = useState(methods);
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingAnyField, setIsEditingAnyField] = useState(false);
  const rafIdRef = useRef(null);
  const pendingPosRef = useRef(null);

  useEffect(() => {
    setName(className);
  }, [className]);

  useEffect(() => {
    setLocalAttributes(attributes);
  }, [attributes]);

  useEffect(() => {
    setLocalMethods(methods);
  }, [methods]);

  const handleMouseDown = (e) => {
    if (e.button === 0 && !isEditingAnyField) {
      e.preventDefault();
      e.stopPropagation();
      
      // Calcular offset basado en la posición actual de la clase
      const offsetX = e.clientX - x;
      const offsetY = e.clientY - y;
      
      setIsDragging(true);
      
      onSelect && onSelect();
      
      const handleMouseMove = (e) => {
        e.preventDefault();
        
        // Calcular nueva posición basada en el offset inicial
        const newX = e.clientX - offsetX;
        const newY = e.clientY - offsetY;
        
        // Throttle con requestAnimationFrame para suavizar arrastre
        pendingPosRef.current = { x: newX, y: newY };
        if (rafIdRef.current == null) {
          rafIdRef.current = requestAnimationFrame(() => {
            const pos = pendingPosRef.current;
            if (pos && onPositionChange) {
              onPositionChange(pos);
            }
            rafIdRef.current = null;
          });
        }
        
        // Emitir movimiento en tiempo real al servidor
        if (socket) {
          socket.emit('move-class', {
            roomId: idDiagrama,
            classId: id,
            position: { x: newX, y: newY }
          });
        }
      };

      const handleMouseUp = (e) => {
        e.preventDefault();
        setIsDragging(false);
        
        // Aplicar snap-to-grid cuando se suelta
        const GRID_SIZE = 50; // Tamaño del grid para snap
        
        // Forzar una última actualización pendiente si existe
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        
        if (pendingPosRef.current && onPositionChange) {
          // Aplicar snap-to-grid
          const snappedX = Math.round(pendingPosRef.current.x / GRID_SIZE) * GRID_SIZE;
          const snappedY = Math.round(pendingPosRef.current.y / GRID_SIZE) * GRID_SIZE;
          
          onPositionChange({ x: snappedX, y: snappedY });
        }
        
        pendingPosRef.current = null;
        
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      // Agregar eventos
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    onUpdate(id, { name });

    if (socket) {
      socket.emit('update-class', {
        roomId: idDiagrama,
        classId: id,
        updatedData: { name }
      });
    }
  };

  const addAttribute = () => {
    const newAttributes = [...localAttributes, ''];
    setLocalAttributes(newAttributes);
    onUpdate(id, { attributes: newAttributes });

    if (socket) {
      socket.emit('update-class', {
        roomId: idDiagrama,
        classId: id,
        updatedData: { attributes: newAttributes }
      });
    }
  };

  const updateAttribute = (index, value) => {
    const newAttributes = [...localAttributes];
    newAttributes[index] = value;
    setLocalAttributes(newAttributes);
    onUpdate(id, { attributes: newAttributes });

    if (socket) {
      socket.emit('update-class', {
        roomId: idDiagrama,
        classId: id,
        updatedData: { attributes: newAttributes }
      });
    }
  };

  const removeAttribute = (index) => {
    const newAttributes = localAttributes.filter((_, i) => i !== index);
    setLocalAttributes(newAttributes);
    onUpdate(id, { attributes: newAttributes });

    if (socket) {
      socket.emit('update-class', {
        roomId: idDiagrama,
        classId: id,
        updatedData: { attributes: newAttributes }
      });
    }
  };

  const addMethod = () => {
    const newMethods = [...localMethods, ''];
    setLocalMethods(newMethods);
    onUpdate(id, { methods: newMethods });

    if (socket) {
      socket.emit('update-class', {
        roomId: idDiagrama,
        classId: id,
        updatedData: { methods: newMethods }
      });
    }
  };

  const updateMethod = (index, value) => {
    const newMethods = [...localMethods];
    newMethods[index] = value;
    setLocalMethods(newMethods);
    onUpdate(id, { methods: newMethods });

    if (socket) {
      socket.emit('update-class', {
        roomId: idDiagrama,
        classId: id,
        updatedData: { methods: newMethods }
      });
    }
  };

  const removeMethod = (index) => {
    const newMethods = localMethods.filter((_, i) => i !== index);
    setLocalMethods(newMethods);
    onUpdate(id, { methods: newMethods });

    if (socket) {
      socket.emit('update-class', {
        roomId: idDiagrama,
        classId: id,
        updatedData: { methods: newMethods }
      });
    }
  };

  return (
    <ClassContainer
      ref={containerRef}
      x={x}
      y={y}
      $isSelected={$isSelected}
      $isDragging={isDragging}
      data-class-id={id}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={handleMouseDown}
      onTouchStart={(e) => {
        if (e.touches.length === 1 && !isEditingAnyField) {
          // No prevenir el comportamiento por defecto para evitar conflictos
          const touch = e.touches[0];
          const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            button: 0
          });
          handleMouseDown(mouseEvent);
        }
      }}
    >
      <ClassHeader>
        <DragHandle>
          <GripVertical size={16} />
        </DragHandle>
        
        {isEditing ? (
          <input
            value={name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyPress={(e) => e.key === 'Enter' && handleNameBlur()}
            onMouseDown={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <h4 onDoubleClick={() => setIsEditing(true)}>{name}</h4>
        )}
        
        <DeleteButton onClick={onDelete} aria-label="Eliminar clase" title="Eliminar clase">
          <span style={{
            display: 'inline-block',
            fontSize: '16px',
            lineHeight: 1,
            fontWeight: 800,
            userSelect: 'none'
          }}>×</span>
        </DeleteButton>
      </ClassHeader>

      <Section>
        <SectionTitle>
          <Edit3 size={16} />
          Atributos
        </SectionTitle>
        <List>
          {localAttributes.map((attr, index) => (
            <ListItem key={index}>
              <input
                value={attr}
                onChange={(e) => updateAttribute(index, e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onFocus={() => setIsEditingAnyField(true)}
                onBlur={() => setIsEditingAnyField(false)}
                placeholder="nombre : tipo"
              />
              <RemoveButton onClick={() => removeAttribute(index)} title="Eliminar atributo" aria-label="Eliminar atributo">
                <span style={{
                  display: 'inline-block',
                  fontSize: '16px',
                  lineHeight: 1,
                  fontWeight: 800,
                  userSelect: 'none'
                }}>×</span>
              </RemoveButton>
            </ListItem>
          ))}
        </List>
        <AddButton onClick={addAttribute}>
          <Plus size={16} />
          Añadir Atributo
        </AddButton>
      </Section>

      <Section>
        <SectionTitle>
          <Settings size={16} />
          Métodos
        </SectionTitle>
        <List>
          {localMethods.map((method, index) => (
            <ListItem key={index}>
              <input
                value={method}
                onChange={(e) => updateMethod(index, e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
                onFocus={() => setIsEditingAnyField(true)}
                onBlur={() => setIsEditingAnyField(false)}
                placeholder="nombre(param : tipo) : tipo"
              />
              <RemoveButton onClick={() => removeMethod(index)} title="Eliminar método" aria-label="Eliminar método">
                <span style={{
                  display: 'inline-block',
                  fontSize: '16px',
                  lineHeight: 1,
                  fontWeight: 800,
                  userSelect: 'none'
                }}>×</span>
              </RemoveButton>
            </ListItem>
          ))}
        </List>
        <AddButton onClick={addMethod}>
          <Plus size={16} />
          Añadir Método
        </AddButton>
      </Section>
    </ClassContainer>
  );
};

export default ClassComponent;