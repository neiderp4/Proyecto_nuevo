import React, { useEffect, useState } from 'react';
import { crearPago, obtenerPagos, eliminarPago } from '../services/pagoService';
import { obtenerVentas } from '../services/ventaService';

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [formulario, setFormulario] = useState({
    id_venta: '',
    monto: '',
    metodo_pago: '',
    observaciones: '',
    fecha_pago: ''
  });
  const [filtro, setFiltro] = useState({ nombre: '', fecha: '' });

  const cargarDatos = async () => {
    try {
      const [pagosData, ventasData] = await Promise.all([
        obtenerPagos(),
        obtenerVentas()
      ]);
      setPagos(pagosData);
      setVentas(ventasData);
    } catch (error) {
      console.error("Error al cargar datos", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formulario.id_venta) return alert("Debe seleccionar una venta");

    const monto = parseFloat(formulario.monto);
    if (isNaN(monto) || monto <= 0) return alert("Monto inválido");

    if (!formulario.fecha_pago) return alert("Debe ingresar una fecha");

    const venta = ventas.find(v => v.id_venta == formulario.id_venta);
    if (!venta) return alert("Venta no encontrada");

    const pagosCliente = pagos.filter(p => p.id_venta === venta.id_venta);
    const totalPagado = pagosCliente.reduce((sum, p) => sum + p.monto, 0);
    const saldoPendiente = venta.total - totalPagado;

    if (saldoPendiente <= 0) {
      return alert("Este cliente no tiene saldo pendiente para esta venta.");
    }

    try {
      await crearPago({
        ...formulario,
        monto,
        fecha_pago: new Date(formulario.fecha_pago).toISOString()
      });
      alert("Pago registrado correctamente");
      setFormulario({
        id_venta: '',
        monto: '',
        metodo_pago: '',
        observaciones: '',
        fecha_pago: ''
      });
      cargarDatos();
    } catch (error) {
      console.error("Error al registrar pago", error);
      alert("No se pudo registrar el pago. Revisa la consola.");
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Deseas eliminar este pago?")) return;
    try {
      await eliminarPago(id);
      alert("Pago eliminado correctamente");
      cargarDatos();
    } catch (err) {
      alert("No se pudo eliminar el pago.");
    }
  };

  const pagosFiltrados = pagos.filter((p) => {
    const cliente = p.venta?.cliente;
    const coincideNombre = cliente?.nombre
      ?.toLowerCase()
      .includes(filtro.nombre.toLowerCase());
    const coincideFecha = filtro.fecha
      ? new Date(p.fecha_pago).toISOString().startsWith(filtro.fecha)
      : true;
    return coincideNombre && coincideFecha;
  });

  const saldosPorCliente = {};
  ventas.forEach((venta) => {
    const cliente = venta.cliente;
    if (!cliente) return;
    const key = `${cliente.nombre} (${cliente.telefono || 'Sin teléfono'})`;
    const pagosCliente = pagos.filter(p => p.id_venta === venta.id_venta);
    const pagado = pagosCliente.reduce((s, p) => s + p.monto, 0);
    const saldo = (saldosPorCliente[key] || 0) + (venta.total - pagado);
    saldosPorCliente[key] = saldo;
  });

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Registro de Pagos</h2>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow space-y-4 border">
        <select
          name="id_venta"
          value={formulario.id_venta}
          onChange={(e) => setFormulario({ ...formulario, id_venta: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          required
        >
          <option value="">Seleccione cliente</option>
          {ventas.map((v) => (
            <option key={v.id_venta} value={v.id_venta}>
              {`${v.cliente?.nombre || 'Sin nombre'} - ${v.cliente?.telefono || 'Sin teléfono'} - ${v.cliente?.direccion || 'Sin dirección'}`}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="monto"
          placeholder="Monto"
          value={formulario.monto}
          onChange={(e) => setFormulario({ ...formulario, monto: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          min="1"
          step="0.01"
          required
        />

        <input
          type="date"
          name="fecha_pago"
          value={formulario.fecha_pago}
          onChange={(e) => setFormulario({ ...formulario, fecha_pago: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          required
        />

        <input
          type="text"
          name="metodo_pago"
          placeholder="Método de pago"
          value={formulario.metodo_pago}
          onChange={(e) => setFormulario({ ...formulario, metodo_pago: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />

        <textarea
          name="observaciones"
          placeholder="Observaciones"
          value={formulario.observaciones}
          onChange={(e) => setFormulario({ ...formulario, observaciones: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
        >
          Registrar pago
        </button>
      </form>

      <div className="flex gap-4 mt-6 mb-4">
        <input
          type="text"
          placeholder="Buscar por cliente"
          className="border px-3 py-2 rounded w-full"
          value={filtro.nombre}
          onChange={(e) => setFiltro({ ...filtro, nombre: e.target.value })}
        />
        <input
          type="date"
          className="border px-3 py-2 rounded"
          value={filtro.fecha}
          onChange={(e) => setFiltro({ ...filtro, fecha: e.target.value })}
        />
      </div>

      <div className="mb-6 bg-gray-100 p-4 rounded">
        <h3 className="font-semibold mb-2">Saldos pendientes por cliente</h3>
        <ul className="list-disc pl-6">
          {Object.entries(saldosPorCliente).map(([cliente, saldo]) => (
            <li key={cliente}>
              {cliente}: ${saldo.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Pagos registrados</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Cliente</th>
                <th className="py-2 px-4">Monto</th>
                <th className="py-2 px-4">Método</th>
                <th className="py-2 px-4">Fecha</th>
                <th className="py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((p) => (
                <tr key={p.id_pago} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{p.id_pago}</td>
                  <td className="py-2 px-4">{p.venta?.cliente?.nombre || 'Desconocido'}</td>
                  <td className="py-2 px-4">${p.monto.toFixed(2)}</td>
                  <td className="py-2 px-4">{p.metodo_pago || '—'}</td>
                  <td className="py-2 px-4">{new Date(p.fecha_pago).toLocaleDateString()}</td>
                  <td className="py-2 px-4 space-x-2">
                    {/* Botón Eliminar */}
                    <button
                      onClick={() => handleEliminar(p.id_pago)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                    {/* Botón Modificar (puede abrir un modal más adelante) */}
                    {/* <button className="text-blue-600 hover:underline">Editar</button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
