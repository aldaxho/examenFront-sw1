import React from 'react';

const RelationArrow = ({ sourceClass, targetClass, multiplicidadOrigen, multiplicidadDestino }) => {
  if (!sourceClass || !targetClass) return null;

  return (
    <svg
      style={{
        position: 'absolute',
        pointerEvents: 'none',
      }}
    >
      <line
        x1={sourceClass.x + 100}
        y1={sourceClass.y + 30}
        x2={targetClass.x}
        y2={targetClass.y + 30}
        stroke='black'
        strokeWidth={2}
        markerEnd="url(#arrow)"
      />
      <text x={(sourceClass.x + targetClass.x) / 2} y={(sourceClass.y + targetClass.y) / 2} fill="black">
        {multiplicidadOrigen} ➔ {multiplicidadDestino}
      </text>
      <defs>
        <marker
          id="arrow"
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="black" />
        </marker>
      </defs>
    </svg>
  );
};

export default RelationArrow;
