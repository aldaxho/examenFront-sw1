import React, { useEffect, useRef, useState } from 'react';

const ClassComponent = ({
  id,
  className,
  x,
  y,
  attributes= [],
  methods=[],
  onPositionChange,
  onUpdate,
  onDelete,
  onSelect,
  classItem,
  isSelected,
  socket, // Añadido,
  idDiagrama,
  roomId,
}) => {
  const [position, setPosition] = useState({ x, y });
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(className);
  const [newAttribute, setNewAttribute] = useState('');
  const [newMethod, setNewMethod] = useState('');
  const [relativePosition, setRelativePosition] = useState({ x: 0, y: 0 });
  const classRef = useRef();

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  useEffect(() => {
    setPosition({ x, y });
  }, [x, y]);

  const handleMouseDown = (e) => {
    setDragging(true);
    setRelativePosition({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    onSelect && onSelect();
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      const newX = e.clientX - relativePosition.x;
      const newY = e.clientY - relativePosition.y;
      setPosition({ x: newX, y: newY });
      onPositionChange && onPositionChange({ x: newX, y: newY });
       // Emitir el evento de movimiento de clase
       socket.emit('move-class', {
        roomId: idDiagrama, // Necesitas pasar el ID del diagrama
        classId: id,
        position: { x: newX, y: newY },
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  const handleAddAttribute = () => {
    if (newAttribute.trim()) {
      const updatedAttributes = [...attributes, newAttribute];
      const data = { attributes: updatedAttributes };
      console.log('Datos que se envían a onUpdate:', data); // Validación de datos
      onUpdate(id, data); // Llama con el objeto de datos correcto
      setNewAttribute('');
    }
  };
  
  

  const handleDeleteAttribute = (index) => {
    const updatedAttributes = attributes.filter((_, idx) => idx !== index);
    onUpdate(id, { attributes: updatedAttributes });
  };

  const handleAddMethod = () => {
    if (newMethod.trim()) {
      const updatedMethods = [...methods, newMethod];
      onUpdate(id, { methods: updatedMethods });
      setNewMethod('');
    }
  };
  const handleDrag = (e) => {
    const newX = position.x + e.movementX;
    const newY = position.y + e.movementY;
    setPosition({ x: newX, y: newY });

    // Notificar al componente padre del cambio de posición
    onPositionChange({ x: newX, y: newY });

    // Emitir evento al servidor
    socket.emit('move-class', {
      roomId,
      classId: id,
      position: { x: newX, y: newY },
    });
  };
  useEffect(() => {
    console.log('Atributos recibidos en ClassComponent:', attributes);
  }, [attributes]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: dragging ? 'grabbing' : 'grab',
        backgroundColor: isSelected ? '#E0F7FA' : 'white',
        border: '1px solid black',
        padding: '10px',
        width: '200px',
        zIndex: dragging ? 1000 : 'auto',
      }}
      onMouseDown={handleMouseDown}
      onClick={onSelect}
    >
      <button onClick={onDelete} style={{ position: 'absolute', top: '5px', right: '5px' }}>✖</button>
      {editing ? (
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            onUpdate(id, { name });
            setEditing(false);
          }}
          autoFocus
        />
      ) : (
        <h4 onDoubleClick={() => setEditing(true)}>{name}</h4>
      )}
      <h5>Atributos</h5>
      <ul>
        {attributes.map((attr, index) => (
          <li key={index}>
            {attr}
            <button
              onClick={() => handleDeleteAttribute(index)}
              style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', marginLeft: '5px' }}
            >
              ➖
            </button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newAttribute}
        onChange={(e) => setNewAttribute(e.target.value)}
        placeholder="Nuevo Atributo"
      />
      <button onClick={handleAddAttribute}>Agregar Atributo</button>
      <h5>Métodos</h5>
      <ul>
        {methods.map((method, index) => (
          <li key={index}>{method}</li>
        ))}
      </ul>
      <input
        type="text"
        value={newMethod}
        onChange={(e) => setNewMethod(e.target.value)}
        placeholder="Nuevo Método"
      />
      <button onClick={handleAddMethod}>Agregar Método</button>
    </div>
  );
};

export default ClassComponent;
