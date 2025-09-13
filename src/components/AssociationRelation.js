import React, { useState } from 'react';
import styled from 'styled-components';
import { Edit3, Trash2, X } from 'lucide-react';

const RelationGroup = styled.g.attrs(props => ({
  className: props.$isSelected ? 'selected' : ''
}))`
  cursor: pointer;
  z-index: 1000;
  pointer-events: all;

  &:hover .relation-path {
    stroke-width: 4;
    filter: brightness(1.2);
  }

  &.selected .relation-path {
    stroke-width: 4;
    stroke-dasharray: ${props => props.$type === 'Muchos a Muchos' ? '8' : 'none'};
    filter: brightness(1.3);
  }
`;

const RelationPath = styled.path`
  pointer-events: stroke;
  stroke-width: 3;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));

  &:hover {
    filter: brightness(1.2) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
    stroke-width: 4;
  }
`;

const RelationText = styled.text`
  font-size: 14px;
  font-weight: 700;
  fill: #1a202c;
  text-anchor: middle;
  pointer-events: none;
  user-select: none;
  dominant-baseline: middle;
  filter: drop-shadow(0 1px 2px rgba(255, 255, 255, 0.8));
`;

const RelationControls = styled.div`
  position: absolute;
  background: rgba(255, 255, 255, 0.98);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  gap: 12px;
  z-index: 1000;
  backdrop-filter: blur(20px);
  border: 2px solid #667eea;
  transform: translate(-50%, -150%);
  
  &:hover {
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.25);
  }
`;

const ControlButton = styled.button.attrs(props => ({
  type: 'button'
}))`
  background: ${props => props.$variant === 'danger' ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : 
    props.$variant === 'warning' ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' :
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  white-space: nowrap;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  i {
    font-size: 14px;
  }
`;

const RelationLabel = styled.text`
  font-size: 12px;
  fill: #4a5568;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    fill: #1a202c;
    font-weight: 700;
  }
`;

const RelationInput = styled.foreignObject`
  input {
    background: white;
    border: 2px solid #667eea;
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 12px;
    font-weight: 600;
    width: calc(100% - 4px);
    height: calc(100% - 4px);
    outline: none;
    text-align: center;
    transition: all 0.3s ease;

    &:focus {
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
      border-color: #4c51bf;
    }
  }
`;

const DeleteButton = styled.button`
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);

  &:hover {
    background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.4);
  }

  &:active {
    transform: translateY(0) scale(1);
  }

  i {
    font-size: 14px;
  }
`;

const getRelationStyle = (type) => {
  const baseStyle = {
    strokeWidth: 3,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (type) {
    case 'Composición':
      return {
        ...baseStyle,
        stroke: '#2563EB',
        markerEnd: 'url(#compositionMarker)',
      };
    case 'Agregación':
      return {
        ...baseStyle,
        stroke: '#059669',
        markerEnd: 'url(#aggregationMarker)',
      };
    case 'Generalización':
      return {
        ...baseStyle,
        stroke: '#7C3AED',
        markerEnd: 'url(#generalizationMarker)',
      };
    case 'Muchos a Muchos':
      return {
        ...baseStyle,
        stroke: '#DB2777',
        strokeDasharray: '6',
        strokeWidth: 3,
      };
    default:
      return {
        ...baseStyle,
        stroke: '#667eea',
        strokeWidth: 3,
        markerEnd: 'url(#associationMarker)',
      };
  }
};

const AssociationRelation = ({
  sourceClass,
  targetClass,
  relation,
  onUpdate,
  onDelete,
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [editModeOrigen, setEditModeOrigen] = useState(false);
  const [editModeDestino, setEditModeDestino] = useState(false);
  const [tempOrigen, setTempOrigen] = useState(relation.multiplicidadOrigen);
  const [tempDestino, setTempDestino] = useState(relation.multiplicidadDestino);
  const [showControls, setShowControls] = useState(false);

  const handleRelationClick = (e) => {
    e.stopPropagation();
    setIsSelected(!isSelected);
    setShowControls(!showControls);
  };

  const handleBackgroundClick = (e) => {
    if (e.target.tagName !== 'path') {
      setIsSelected(false);
      setShowControls(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleBackgroundClick);
    return () => document.removeEventListener('click', handleBackgroundClick);
  }, []);

  const handleEditMultiplicidad = (tipo) => {
    if (tipo === 'origen') {
      setEditModeOrigen(true);
      setEditModeDestino(false);
    } else {
      setEditModeOrigen(false);
      setEditModeDestino(true);
    }
  };

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
    onDelete(relation.id);
  };

  // Calcular coordenadas de la línea
  const calculateLineCoordinates = () => {
    const CLASS_WIDTH = 300;
    const CLASS_HEIGHT = 150;

    const sourceCenter = {
      x: sourceClass.x + CLASS_WIDTH / 2,
      y: sourceClass.y + CLASS_HEIGHT / 2
    };
    const targetCenter = {
      x: targetClass.x + CLASS_WIDTH / 2,
      y: targetClass.y + CLASS_HEIGHT / 2
    };

    const angle = Math.atan2(targetCenter.y - sourceCenter.y, targetCenter.x - sourceCenter.x);

    let startX, startY, endX, endY;

    // Para la clase de origen - cálculo mejorado
    if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
      startX = sourceCenter.x + (Math.cos(angle) > 0 ? CLASS_WIDTH / 2 : -CLASS_WIDTH / 2);
      startY = sourceCenter.y + Math.tan(angle) * (startX - sourceCenter.x);
    } else {
      startY = sourceCenter.y + (Math.sin(angle) > 0 ? CLASS_HEIGHT / 2 : -CLASS_HEIGHT / 2);
      startX = sourceCenter.x + (startY - sourceCenter.y) / Math.tan(angle);
    }

    // Para la clase de destino - cálculo mejorado
    if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
      endX = targetCenter.x + (Math.cos(angle) < 0 ? CLASS_WIDTH / 2 : -CLASS_WIDTH / 2);
      endY = targetCenter.y + Math.tan(angle) * (endX - targetCenter.x);
    } else {
      endY = targetCenter.y + (Math.sin(angle) < 0 ? CLASS_HEIGHT / 2 : -CLASS_HEIGHT / 2);
      endX = targetCenter.x + (endY - targetCenter.y) / Math.tan(angle);
    }

    // Verificar que las coordenadas sean válidas
    if (isNaN(startX) || isNaN(startY) || isNaN(endX) || isNaN(endY)) {
      // Fallback a coordenadas simples
      return {
        startX: sourceCenter.x,
        startY: sourceCenter.y,
        endX: targetCenter.x,
        endY: targetCenter.y
      };
    }

    return { startX, startY, endX, endY };
  };

  const { startX, startY, endX, endY } = calculateLineCoordinates();

  return (
    <svg
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
        zIndex: 50,
      }}
    >
      <defs>
        {/* Marcador de Asociación */}
        <marker
          id="associationMarker"
          markerWidth="20"
          markerHeight="20"
          refX="18"
          refY="10"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,20 L18,10 z"
            fill="#667eea"
          />
        </marker>

        {/* Marcador de Composición */}
        <marker
          id="compositionMarker"
          markerWidth="20"
          markerHeight="20"
          refX="10"
          refY="10"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,10 L10,0 L20,10 L10,20 z"
            fill="#2563EB"
          />
        </marker>

        {/* Marcador de Agregación */}
        <marker
          id="aggregationMarker"
          markerWidth="20"
          markerHeight="20"
          refX="10"
          refY="10"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,10 L10,0 L20,10 L10,20 z"
            fill="white"
            stroke="#059669"
            strokeWidth="2"
          />
        </marker>

        {/* Marcador de Generalización */}
        <marker
          id="generalizationMarker"
          markerWidth="20"
          markerHeight="20"
          refX="20"
          refY="10"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,20 L20,10 z"
            fill="white"
            stroke="#7C3AED"
            strokeWidth="2"
          />
        </marker>

        {/* Filtro de sombra */}
        <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1"/>
        </filter>
      </defs>

      {/* Línea de relación */}
      <RelationGroup
        onClick={handleRelationClick}
        $type={relation.type}
        $isSelected={isSelected}
      >
        <RelationPath
          d={`M ${startX} ${startY} L ${endX} ${endY}`}
          fill="none"
          {...getRelationStyle(relation.type)}
          filter="url(#shadowFilter)"
          className="relation-path"
        />
        
        {/* Nombre de la relación */}
        <g transform={`translate(${(startX + endX) / 2}, ${(startY + endY) / 2})`}>
          <rect
            x="-60"
            y="-16"
            width="120"
            height="32"
            fill="white"
            rx="8"
            opacity="0.95"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
          <RelationText>
            {relation.type}
          </RelationText>
        </g>

        {/* Panel de control */}
        {showControls && (
          <foreignObject
            x={(startX + endX) / 2}
            y={(startY + endY) / 2}
            width="300"
            height="80"
          >
            <RelationControls>
              <ControlButton onClick={() => handleEditMultiplicidad('origen')}>
                <Edit3 size={16} />
                Origen ({relation.multiplicidadOrigen})
              </ControlButton>
              <ControlButton onClick={() => handleEditMultiplicidad('destino')}>
                <Edit3 size={16} />
                Destino ({relation.multiplicidadDestino})
              </ControlButton>
              <ControlButton $variant="danger" onClick={handleDelete}>
                <Trash2 size={16} />
                Eliminar
              </ControlButton>
            </RelationControls>
          </foreignObject>
        )}

        {/* Etiquetas de cardinalidad - posicionamiento mejorado */}
        <g transform={`translate(${Math.max(0, sourceClass.x + 50)}, ${Math.max(0, sourceClass.y + 20)})`}>
          {editModeOrigen ? (
            <RelationInput width="50" height="24">
              <input
                value={tempOrigen}
                onChange={(e) => setTempOrigen(e.target.value)}
                onBlur={handleSaveOrigen}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveOrigen()}
                autoFocus
              />
            </RelationInput>
          ) : (
            <RelationLabel onDoubleClick={() => setEditModeOrigen(true)}>
              {relation.multiplicidadOrigen}
            </RelationLabel>
          )}
        </g>

        <g transform={`translate(${Math.max(0, targetClass.x - 30)}, ${Math.max(0, targetClass.y + 20)})`}>
          {editModeDestino ? (
            <RelationInput width="50" height="24">
              <input
                value={tempDestino}
                onChange={(e) => setTempDestino(e.target.value)}
                onBlur={handleSaveDestino}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveDestino()}
                autoFocus
              />
            </RelationInput>
          ) : (
            <RelationLabel onDoubleClick={() => setEditModeDestino(true)}>
              {relation.multiplicidadDestino}
            </RelationLabel>
          )}
        </g>

        {/* Botón de eliminar */}
        <foreignObject
          x={(startX + endX) / 2 - 12}
          y={(startY + endY) / 2 - 12}
          width="24"
          height="24"
        >
          <DeleteButton onClick={handleDelete}>
            <X size={16} />
          </DeleteButton>
        </foreignObject>
      </RelationGroup>
    </svg>
  );
};

export default AssociationRelation;