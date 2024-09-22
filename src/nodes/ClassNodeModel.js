// src/nodes/ClassNodeModel.js
import { DefaultNodeModel, DefaultPortModel } from '@projectstorm/react-diagrams'; // Importar DefaultPortModel

class ClassNodeModel extends DefaultNodeModel {
  constructor(name = 'Clase', color = 'rgb(0,192,255)') {
    super({
      name,
      color,
      type: 'class-node' // Asegúrate de usar un identificador único
    });
    this.addPort(this.createPort('top'));
    this.addPort(this.createPort('bottom'));
    this.addPort(this.createPort('left'));
    this.addPort(this.createPort('right'));
  }

  // Método para crear un puerto
  createPort(position) {
    return this.addPort(new DefaultPortModel({
      in: true,
      name: `${position}-port`
    }));
  }

  serialize() {
    return {
      ...super.serialize(),
      name: this.options.name,
      color: this.options.color
    };
  }

  deserialize(event) {
    super.deserialize(event);
    this.options.name = event.data.name;
    this.options.color = event.data.color;
  }
}

export default ClassNodeModel;
