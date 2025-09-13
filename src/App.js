// src/App.js
import React from 'react';
import { Buffer } from 'buffer';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import DiagramaForm from './components/DiagramaForm';
import EditorDiagrama from './pages/EditorDiagrama';

// Configurar Buffer globalmente para evitar errores
window.Buffer = window.Buffer || Buffer;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/diagramas/crear" element={<DiagramaForm />} />
        <Route path="/diagramas/editar/:id" element={<DiagramaForm />} />
        <Route path="/diagramas/editor/:id" element={<EditorDiagrama />} />
        <Route path="/editor-diagrama/:id" element={<EditorDiagrama />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
