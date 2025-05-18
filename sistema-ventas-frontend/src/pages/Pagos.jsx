import { useEffect, useState } from 'react';
import { crearPago, obtenerPagos } from '../services/pagoService';
import { obtenerVentas } from '../services/ventaService';

export default function Pagos() {
  const [pagos, setPagos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [formulario, setFormulario] = useState({
    id_venta: '',
    monto: '',
    metodo_pago: '',
    observaciones: ''
  });

  const cargarDatos = async () => {
    setPagos(await obtenerPagos());
    setVentas(await obtenerVentas());
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await crearPago(formulario);
    setFormulario({
      id_venta: '',
      monto: '',
      metodo_pago: '',
      observaciones: ''
    });
    setPagos(await obtenerPagos());
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Registro de Pagos</h2>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow space-y-4 border">
        <select
          name="id_venta"
          value={formulario.id_venta}
          onChange={(e) => setFormulario({ ...formulario, id_venta: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
          required
        >
          <option value="">Seleccione venta</option>
          {ventas.map((v) => (
            <option key={v.id_venta} value={v.id_venta}>
              Venta #{v.id_venta} - Cliente {v.cliente?.nombre || v.id_cliente}
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

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Pagos registrados</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Venta</th>
                <th className="py-2 px-4">Monto</th>
                <th className="py-2 px-4">Método</th>
                <th className="py-2 px-4">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((p) => (
                <tr key={p.id_pago} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{p.id_pago}</td>
                  <td className="py-2 px-4">#{p.id_venta}</td>
                  <td className="py-2 px-4">${p.monto.toFixed(2)}</td>
                  <td className="py-2 px-4">{p.metodo_pago}</td>
                  <td className="py-2 px-4">{new Date(p.fecha_pago).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
