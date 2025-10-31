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
  font-size: 16px;
  font-weight: 800;
  fill: white;
  text-anchor: middle;
  pointer-events: none;
  user-select: none;
  dominant-baseline: middle;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9));
  stroke: rgba(0, 0, 0, 0.8);
  stroke-width: 0.5px;
  paint-order: stroke fill;
  font-family: 'Inter', sans-serif;
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
  font-size: 14px;
  fill: white;
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  cursor: pointer;
  text-anchor: middle;
  dominant-baseline: middle;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
  transition: all 0.2s ease;

  &:hover {
    fill: #667eea;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9));
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
  border-radius: 50%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;

  &:hover {
    background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
    transform: translateY(-2px) scale(1.1);
    box-shadow: 0 6px 16px rgba(239, 68, 68, 0.5);
  }

  &:active {
    transform: translateY(0) scale(1);
  }

  svg {
    width: 18px;
    height: 18px;
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
  allClasses = [], // Todas las clases para detectar colisiones
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

  // Calcular coordenadas de la línea - MEJORADO
  const calculateLineCoordinates = () => {
    const CLASS_WIDTH = 300;
    const CLASS_HEIGHT = 150;

    // Verificar que las clases tengan coordenadas válidas
    if (!sourceClass || !targetClass || 
        typeof sourceClass.x !== 'number' || typeof sourceClass.y !== 'number' ||
        typeof targetClass.x !== 'number' || typeof targetClass.y !== 'number') {
      console.warn('Coordenadas inválidas para las clases:', { sourceClass, targetClass });
      return { startX: 0, startY: 0, endX: 100, endY: 100 };
    }

    const sourceCenter = {
      x: sourceClass.x + CLASS_WIDTH / 2,
      y: sourceClass.y + CLASS_HEIGHT / 2
    };
    const targetCenter = {
      x: targetClass.x + CLASS_WIDTH / 2,
      y: targetClass.y + CLASS_HEIGHT / 2
    };

    // Calcular dirección del vector desde origen hacia destino
    const deltaX = targetCenter.x - sourceCenter.x;
    const deltaY = targetCenter.y - sourceCenter.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance === 0) {
      return { startX: sourceCenter.x, startY: sourceCenter.y, endX: targetCenter.x, endY: targetCenter.y };
    }

    // Normalizar el vector
    const nx = deltaX / distance;
    const ny = deltaY / distance;

    // Función para encontrar el punto de intersección EXACTO con el borde de un rectángulo
    const findIntersectionPoint = (centerX, centerY, dirX, dirY, width, height) => {
      // Calcular las coordenadas exactas de los bordes del rectángulo
      const leftEdge = centerX - width / 2;
      const rightEdge = centerX + width / 2;
      const topEdge = centerY - height / 2;
      const bottomEdge = centerY + height / 2;
      
      // Calcular intersecciones con cada borde
      const intersections = [];
      
      // Borde izquierdo (x = leftEdge)
      if (dirX !== 0) {
        const tLeft = (leftEdge - centerX) / dirX;
        if (tLeft > 0) {
          const y = centerY + dirY * tLeft;
          if (y >= topEdge && y <= bottomEdge) {
            intersections.push({ x: leftEdge, y, t: tLeft });
          }
        }
      }
      
      // Borde derecho (x = rightEdge)
      if (dirX !== 0) {
        const tRight = (rightEdge - centerX) / dirX;
        if (tRight > 0) {
          const y = centerY + dirY * tRight;
          if (y >= topEdge && y <= bottomEdge) {
            intersections.push({ x: rightEdge, y, t: tRight });
          }
        }
      }
      
      // Borde superior (y = topEdge)
      if (dirY !== 0) {
        const tTop = (topEdge - centerY) / dirY;
        if (tTop > 0) {
          const x = centerX + dirX * tTop;
          if (x >= leftEdge && x <= rightEdge) {
            intersections.push({ x, y: topEdge, t: tTop });
          }
        }
      }
      
      // Borde inferior (y = bottomEdge)
      if (dirY !== 0) {
        const tBottom = (bottomEdge - centerY) / dirY;
        if (tBottom > 0) {
          const x = centerX + dirX * tBottom;
          if (x >= leftEdge && x <= rightEdge) {
            intersections.push({ x, y: bottomEdge, t: tBottom });
          }
        }
      }
      
      // Retornar la intersección más cercana (menor t)
      if (intersections.length > 0) {
        const closest = intersections.reduce((min, current) => current.t < min.t ? current : min);
        // Asegurar que el punto esté EXACTAMENTE en el borde (redondear para evitar errores de punto flotante)
        return { 
          x: Math.round(closest.x * 100) / 100, 
          y: Math.round(closest.y * 100) / 100 
        };
      }
      
      // Fallback - si no hay intersección, usar el borde más cercano
      // Esto no debería pasar, pero por seguridad
      if (Math.abs(dirX) > Math.abs(dirY)) {
        return { x: dirX > 0 ? rightEdge : leftEdge, y: centerY };
      } else {
        return { x: centerX, y: dirY > 0 ? bottomEdge : topEdge };
      }
    };

    // Encontrar punto de salida en la clase origen
    const startPoint = findIntersectionPoint(sourceCenter.x, sourceCenter.y, nx, ny, CLASS_WIDTH, CLASS_HEIGHT);
    
    // Encontrar punto de entrada en la clase destino
    const endPoint = findIntersectionPoint(targetCenter.x, targetCenter.y, -nx, -ny, CLASS_WIDTH, CLASS_HEIGHT);

    return { 
      startX: startPoint.x, 
      startY: startPoint.y, 
      endX: endPoint.x, 
      endY: endPoint.y 
    };
  };

  const { startX, startY, endX, endY } = calculateLineCoordinates();

  // Función para generar línea ortogonal inteligente que evita cruces
  // IMPORTANTE: startX/startY y endX/endY ya están en los bordes exactos de las clases
  const generateOrthogonalPath = (startX, startY, endX, endY) => {
    const CLASS_WIDTH = 300;
    const CLASS_HEIGHT = 150;
    const ROUTE_OFFSET = 30; // Offset mínimo desde el borde para routing ortogonal

    // Obtener las clases que no son origen ni destino (obstáculos)
    const obstacles = allClasses.filter(
      cls => cls.id !== sourceClass.id && cls.id !== targetClass.id
    );

    // Verificar si un punto está dentro o muy cerca de una clase
    const pointInClass = (x, y, cls) => {
      const margin = 5; // Margen muy pequeño
      return (
        x > cls.x - margin &&
        x < cls.x + CLASS_WIDTH + margin &&
        y > cls.y - margin &&
        y < cls.y + CLASS_HEIGHT + margin
      );
    };

    // Verificar si una línea cruza una clase (interior)
    const lineCrossesClass = (x1, y1, x2, y2, cls) => {
      const clsLeft = cls.x;
      const clsRight = cls.x + CLASS_WIDTH;
      const clsTop = cls.y;
      const clsBottom = cls.y + CLASS_HEIGHT;
      
      // Si alguno de los puntos está dentro, no cruza (está en el borde)
      if (pointInClass(x1, y1, cls) || pointInClass(x2, y2, cls)) {
        // Verificar si está en el borde (OK) o dentro (problema)
        const onBorder1 = 
          (Math.abs(x1 - clsLeft) < 2 || Math.abs(x1 - clsRight) < 2) ||
          (Math.abs(y1 - clsTop) < 2 || Math.abs(y1 - clsBottom) < 2);
        const onBorder2 = 
          (Math.abs(x2 - clsLeft) < 2 || Math.abs(x2 - clsRight) < 2) ||
          (Math.abs(y2 - clsTop) < 2 || Math.abs(y2 - clsBottom) < 2);
        
        if (!onBorder1 || !onBorder2) {
          // Uno de los puntos está dentro, no en el borde
          return true;
        }
      }
      
      // Verificar intersección del segmento con el interior del rectángulo
      const minX = Math.min(x1, x2);
      const maxX = Math.max(x1, x2);
      const minY = Math.min(y1, y2);
      const maxY = Math.max(y1, y2);
      
      // Caja delimitadora rápida
      if (maxX < clsLeft || minX > clsRight || maxY < clsTop || minY > clsBottom) {
        return false;
      }
      
      // Verificar intersección real con el interior (no bordes)
      const dx = x2 - x1;
      const dy = y2 - y1;
      if (dx === 0 && dy === 0) return false;
      
      // Para cada borde, verificar si cruza el interior
      if (dx !== 0) {
        const tLeft = (clsLeft - x1) / dx;
        const tRight = (clsRight - x1) / dx;
        if (tLeft >= 0 && tLeft <= 1) {
          const y = y1 + dy * tLeft;
          if (y > clsTop && y < clsBottom) return true;
        }
        if (tRight >= 0 && tRight <= 1) {
          const y = y1 + dy * tRight;
          if (y > clsTop && y < clsBottom) return true;
        }
      }
      
      if (dy !== 0) {
        const tTop = (clsTop - y1) / dy;
        const tBottom = (clsBottom - y1) / dy;
        if (tTop >= 0 && tTop <= 1) {
          const x = x1 + dx * tTop;
          if (x > clsLeft && x < clsRight) return true;
        }
        if (tBottom >= 0 && tBottom <= 1) {
          const x = x1 + dx * tBottom;
          if (x > clsLeft && x < clsRight) return true;
        }
      }
      
      return false;
    };

    // Usar los puntos exactos del borde (sin modificarlos)
    // Solo agregar un pequeño offset ortogonal si es necesario para routing
    const dx = endX - startX;
    const dy = endY - startY;
    
    // Determinar en qué borde está cada punto
    const sourceLeft = sourceClass.x;
    const sourceRight = sourceClass.x + CLASS_WIDTH;
    const sourceTop = sourceClass.y;
    const sourceBottom = sourceClass.y + CLASS_HEIGHT;
    
    const targetLeft = targetClass.x;
    const targetRight = targetClass.x + CLASS_WIDTH;
    const targetTop = targetClass.y;
    const targetBottom = targetClass.y + CLASS_HEIGHT;
    
    // Detectar en qué borde está cada punto
    const startOnLeft = Math.abs(startX - sourceLeft) < 2;
    const startOnRight = Math.abs(startX - sourceRight) < 2;
    const startOnTop = Math.abs(startY - sourceTop) < 2;
    const startOnBottom = Math.abs(startY - sourceBottom) < 2;
    
    const endOnLeft = Math.abs(endX - targetLeft) < 2;
    const endOnRight = Math.abs(endX - targetRight) < 2;
    const endOnTop = Math.abs(endY - targetTop) < 2;
    const endOnBottom = Math.abs(endY - targetBottom) < 2;
    
    // Verificar si hay obstáculos en el camino directo
    const needsReroute = obstacles.length > 0 && obstacles.some(obs => 
      lineCrossesClass(startX, startY, endX, endY, obs)
    );

    // Si no hay obstáculos y la línea es relativamente directa, usar línea recta
    if (!needsReroute && (Math.abs(dx) < 50 || Math.abs(dy) < 50)) {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }
    
    // Si hay obstáculos o la línea es muy diagonal, usar routing ortogonal
    // Calcular puntos de routing ortogonal desde los bordes
    let routeStartX = startX;
    let routeStartY = startY;
    let routeEndX = endX;
    let routeEndY = endY;
    
    // Mover el punto de inicio ligeramente fuera del borde
    if (startOnLeft) {
      routeStartX = startX - ROUTE_OFFSET;
    } else if (startOnRight) {
      routeStartX = startX + ROUTE_OFFSET;
    } else if (startOnTop) {
      routeStartY = startY - ROUTE_OFFSET;
    } else if (startOnBottom) {
      routeStartY = startY + ROUTE_OFFSET;
    }
    
    // Mover el punto final ligeramente fuera del borde
    if (endOnLeft) {
      routeEndX = endX - ROUTE_OFFSET;
    } else if (endOnRight) {
      routeEndX = endX + ROUTE_OFFSET;
    } else if (endOnTop) {
      routeEndY = endY - ROUTE_OFFSET;
    } else if (endOnBottom) {
      routeEndY = endY + ROUTE_OFFSET;
    }
    
    // Si es principalmente horizontal, routing horizontal-vertical-horizontal
    if (Math.abs(dx) > Math.abs(dy)) {
      const midY = (routeStartY + routeEndY) / 2;
      return `M ${startX} ${startY} 
              L ${routeStartX} ${startY} 
              L ${routeStartX} ${midY} 
              L ${routeEndX} ${midY} 
              L ${routeEndX} ${endY} 
              L ${endX} ${endY}`;
    } else {
      // Si es principalmente vertical, routing vertical-horizontal-vertical
      const midX = (routeStartX + routeEndX) / 2;
      return `M ${startX} ${startY} 
              L ${startX} ${routeStartY} 
              L ${midX} ${routeStartY} 
              L ${midX} ${routeEndY} 
              L ${endX} ${routeEndY} 
              L ${endX} ${endY}`;
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
        zIndex: 50,
        overflow: 'visible',
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
          d={generateOrthogonalPath(startX, startY, endX, endY)}
          fill="none"
          {...getRelationStyle(relation.type)}
          filter="url(#shadowFilter)"
          className="relation-path"
        />
        
        {/* Nombre de la relación - posicionamiento mejorado */}
        {(() => {
          // Calcular posición óptima para la etiqueta
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          const dx = endX - startX;
          const dy = endY - startY;
          
          // Offset para evitar solapamiento con la línea
          const labelOffset = 25;
          let labelX = midX;
          let labelY = midY;
          
          // Si la línea es principalmente horizontal, desplazar verticalmente
          if (Math.abs(dx) > Math.abs(dy)) {
            labelY -= labelOffset * (dy > 0 ? 1 : -1);
          } else {
            // Si es principalmente vertical, desplazar horizontalmente
            labelX += labelOffset * (dx > 0 ? -1 : 1);
          }
          
          return (
            <g transform={`translate(${labelX}, ${labelY})`}>
              {/* Fondo semi-transparente para mejor legibilidad */}
              <rect
                x="-50"
                y="-12"
                width="100"
                height="24"
                fill="rgba(0, 0, 0, 0.6)"
                rx="4"
              />
              <RelationText>
                {relation.type}
              </RelationText>
            </g>
          );
        })()}

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
        {(() => {
          const CLASS_WIDTH = 300;
          const CLASS_HEIGHT = 150;
          const LABEL_OFFSET = 25; // Offset desde el borde de la clase
          const LINE_OFFSET = 15; // Offset adicional perpendicular a la línea para evitar superposición
          
          // Calcular dirección de la línea
          const lineDx = endX - startX;
          const lineDy = endY - startY;
          const lineLength = Math.sqrt(lineDx * lineDx + lineDy * lineDy);
          
          // Vector perpendicular a la línea (normalizado) para desplazar cardinalidades
          let perpX = 0;
          let perpY = 0;
          if (lineLength > 0) {
            // Vector perpendicular: rotar 90 grados (intercambiar x/y y negar uno)
            perpX = -lineDy / lineLength;
            perpY = lineDx / lineLength;
          }
          
          // Determinar en qué borde está el punto de salida (origen)
          const sourceLeft = sourceClass.x;
          const sourceRight = sourceClass.x + CLASS_WIDTH;
          const sourceTop = sourceClass.y;
          const sourceBottom = sourceClass.y + CLASS_HEIGHT;
          
          const startOnLeft = Math.abs(startX - sourceLeft) < 2;
          const startOnRight = Math.abs(startX - sourceRight) < 2;
          const startOnTop = Math.abs(startY - sourceTop) < 2;
          const startOnBottom = Math.abs(startY - sourceBottom) < 2;
          
          // Posicionar cardinalidad origen - FUERA del borde Y perpendicular a la línea
          let origenX = startX;
          let origenY = startY;
          
          // Primero, posicionar respecto al borde de la clase
          if (startOnLeft) {
            origenX = sourceLeft - LABEL_OFFSET;
            origenY = startY;
          } else if (startOnRight) {
            origenX = sourceRight + LABEL_OFFSET;
            origenY = startY;
          } else if (startOnTop) {
            origenX = startX;
            origenY = sourceTop - LABEL_OFFSET;
          } else if (startOnBottom) {
            origenX = startX;
            origenY = sourceBottom + LABEL_OFFSET;
          }
          
          // Luego, desplazar perpendicularmente a la línea para evitar superposición
          // Determinar la mejor dirección (alejarse del centro de la línea)
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          const distToMidX = origenX - midX;
          const distToMidY = origenY - midY;
          
          // Usar el vector perpendicular que aleje del centro
          const dotProduct = distToMidX * perpX + distToMidY * perpY;
          const perpDirX = dotProduct > 0 ? perpX : -perpX;
          const perpDirY = dotProduct > 0 ? perpY : -perpY;
          
          origenX += perpDirX * LINE_OFFSET;
          origenY += perpDirY * LINE_OFFSET;
          
          // Determinar en qué borde está el punto final (destino)
          const targetLeft = targetClass.x;
          const targetRight = targetClass.x + CLASS_WIDTH;
          const targetTop = targetClass.y;
          const targetBottom = targetClass.y + CLASS_HEIGHT;
          
          const endOnLeft = Math.abs(endX - targetLeft) < 2;
          const endOnRight = Math.abs(endX - targetRight) < 2;
          const endOnTop = Math.abs(endY - targetTop) < 2;
          const endOnBottom = Math.abs(endY - targetBottom) < 2;
          
          // Posicionar cardinalidad destino - FUERA del borde Y perpendicular a la línea
          let destinoX = endX;
          let destinoY = endY;
          
          // Primero, posicionar respecto al borde de la clase
          if (endOnLeft) {
            destinoX = targetLeft - LABEL_OFFSET;
            destinoY = endY;
          } else if (endOnRight) {
            destinoX = targetRight + LABEL_OFFSET;
            destinoY = endY;
          } else if (endOnTop) {
            destinoX = endX;
            destinoY = targetTop - LABEL_OFFSET;
          } else if (endOnBottom) {
            destinoX = endX;
            destinoY = targetBottom + LABEL_OFFSET;
          }
          
          // Luego, desplazar perpendicularmente a la línea
          const distToMidX2 = destinoX - midX;
          const distToMidY2 = destinoY - midY;
          const dotProduct2 = distToMidX2 * perpX + distToMidY2 * perpY;
          const perpDirX2 = dotProduct2 > 0 ? perpX : -perpX;
          const perpDirY2 = dotProduct2 > 0 ? perpY : -perpY;
          
          destinoX += perpDirX2 * LINE_OFFSET;
          destinoY += perpDirY2 * LINE_OFFSET;
          
          return (
            <>
              {/* Cardinalidad origen */}
              <g transform={`translate(${origenX}, ${origenY})`}>
                {/* Fondo para legibilidad */}
                <rect
                  x="-20"
                  y="-10"
                  width="40"
                  height="20"
                  fill="rgba(0, 0, 0, 0.6)"
                  rx="4"
                />
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

              {/* Cardinalidad destino */}
              <g transform={`translate(${destinoX}, ${destinoY})`}>
                {/* Fondo para legibilidad */}
                <rect
                  x="-20"
                  y="-10"
                  width="40"
                  height="20"
                  fill="rgba(0, 0, 0, 0.6)"
                  rx="4"
                />
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
            </>
          );
        })()}

        {/* Botón de eliminar */}
        <foreignObject
          x={(startX + endX) / 2 - 16}
          y={(startY + endY) / 2 - 40}
          width="32"
          height="32"
        >
          <DeleteButton onClick={handleDelete}>
            <X size={18} />
          </DeleteButton>
        </foreignObject>
      </RelationGroup>
    </svg>
  );
};

export default AssociationRelation;