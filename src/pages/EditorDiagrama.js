// EditorDiagrama.js
import { CanvasWidget } from '@projectstorm/react-canvas-core';
import createEngine, { DiagramModel } from '@projectstorm/react-diagrams';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import AssociationRelation from '../components/AssociationRelation';
import ClassComponent from '../components/ClassComponent';
// Importa Socket.IO Client
import io from 'socket.io-client';

const EditorDiagrama = () => {
  const { id } = useParams();
  const engineRef = useRef(createEngine());
  const socketRef = useRef();

  const [model, setModel] = useState(new DiagramModel());
  const [titulo, setTitulo] = useState('');
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [relations, setRelations] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [targetClass, setTargetClass] = useState(null);
  const [isCreatingRelation, setIsCreatingRelation] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [codigoInvitacion, setCodigoInvitacion] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [relationType, setRelationType] = useState('Asociación'); // Relación por defecto
  const [diagramaCompleto, setDiagramaCompleto] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jsonToSend, setJsonToSend] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Estado de "Cargando"
  const [downloadLink, setDownloadLink] = useState(null); // Almacena el enlace de descarga

  const enviarJSON = () => {
    // Aquí generamos el JSON actual de las clases y relaciones del diagrama
    const diagramaJSON = {
      classes,
      relations,
    };
  
    // Llamamos a la función para enviar (simular) el JSON
    enviarJSONyGenerarBackend(diagramaJSON);
  };
  
  // Función para abrir el modal con el JSON a enviar
  const mostrarJSONEnModal = () => {
    const diagramaJSON = {
      classes,
      relations,
    };

    setJsonToSend(JSON.stringify(diagramaJSON, null, 2)); // Guardar el JSON en el estado
    setIsModalOpen(true); // Abrir el modal
  };

  // Función para cerrar el modal
  const cerrarModal = () => {
    setIsModalOpen(false);
  };

  // Función para confirmar y enviar el JSON
  const confirmarEnvioJSON = () => {
    setIsModalOpen(false);
    enviarJSONyGenerarBackend(JSON.parse(jsonToSend)); // Llamar a la función para enviar el JSON
  };

  
  
  useEffect(() => {
    // Conectar al servidor de Socket.IO
    socketRef.current = io('http://localhost:3001'); // Ajusta la URL si es necesario

    // Unirse a la sala específica basada en el ID del diagrama
    socketRef.current.emit('join-room', id);

    // Escuchar eventos de movimiento de clases
    socketRef.current.on('class-moved', ({ classId, position }) => {
      // Actualizar la posición de la clase en el estado
      setClasses((prevClasses) =>
        prevClasses.map((cls) =>
          cls.id === classId ? { ...cls, x: position.x, y: position.y } : cls
        )
      );
    });

    // Escuchar evento de agregar clase
    socketRef.current.on('class-added', ({ newClass }) => {
      setClasses((prevClasses) => [...prevClasses, newClass]);
    });

    // Escuchar evento de actualizar clase
    socketRef.current.on('class-updated', ({ classId, updatedData }) => {
      setClasses((prevClasses) =>
        prevClasses.map((cls) =>
          cls.id === classId ? { ...cls, ...updatedData } : cls
        )
      );
    });

    // Escuchar evento de eliminar clase
    socketRef.current.on('class-deleted', ({ classId }) => {
      setClasses((prevClasses) =>
        prevClasses.filter((cls) => cls.id !== classId)
      );
      setRelations((prevRelations) =>
        prevRelations.filter(
          (rel) => rel.source !== classId && rel.target !== classId
        )
      );
    });

    // Escuchar evento de agregar relación
    socketRef.current.on('relation-added', ({ newRelation }) => {
      setRelations((prevRelations) => [...prevRelations, newRelation]);
    });

    // Escuchar evento de actualizar relación
    socketRef.current.on('relation-updated', ({ relationId, updatedData }) => {
      setRelations((prevRelations) =>
        prevRelations.map((rel) =>
          rel.id === relationId ? { ...rel, ...updatedData } : rel
        )
      );
    });

    // Escuchar evento de eliminar relación
    socketRef.current.on('relation-deleted', ({ relationId }) => {
      setRelations((prevRelations) =>
        prevRelations.filter((rel) => rel.id !== relationId)
      );
    });

    // Limpiar la conexión al desmontar el componente
    return () => {
      socketRef.current.disconnect();
    };
  }, [id]);
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setModel(model);
    }
  }, [model]);
  
  useEffect(() => {
    const cargarDiagrama = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3001/api/diagramas/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const diagrama = response.data;
        setTitulo(diagrama.titulo);
        setClasses(diagrama.contenido.classes || []);
        setRelations(diagrama.contenido.relations || []);
        setDiagramaCompleto(diagrama.contenido);
        setLoading(false); 
     
      } catch (error) {
        console.error('Error al cargar el diagrama:', error);
        setLoading(false);
      }
    };

    cargarDiagrama();
  }, [id]);

  useEffect(() => {
    if (isCreatingRelation) {
      const handleMouseMove = (e) => {
        setCursorPosition({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isCreatingRelation]);

  const agregarClase = () => {
    const newId = `class-${Date.now()}`;
    const newClass = {
      id: newId,
      name: 'Nueva Clase',
      x: 100 + classes.length * 20,
      y: 100,
      attributes: [`id_${newId} (PK)`],
      methods: [],
    };
    setClasses((prevClasses) => [...prevClasses, newClass]);

    // Emitir evento específico
    socketRef.current.emit('add-class', {
      roomId: id,
      newClass,
    });
  };

const obtenerUsuarios = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(
      `http://localhost:3001/api/invitations/${id}/users`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setUsuarios(response.data);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
  }
};

  const handleClassUpdate = (classId, updatedData) => {
    if (typeof updatedData !== 'object' || Array.isArray(updatedData)) {
      console.error('Los datos actualizados no tienen el formato esperado:', updatedData);
      return;
    }

    setClasses((prevClasses) =>
      prevClasses.map((cls) =>
        cls.id === classId ? { ...cls, ...updatedData } : cls
      )
    );

    // Emitir evento específico
    socketRef.current.emit('update-class', {
      roomId: id,
      classId,
      updatedData,
    });
  };

  const handleClassDelete = (classId) => {
    setClasses((prevClasses) =>
      prevClasses.filter((cls) => cls.id !== classId)
    );
    setRelations((prevRelations) =>
      prevRelations.filter((rel) => rel.source !== classId && rel.target !== classId)
    );

    // Emitir evento específico
    socketRef.current.emit('delete-class', {
      roomId: id,
      classId,
    });
  };

  const handleClassClick = (classItem) => {
    if (isCreatingRelation) {
      if (!selectedClass) {
        setSelectedClass(classItem);
      } else if (selectedClass && selectedClass.id !== classItem.id) {
        setTargetClass(classItem);
        // Aquí es donde llamas a la función según el tipo de relación
      if (relationType === 'Composición') {
        agregarComposicion(); // Cambia el tipo de relación aquí
      } else if (relationType === 'Generalización') {
        agregarGeneralizacion(); // Cambia el tipo de relación aquí
      } else if (relationType === 'Muchos a Muchos') {
        agregarMuchosAMuchos(); // Cambia el tipo de relación aquí
      } else {
        agregarRelacion('Asociación'); // Asociación como tipo por defecto
      }
      }
    }
  };

  const agregarRelacion = (type) => {
    if (selectedClass && targetClass) {
      const multiplicidadOrigen = prompt("Ingrese la multiplicidad del origen", "1");
      const multiplicidadDestino = prompt("Ingrese la multiplicidad del destino", "1..*");

      if (multiplicidadOrigen && multiplicidadDestino) {
        const newRelation = {
          id: `rel-${Date.now()}`,
          source: selectedClass.id,
          target: targetClass.id,
          type,
          multiplicidadOrigen,
          multiplicidadDestino,
        };
        setRelations((prevRelations) => [...prevRelations, newRelation]);

        // Emitir evento al servidor
        socketRef.current.emit('add-relation', { roomId: id, newRelation });

        setSelectedClass(null);
        setTargetClass(null);
        setIsCreatingRelation(false);
      } else {
        alert("Debe ingresar las multiplicidades.");
      }
    } else {
      alert("Debe seleccionar dos clases para crear una relación.");
    }
  };

  // Crear relación de asociación
  //const crearAsociacion = () => agregarRelacion('Asociación');
  
  const agregarComposicion = () => {
    if (selectedClass && targetClass) {
      // La multiplicidad es fija para la composición
      const newRelation = {
        id: `rel-${Date.now()}`,
        source: selectedClass.id,
        target: targetClass.id,
        type: 'Composición',
        multiplicidadOrigen: '1', // En una composición, la clase origen tiene una multiplicidad fija de 1
        multiplicidadDestino: '', // No se necesita en la composición
        marker: 'diamondFilled' // Rellenar el rombo para composición
      };
  
      setRelations((prevRelations) => [...prevRelations, newRelation]);
      setSelectedClass(null);
      setTargetClass(null);
      setIsCreatingRelation(false);
  
      // Emitir evento al servidor
      socketRef.current.emit('add-relation', {
        roomId: id,
        newRelation,
      });
    }
  };
  
  const agregarGeneralizacion = () => {
    if (selectedClass && targetClass) {
      // La generalización no necesita multiplicidades, por lo tanto, las omitimos
      const newRelation = {
        id: `rel-${Date.now()}`,
        source: selectedClass.id,
        target: targetClass.id,
        type: 'Generalización',
        multiplicidadOrigen: '', // No es necesario para la generalización
        multiplicidadDestino: '', // No es necesario para la generalización
        marker: 'triangle' // Flecha para generalización
      };
  
      setRelations((prevRelations) => [...prevRelations, newRelation]);
      setSelectedClass(null);
      setTargetClass(null);
      setIsCreatingRelation(false);
  
      // Emitir evento al servidor
      socketRef.current.emit('add-relation', {
        roomId: id,
        newRelation,
      });
    }
  };
  
  
  const agregarMuchosAMuchos = () => {
    if (selectedClass && targetClass) {
      const classIntermediaId = `class-${Date.now()}`;
      const classIntermedia = {
        id: classIntermediaId,
        name: 'Clase Intermedia',
        x: (selectedClass.x + targetClass.x) / 2,
        y: (selectedClass.y + targetClass.y) / 2,
        attributes: [],
        methods: []
      };
      setClasses((prevClasses) => [...prevClasses, classIntermedia]);
  
      const relation1 = {
        id: `rel-${Date.now()}-1`,
        source: selectedClass.id,
        target: classIntermediaId,
        type: 'Uno a Muchos',
        multiplicidadOrigen: '1',
        multiplicidadDestino: '*'
      };
      const relation2 = {
        id: `rel-${Date.now()}-2`,
        source: targetClass.id,
        target: classIntermediaId,
        type: 'Uno a Muchos',
        multiplicidadOrigen: '1',
        multiplicidadDestino: '*'
      };
  
      setRelations((prevRelations) => [...prevRelations, relation1, relation2]);
      socketRef.current.emit('add-relation', { roomId: id, newRelation: relation1 });
      socketRef.current.emit('add-relation', { roomId: id, newRelation: relation2 });
  
      setSelectedClass(null);
      setTargetClass(null);
      setIsCreatingRelation(false);
    }
  };
  
  
  const handleUpdateRelation = (relationId, updatedData) => {
    setRelations((prevRelations) =>
      prevRelations.map((rel) =>
        rel.id === relationId ? { ...rel, ...updatedData } : rel
      )
    );

    // Emitir evento específico al servidor
    socketRef.current.emit('update-relation', {
      roomId: id,
      relationId,
      updatedData,
    });
  };

  const handleDeleteRelation = (relationId) => {
    setRelations((prevRelations) =>
      prevRelations.filter((rel) => rel.id !== relationId)
    );

    // Emitir evento específico al servidor
    socketRef.current.emit('delete-relation', {
      roomId: id,
      relationId,
    });
  };

  const guardarDiagrama = async () => {
    const contenidoActual = {
      classes,
      relations,
    };

    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/diagramas/${id}`, {
        titulo,
        contenido: contenidoActual,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Diagrama guardado con éxito');
    } catch (error) {
      console.error('Error al guardar el diagrama:', error);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.1, 0.5));
  };

  // Función para generar UUIDs únicos
  const generateUUID = () => {
    // Generar un UUID de 36 caracteres
    return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, function () {
      return Math.floor(Math.random() * 16).toString(16);
    }).toUpperCase();
  };
  const exportarXMI = () => {
    const xmlDoc = document.implementation.createDocument(null, null, null);
  
    // Crear el elemento raíz XMI
    const xmiElement = xmlDoc.createElement('xmi:XMI');
    xmiElement.setAttribute('xmi:version', '2.1');
    xmiElement.setAttribute('xmlns:xmi', 'http://schema.omg.org/spec/XMI/2.1');
    xmiElement.setAttribute('xmlns:uml', 'http://schema.omg.org/spec/UML/2.1');
  
    // XMI Documentation
    const xmiDocumentation = xmlDoc.createElement('xmi:Documentation');
    xmiDocumentation.setAttribute('exporter', 'Tu Aplicación');
    xmiDocumentation.setAttribute('exporterVersion', '1.0');
    xmiElement.appendChild(xmiDocumentation);
  
    // Crear el modelo UML
    const umlModel = xmlDoc.createElement('uml:Model');
    umlModel.setAttribute('xmi:type', 'uml:Model');
    umlModel.setAttribute('name', titulo || 'ModeloExportado');
    umlModel.setAttribute('visibility', 'public');
  
    // Crear paquete
    const umlPackage = xmlDoc.createElement('packagedElement');
    umlPackage.setAttribute('xmi:type', 'uml:Package');
    umlPackage.setAttribute('xmi:id', `pkg_${generateUUID()}`);
    umlPackage.setAttribute('name', 'PaqueteExportado');
    umlPackage.setAttribute('visibility', 'public');
  
    // Agregar clases
    classes.forEach((cls) => {
      const classElement = xmlDoc.createElement('packagedElement');
      classElement.setAttribute('xmi:type', 'uml:Class');
      classElement.setAttribute('xmi:id', cls.id);
      classElement.setAttribute('name', cls.name);
      classElement.setAttribute('visibility', 'public');
  
      // Agregar atributos
      cls.attributes.forEach((attr) => {
        const attributeElement = xmlDoc.createElement('ownedAttribute');
        attributeElement.setAttribute('xmi:type', 'uml:Property');
        attributeElement.setAttribute('xmi:id', `attr_${generateUUID()}`);
        attributeElement.setAttribute('name', attr);
        attributeElement.setAttribute('visibility', 'private');
        classElement.appendChild(attributeElement);
      });
  
      // Agregar métodos
      cls.methods.forEach((method) => {
        const methodElement = xmlDoc.createElement('ownedOperation');
        methodElement.setAttribute('xmi:type', 'uml:Operation');
        methodElement.setAttribute('xmi:id', `op_${generateUUID()}`);
        methodElement.setAttribute('name', method);
        methodElement.setAttribute('visibility', 'public');
        classElement.appendChild(methodElement);
      });
  
      umlPackage.appendChild(classElement);
    });
  
    // Agregar las relaciones
    relations.forEach((rel) => {
      if (rel.type === 'Generalización' || rel.type === 'Generalize') {
        // Generalización (Generalize)
        const generalizationElement = xmlDoc.createElement('generalization');
        generalizationElement.setAttribute('xmi:type', 'uml:Generalization');
        generalizationElement.setAttribute('xmi:id', `gen_${generateUUID()}`);
        generalizationElement.setAttribute('general', rel.target); // Clase padre
        generalizationElement.setAttribute('specific', rel.source); // Clase hija
        umlPackage.appendChild(generalizationElement);
  
      } else if (rel.type === 'Muchos a Muchos' || rel.type === 'Association Class') {
        // Relación muchos a muchos con clase intermedia (Association Class)
        const associationClassElement = xmlDoc.createElement('packagedElement');
        associationClassElement.setAttribute('xmi:type', 'uml:AssociationClass');
        associationClassElement.setAttribute('xmi:id', `assoc_${generateUUID()}`);
        associationClassElement.setAttribute('name', 'ClaseIntermedia'); // Nombre de la clase intermedia
  
        // Definir los extremos de la relación
        const memberEnd1 = xmlDoc.createElement('memberEnd');
        memberEnd1.setAttribute('xmi:idref', rel.source);
        associationClassElement.appendChild(memberEnd1);
  
        const memberEnd2 = xmlDoc.createElement('memberEnd');
        memberEnd2.setAttribute('xmi:idref', rel.target);
        associationClassElement.appendChild(memberEnd2);
  
        umlPackage.appendChild(associationClassElement);
  
      } else {
        // Asociación o Composición
        const associationElement = xmlDoc.createElement('packagedElement');
        associationElement.setAttribute('xmi:type', 'uml:Association');
        associationElement.setAttribute('xmi:id', rel.id);
        associationElement.setAttribute('visibility', 'public');
  
        // Crear los extremos de la relación
        const ownedEnd1 = xmlDoc.createElement('ownedEnd');
        ownedEnd1.setAttribute('xmi:type', 'uml:Property');
        ownedEnd1.setAttribute('xmi:id', `end1_${generateUUID()}`);
        ownedEnd1.setAttribute('aggregation', rel.type === 'Composición' ? 'composite' : 'none');
        ownedEnd1.setAttribute('type', rel.source);
        associationElement.appendChild(ownedEnd1);
  
        const ownedEnd2 = xmlDoc.createElement('ownedEnd');
        ownedEnd2.setAttribute('xmi:type', 'uml:Property');
        ownedEnd2.setAttribute('xmi:id', `end2_${generateUUID()}`);
        ownedEnd2.setAttribute('aggregation', 'none');
        ownedEnd2.setAttribute('type', rel.target);
        associationElement.appendChild(ownedEnd2);
  
        // Definir los miembros finales de la relación
        const memberEnd1 = xmlDoc.createElement('memberEnd');
        memberEnd1.setAttribute('xmi:idref', ownedEnd1.getAttribute('xmi:id'));
        associationElement.appendChild(memberEnd1);
  
        const memberEnd2 = xmlDoc.createElement('memberEnd');
        memberEnd2.setAttribute('xmi:idref', ownedEnd2.getAttribute('xmi:id'));
        associationElement.appendChild(memberEnd2);
  
        umlPackage.appendChild(associationElement);
      }
    });
  
    umlModel.appendChild(umlPackage);
    xmiElement.appendChild(umlModel);
  
    // Serializar y descargar
    const serializer = new XMLSerializer();
    const xmiString = serializer.serializeToString(xmiElement);
  
    const blob = new Blob([xmiString], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${titulo || 'diagrama'}.xmi`;
    link.click();
  };
  
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) {
      alert("No se seleccionó ningún archivo");
      return;
    }
  
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const xmiText = e.target.result;
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmiText, "application/xml");
  
      const importedClasses = [];
      const importedRelations = [];
  
      // Extraer las clases dependiendo del tipo de archivo
      const classElements = xmlDoc.getElementsByTagName("packagedElement");
      for (let i = 0; i < classElements.length; i++) {
        const classEl = classElements[i];
        if (classEl.getAttribute("xmi:type") === "uml:Class" || classEl.getAttribute("xmi:type") === "Class") {
          const attributes = [];
          const attributeElements = classEl.getElementsByTagName("ownedAttribute");
          for (let j = 0; j < attributeElements.length; j++) {
            const attrEl = attributeElements[j];
            const attributeName = attrEl.getAttribute("name");
            attributes.push(attributeName || "AtributoDesconocido");
          }
  
          const classObj = {
            id: classEl.getAttribute("xmi:id"),
            name: classEl.getAttribute("name"),
            x: Math.random() * 600,
            y: Math.random() * 400,
            attributes,
            methods: [],
          };
          importedClasses.push(classObj);
        }
      }
  
      // Validar clase por ID
      const getClassById = (id) => {
        return importedClasses.find((cls) => cls.id === id);
      };
  
      // Extraer relaciones de generalización
      const generalizationElements = xmlDoc.getElementsByTagName("generalization");
      for (let i = 0; i < generalizationElements.length; i++) {
        const relationEl = generalizationElements[i];
        const sourceId = relationEl.getAttribute("specific");
        const targetId = relationEl.getAttribute("general");
  
        const sourceClass = getClassById(sourceId);
        const targetClass = getClassById(targetId);
  
        if (!sourceClass || !targetClass) {
          console.error(`Clase faltante para la relación: Generalización. Source: ${sourceId}, Target: ${targetId}`);
        } else {
          const relationObj = {
            id: relationEl.getAttribute("xmi:id"),
            source: sourceId,
            target: targetId,
            type: "Generalización",
          };
          importedRelations.push(relationObj);
        }
      }
  
      // Extraer asociaciones y composiciones
      const associationElements = xmlDoc.getElementsByTagName("packagedElement");
      for (let i = 0; i < associationElements.length; i++) {
        const assocEl = associationElements[i];
        if (assocEl.getAttribute("xmi:type") === "uml:Association" || assocEl.getAttribute("xmi:type") === "Association") {
          const ends = assocEl.getElementsByTagName("ownedEnd");
          const memberEnds = assocEl.getElementsByTagName("memberEnd");
          let sourceId = null;
          let targetId = null;
  
          if (ends.length > 0) {
            sourceId = ends[0]?.getAttribute("type");
            targetId = ends[1]?.getAttribute("type");
          } else if (memberEnds.length > 0) {
            sourceId = memberEnds[0]?.getAttribute("xmi:idref");
            targetId = memberEnds[1]?.getAttribute("xmi:idref");
          }
  
          const sourceClass = getClassById(sourceId);
          const targetClass = getClassById(targetId);
  
          if (!sourceClass || !targetClass) {
            console.error(`Clase faltante para la relación: Asociación. Source: ${sourceId}, Target: ${targetId}`);
          } else {
            const aggregation = ends[0]?.getAttribute("aggregation");
            const relationType = aggregation === "composite" ? "Composición" : "Asociación";
  
            const relationObj = {
              id: assocEl.getAttribute("xmi:id"),
              source: sourceId,
              target: targetId,
              type: relationType,
              multiplicidadOrigen: "1",
              multiplicidadDestino: "1..*",
            };
            importedRelations.push(relationObj);
          }
        }
      }
  
      // Extraer AssociationClass (Muchos a Muchos con clase intermedia)
      const associationClassElements = xmlDoc.getElementsByTagName("packagedElement");
      for (let i = 0; i < associationClassElements.length; i++) {
        const assocClassEl = associationClassElements[i];
        if (assocClassEl.getAttribute("xmi:type") === "uml:AssociationClass") {
          const ends = assocClassEl.getElementsByTagName("ownedEnd");
          const sourceId = ends[0]?.getAttribute("type");
          const targetId = ends[1]?.getAttribute("type");
  
          const sourceClass = getClassById(sourceId);
          const targetClass = getClassById(targetId);
  
          if (!sourceClass || !targetClass) {
            console.error(`Clase faltante para la relación: AssociationClass. Source: ${sourceId}, Target: ${targetId}`);
          } else {
            const relationObj = {
              id: assocClassEl.getAttribute("xmi:id"),
              source: sourceId,
              target: targetId,
              type: "AssociationClass",
              multiplicidadOrigen: "1..*",
              multiplicidadDestino: "1..*",
            };
            importedRelations.push(relationObj);
          }
        }
      }
  
      console.log("Clases importadas:", importedClasses);
      console.log("Relaciones importadas:", importedRelations);
  
      setClasses(importedClasses);
      setRelations(importedRelations);
    };
  
    reader.readAsText(file);
  };
  // Función para descargar el JSON
  const downloadJSON = (data) => {
    const jsonData = JSON.stringify(data, null, 2); // Convierte los datos a JSON con formato
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagrama.json"; // Nombre del archivo
    a.click();
    URL.revokeObjectURL(url);
  };



  const Modal = ({ isOpen, onClose, jsonContent, onConfirm }) => {
    if (!isOpen) return null;
  
    return (
      <div style={modalStyle}>
        <div style={modalContentStyle}>
          <h3>Revisa el JSON antes de enviarlo</h3>
          <pre style={preStyle}>{jsonContent}</pre>
          <button onClick={onConfirm}>Confirmar y Enviar</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      </div>
    );
  };
 // Estilos para el modal
const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalContentStyle = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '10px',
  width: '80%',
  maxHeight: '80%',
  overflowY: 'auto',
};

const preStyle = {
  backgroundColor: '#f4f4f4',
  padding: '10px',
  borderRadius: '5px',
  maxHeight: '300px',
  overflowY: 'scroll',
};
const enviarJSONyGenerarBackend = async (diagramaJSON) => {
  try {
    setIsLoading(true); // Mostrar el estado de cargando

    // Hacer la solicitud al backend para generar el código de Spring Boot y recibir un archivo ZIP
    const response = await axios.post('http://localhost:3001/generate-backend', { diagramaJSON }, {
      responseType: 'blob' // Especifica que la respuesta es un archivo binario (ZIP)
    });

    // Crear un archivo Blob con el contenido del archivo ZIP
    const blob = new Blob([response.data], { type: 'application/zip' });

    // Generar un enlace de descarga para el archivo ZIP
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spring-boot-backend.zip'; // Nombre del archivo a descargar
    document.body.appendChild(a); // Agregar el enlace al DOM
    a.click(); // Simular el clic para descargar
    document.body.removeChild(a); // Remover el enlace del DOM

  } catch (error) {
    console.error('Error al generar el backend:', error);
  } finally {
    setIsLoading(false); // Ocultar el estado de cargando siempre, incluso si ocurre un error
  }
};


  const parseMultiplicity = (multiplicidad) => {
    let lower = '1';
    let upper = '1';
  

    if (multiplicidad.includes('..')) {
      const parts = multiplicidad.split('..');
      lower = parts[0] === '*' ? '-1' : parts[0];
      upper = parts[1] === '*' ? '-1' : parts[1];
    } else {
      lower = multiplicidad === '*' ? '-1' : multiplicidad;
      upper = lower;
    }
  
    return { lower, upper };
  };
  const invalidarCodigoInvitacion = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:3001/api/invitations/${id}/invitations/${codigoInvitacion}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCodigoInvitacion('');
      alert('Código de invitación invalidado');
    } catch (error) {
      console.error('Error al invalidar el código de invitación:', error);
    }
  };
  
  const generarCodigoInvitacion = async () => {
    try {
      const token = localStorage.getItem('token');
  
      const response = await axios.post(
        `http://localhost:3001/api/invitations/${id}/invitations`,
        { permiso: 'editor' }, // O 'lector' según lo que quieras
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCodigoInvitacion(response.data.codigoInvitacion);
      alert(`Código de invitación generado: ${response.data.codigoInvitacion}`);
    } catch (error) {
      //console.log('ID del Diagrama:', id);

      console.error('Error al generar aaa código de invitación:', error,id);
    }
  };
  const canvasWidth = classes.length > 0 ? Math.max(...classes.map(cls => cls.x)) + 500 : 1000;
  const canvasHeight = classes.length > 0 ? Math.max(...classes.map(cls => cls.y)) + 500 : 1000;

  if (loading || !engineRef.current) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Editor de Diagramas</h2>
      <button onClick={agregarClase}>Agregar Clase</button>
{/*       <button onClick={() => setIsCreatingRelation(true)}>asociacion</button> */}
      <button onClick={() => { setRelationType('Asociación'); setIsCreatingRelation(true); }}>Crear Asociasion</button>
      <button onClick={() => { setRelationType('Composición'); setIsCreatingRelation(true); }}>Crear Composición</button>
<button onClick={() => { setRelationType('Generalización'); setIsCreatingRelation(true); }}>Crear Generalización</button>
<button onClick={() => { setRelationType('Muchos a Muchos'); setIsCreatingRelation(true); }}>Crear Muchos a Muchos</button>
      <button onClick={guardarDiagrama}>Guardar Diagrama</button>
      <button onClick={handleZoomIn}>Aumentar Zoom</button>
      <button onClick={handleZoomOut}>Disminuir Zoom</button>
      <button onClick={exportarXMI}>Exportar a XMI</button>
      <button onClick={() => diagramaCompleto && downloadJSON(diagramaCompleto)}>
      Descargar JSON
    </button>
    <button onClick={mostrarJSONEnModal}>Revisar y Enviar JSON</button>

      {/* Mostrar spinner o mensaje de cargando mientras se genera el backend */}
      {isLoading && <p>Generando Spring Boot... Por favor espera.</p>}

      {/* Renderizar el modal con el JSON y el botón para confirmar */}
{/* Renderizamos el modal */}
<Modal
  isOpen={isModalOpen}
  onClose={cerrarModal}
  jsonContent={jsonToSend}
  onConfirm={confirmarEnvioJSON}
/>

   
      <input
          type="file"
          accept=".xmi"
          onChange={handleFileImport}
          style={{ marginRight: '10px' }}
        />


      <button onClick={generarCodigoInvitacion}>Generar Código de Invitación</button>
      <button onClick={obtenerUsuarios}>Ver Usuarios</button>     
      {usuarios.length > 0 && (
  <div>
    <h3>Usuarios con acceso:</h3>
    <ul>
      {usuarios.map((item) => (
        <li key={item.id}>
          {item.Usuario.nombre} ({item.permiso})
        </li>
      ))}
    </ul>
  </div>)}
      {codigoInvitacion && (
        <div>
          <p>Código de Invitación: {codigoInvitacion}</p>
          <button onClick={invalidarCodigoInvitacion}>Invalidar Código</button>
        </div>
      )}
      <div
        style={{
          height: `${canvasHeight}px`,
          width: `${canvasWidth}px`,
          backgroundColor: isCreatingRelation ? '#e0f7fa' : '#f0f0f0',
          position: 'relative',
          border: isCreatingRelation ? '2px dashed blue' : 'none',
          transform: `scale(${zoomLevel})`,
          transformOrigin: '0 0',
        }}
      >
        <CanvasWidget engine={engineRef.current} />
        {classes.map((classItem) => (
          <ClassComponent
            key={classItem.id}
            id={classItem.id}
            className={classItem.name}
            x={classItem.x}
            y={classItem.y}
            attributes={classItem.attributes}
            methods={classItem.methods}
            onPositionChange={(pos) => handleClassUpdate(classItem.id, pos)}
            onUpdate={handleClassUpdate}
            onDelete={() => handleClassDelete(classItem.id)}
            onSelect={() => handleClassClick(classItem)}
            isSelected={selectedClass && selectedClass.id === classItem.id}
            socket={socketRef.current} // Pasamos el socket          
            idDiagrama={id} // Añadido
          />
        ))}
        {relations.map((relation) => {
          const sourceClass = classes.find((cls) => cls.id === relation.source);
          const targetClass = classes.find((cls) => cls.id === relation.target);
          if (!sourceClass || !targetClass) return null;
          return (
            <AssociationRelation
              key={relation.id}
              sourceClass={sourceClass}
              targetClass={targetClass}
              relation={relation}
              onUpdate={handleUpdateRelation}
              onDelete={handleDeleteRelation}
            />
          );
        })}

        {isCreatingRelation && selectedClass && (
          <svg style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
            <line
              x1={selectedClass.x + 100}
              y1={selectedClass.y + 30}
              x2={cursorPosition.x}
              y2={cursorPosition.y}
              stroke="black"
              strokeDasharray="5,5"
              strokeWidth={2}
            />
          </svg>
        )}
      </div>
    </div>
  );
};

export default EditorDiagrama;
