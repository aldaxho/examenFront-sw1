import React, { useState } from 'react';

const AssociationRelation = ({
  sourceClass,
  targetClass,
  relation,
  onUpdate,
  onDelete,
}) => {
  const [editModeOrigen, setEditModeOrigen] = useState(false);
  const [editModeDestino, setEditModeDestino] = useState(false);
  const [tempOrigen, setTempOrigen] = useState(relation.multiplicidadOrigen);
  const [tempDestino, setTempDestino] = useState(relation.multiplicidadDestino);

  const handleSaveOrigen = () => {
    onUpdate(relation.id, {
      multiplicidadOrigen: tempOrigen,
    });
    setEditModeOrigen(false);
  };

  const handleSaveDestino = () => {
    onUpdate(relation.id, {
      multiplicidadDestino: tempDestino,
    });
    setEditModeDestino(false);
  };

  const handleDelete = () => {
    onDelete(relation.id); // Llama a la función de eliminación de relaciones
  };

  // Ajusta las coordenadas para que la línea comience fuera de la clase
  const calculateLineCoordinates = () => {
    const startX = sourceClass.x + 200; // Ajusta según el ancho de la clase
    const startY = sourceClass.y + 30; // Ajusta según la altura de la clase
    const endX = targetClass.x; // La posición de inicio de la clase objetivo
    const endY = targetClass.y + 30; // Ajusta según la altura de la clase

    return { startX, startY, endX, endY };
  };

  const { startX, startY, endX, endY } = calculateLineCoordinates();

  const getLineStyle = (type) => {
    switch (type) {
      case 'Composición':
        return { stroke: 'black', strokeWidth: 2, markerEnd: 'url(#diamondFilled)' }; // Diamante relleno
      case 'Agregación':
        return { stroke: 'black', strokeWidth: 2, markerEnd: 'url(#diamondEmpty)' }; // Diamante vacío
      case 'Generalización':
        return { stroke: 'black', strokeWidth: 2, markerEnd: 'url(#arrow)' }; // Flecha vacía
      case 'Muchos a Muchos':
        return { stroke: 'blue', strokeWidth: 2 }; // Puedes agregar una clase intermedia visualmente
      default:
        return { stroke: 'black', strokeWidth: 2 }; // Asociación
    }
  };
  

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
    >
      <defs>
        <marker
          id="arrow"
          markerWidth="10"
          markerHeight="10"
          refX="10"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,10 L10,5 z" fill="white" stroke="black" />
        </marker>
        <marker
          id="diamond"
          markerWidth="10"
          markerHeight="10"
          refX="10"
          refY="5"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,5 L5,0 L10,5 L5,10 z" fill="black" />
        </marker>
        <marker
        id="diamondEmpty"
        markerWidth="10"
        markerHeight="10"
        refX="10"
        refY="5"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,5 L5,0 L10,5 L5,10 z" fill="white" stroke="black" />
      </marker>

      </defs>

      {/* Dibuja una única línea con el estilo adecuado */}
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        {...getLineStyle(relation.type)}
      />

      {/* Etiquetas de cardinalidades */}
      <text x={sourceClass.x + 50} y={sourceClass.y + 20}>
        {editModeOrigen ? (
          <foreignObject width="60" height="20">
            <input
              value={tempOrigen}
              onChange={(e) => setTempOrigen(e.target.value)}
              onBlur={handleSaveOrigen}
              autoFocus
              style={{ width: '100%', height: '100%' }}
            />
          </foreignObject>
        ) : (
          <tspan onDoubleClick={() => setEditModeOrigen(true)}>
            {relation.multiplicidadOrigen}
          </tspan>
        )}
      </text>
      <text x={targetClass.x - 30} y={targetClass.y + 20}>
        {editModeDestino ? (
          <foreignObject width="60" height="20">
            <input
              value={tempDestino}
              onChange={(e) => setTempDestino(e.target.value)}
              onBlur={handleSaveDestino}
              autoFocus
              style={{ width: '100%', height: '100%' }}
            />
          </foreignObject>
        ) : (
          <tspan onDoubleClick={() => setEditModeDestino(true)}>
            {relation.multiplicidadDestino}
          </tspan>
        )}
      </text>

      {/* Botón para eliminar la relación */}
      <foreignObject
        x={(sourceClass.x + targetClass.x) / 2 - 10}
        y={(sourceClass.y + targetClass.y) / 2 - 10}
        width="20"
        height="20"
      >
        <button onClick={handleDelete} style={{ background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>
          ✖
        </button>
      </foreignObject>
    </svg>
  );
};

export default AssociationRelation;
