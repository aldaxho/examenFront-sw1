// src/nodes/ClassNodeFactory.js
import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';
import ClassNodeModel from './ClassNodeModel';
import ClassNodeWidget from './ClassNodeWidget';

export class ClassNodeFactory extends AbstractReactFactory {
  constructor() {
    super('class-node'); // Debe coincidir con el tipo de nodo en el modelo
  }

  generateModel(event) {
    return new ClassNodeModel();
  }

  generateReactWidget(event) {
    return <ClassNodeWidget node={event.model} />;
  }
}
