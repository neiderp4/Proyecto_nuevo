import { useState, useEffect } from 'react';
import { descargarReporteVentas, descargarReporteCliente, obtenerSaldos } from '../services/reporteService';
import { getClientes } from '../services/clienteService';

export default function Reportes() {
  const [clientes, setClientes] = useState([]);
  const [saldos, setSaldos] = useState([]);
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    tipo_venta: '',
    estado: ''
  });
  const [idCliente, setIdCliente] = useState('');

  useEffect(() => {
    getClientes().then(setClientes);
    obtenerSaldos().then(setSaldos);
  }, []);

  const handleReporteVentas = async () => {
    const res = await descargarReporteVentas(filtros);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reporte_ventas.pdf');
    document.body.appendChild(link);
    link.click();
  };

  const handleReporteCliente = async () => {
    if (!idCliente) return alert('Seleccione un cliente');
    const res = await descargarReporteCliente(idCliente);
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cliente_${idCliente}.pdf`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h2 className="text-2xl font-bold">Reportes</h2>

      {/* Reporte de Ventas */}
      <div className="bg-white p-4 shadow rounded-xl border">
        <h3 className="text-lg font-semibold mb-2">Reporte de Ventas</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            type="date"
            value={filtros.fecha_inicio}
            onChange={(e) => setFiltros({ ...filtros, fecha_inicio: e.target.value })}
            className="border rounded px-3 py-2"
            placeholder="Fecha inicio"
          />
          <input
            type="date"
            value={filtros.fecha_fin}
            onChange={(e) => setFiltros({ ...filtros, fecha_fin: e.target.value })}
            className="border rounded px-3 py-2"
            placeholder="Fecha fin"
          />
          <select
            value={filtros.tipo_venta}
            onChange={(e) => setFiltros({ ...filtros, tipo_venta: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">Tipo de venta</option>
            <option value="contado">Contado</option>
            <option value="credito">Crédito</option>
          </select>
          <select
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">Estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagada">Pagada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
        <button
          onClick={handleReporteVentas}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Descargar PDF
        </button>
      </div>

      {/* Reporte por Cliente */}
      <div className="bg-white p-4 shadow rounded-xl border">
        <h3 className="text-lg font-semibold mb-2">Reporte por Cliente</h3>
        <select
          className="border rounded px-3 py-2 w-full"
          value={idCliente}
          onChange={(e) => setIdCliente(e.target.value)}
        >
          <option value="">Seleccione un cliente</option>
          {clientes.map((c) => (
            <option key={c.id_cliente} value={c.id_cliente}>
              {c.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={handleReporteCliente}
          className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Descargar PDF
        </button>
      </div>

      {/* Vista de Saldos */}
      <div className="bg-white p-4 shadow rounded-xl border">
        <h3 className="text-lg font-semibold mb-2">Saldos Pendientes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Venta</th>
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Pagado</th>
                <th className="px-4 py-2">Saldo</th>
                <th className="px-4 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {saldos.map((s) => (
                <tr key={s.id_venta} className="border-t">
                  <td className="px-4 py-2">{s.id_venta}</td>
                  <td className="px-4 py-2">{s.nombre_cliente}</td>
                  <td className="px-4 py-2">{new Date(s.fecha_venta).toLocaleDateString()}</td>
                  <td className="px-4 py-2">${s.total_venta.toFixed(2)}</td>
                  <td className="px-4 py-2">${s.total_pagado.toFixed(2)}</td>
                  <td className="px-4 py-2">${s.saldo_pendiente.toFixed(2)}</td>
                  <td className="px-4 py-2">{s.estado_pago}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
