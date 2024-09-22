// src/nodes/ClassNodeWidget.js
import * as React from 'react';
import { PortWidget } from '@projectstorm/react-diagrams';

const ClassNodeWidget = ({ node }) => {
  return (
    <div
      style={{
        background: node.options.color,
        borderRadius: '5px',
        padding: '10px',
        width: '150px',
        height: '100px',
        position: 'relative'
      }}
    >
      <div>{node.options.name}</div>
      <PortWidget
        style={{ position: 'absolute', top: -8, left: '50%', transform: 'translate(-50%, 0)' }}
        engine={node.getEngine()}
        port={node.getPort('top-port')}
      />
      <PortWidget
        style={{ position: 'absolute', bottom: -8, left: '50%', transform: 'translate(-50%, 0)' }}
        engine={node.getEngine()}
        port={node.getPort('bottom-port')}
      />
      <PortWidget
        style={{ position: 'absolute', top: '50%', left: -8, transform: 'translate(0, -50%)' }}
        engine={node.getEngine()}
        port={node.getPort('left-port')}
      />
      <PortWidget
        style={{ position: 'absolute', top: '50%', right: -8, transform: 'translate(0, -50%)' }}
        engine={node.getEngine()}
        port={node.getPort('right-port')}
      />
    </div>
  );
};

export default ClassNodeWidget;
