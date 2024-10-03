// src/App.js
import React from 'react';
import { Buffer } from 'buffer';

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Importa Routes en lugar de Switch
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import DiagramaForm from './components/DiagramaForm'; // Importar DiagramaForm
import DiagramaEditor from './components/DiagramaEditor'; // Importar DiagramaEditor
import EditorDiagrama from './pages/EditorDiagrama'; // Importar la vista del editor de diagramas


function App() {
  return (
    <Router>
      <Routes> {/* Usamos Routes en lugar de Switch */}
        <Route path="/login" element={<Login />} /> {/* Usamos element en lugar de component */}
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/diagramas/crear" element={<DiagramaForm />} /> {/* Ruta para crear */}
        <Route path="/diagramas/editar/:id" element={<DiagramaForm />} /> {/* Ruta para editar */}
        <Route path="/diagramas/editor/:id" element={<DiagramaEditor />} /> {/* Ruta para el editor */}
        <Route path="/editor-diagrama/:id" element={<EditorDiagrama />} /> {/* Ruta para el editor */}
     
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
