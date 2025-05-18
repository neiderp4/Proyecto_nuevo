import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout'; // Asegúrate de que este archivo exista
import Clientes from './pages/Clientes';
import Productos from './pages/Productos';
import Ventas from './pages/Ventas';
import Pagos from './pages/Pagos';
import Reportes from './pages/Reportes';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<h1 className="text-xl font-semibold">Bienvenido al Sistema de Ventas</h1>} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="productos" element={<Productos />} />
        <Route path="ventas" element={<Ventas />} />
        <Route path="pagos" element={<Pagos />} />
        <Route path="reportes" element={<Reportes />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;

