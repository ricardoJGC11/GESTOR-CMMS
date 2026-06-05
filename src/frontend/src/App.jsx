import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import GestionEquipos from './views/GestionEquipos';
import AsignacionEquipos from './views/AsignacionEquipos';
import GestionUsuarios from './views/GestionUsuarios';
import OrdenesTrabajo from './views/OrdenesTrabajo';
import Historial from './views/Historial';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/equipos" element={<GestionEquipos />} />
        <Route path="/asignacion" element={<AsignacionEquipos />} /> 
        <Route path="/ordenes" element={<OrdenesTrabajo />} />
        <Route path="/usuarios" element={<GestionUsuarios />} />
        <Route path="/historial" element={<Historial />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;