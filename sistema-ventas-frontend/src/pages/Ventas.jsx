import { useEffect, useState } from 'react';
import { obtenerVentas, crearVenta } from '../services/ventaService';
import { getClientes } from '../services/clienteService';
import { obtenerProductos } from '../services/productoService';


export default function Ventas() {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [detalle, setDetalle] = useState([]);
  const [formulario, setFormulario] = useState({
    id_cliente: '',
    tipo_venta: 'contado',
  });

  const cargarDatos = async () => {
    setClientes(await getClientes());
    setProductos(await obtenerProductos());
    setVentas(await obtenerVentas());
  };
  

  useEffect(() => {
    cargarDatos();
  }, []);

  const agregarProducto = () => {
    setDetalle([
      ...detalle,
      { id_producto: '', cantidad: 1, precio_unitario: 0 },
    ]);
  };

  const actualizarDetalle = (index, campo, valor) => {
    const nuevos = [...detalle];
    nuevos[index][campo] = campo === 'cantidad' || campo === 'precio_unitario'
      ? parseFloat(valor)
      : valor;
    setDetalle(nuevos);
  };

  const calcularTotal = () =>
    detalle.reduce((sum, d) => sum + d.cantidad * d.precio_unitario, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = calcularTotal();
    await crearVenta({ ...formulario, total, detalles: detalle });
    setFormulario({ id_cliente: '', tipo_venta: 'contado' });
    setDetalle([]);
    setVentas(await obtenerVentas());
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Registro de Ventas</h2>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow space-y-4 border">
        <div className="grid md:grid-cols-2 gap-4">
          <select
            name="id_cliente"
            value={formulario.id_cliente}
            onChange={(e) => setFormulario({ ...formulario, id_cliente: e.target.value })}
            className="border rounded-lg px-3 py-2"
            required
          >
            <option value="">Seleccione cliente</option>
            {clientes.map((c) => (
              <option key={c.id_cliente} value={c.id_cliente}>
                {c.nombre}
              </option>
            ))}
          </select>

          <select
            name="tipo_venta"
            value={formulario.tipo_venta}
            onChange={(e) => setFormulario({ ...formulario, tipo_venta: e.target.value })}
            className="border rounded-lg px-3 py-2"
          >
            <option value="contado">Contado</option>
            <option value="credito">Crédito</option>
          </select>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Productos</h3>
          {detalle.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 mb-2">
              <select
                value={item.id_producto}
                onChange={(e) => actualizarDetalle(index, 'id_producto', e.target.value)}
                className="border px-2 py-1 rounded"
              >
                <option value="">Producto</option>
                {productos.map((p) => (
                  <option key={p.id_producto} value={p.id_producto}>
                    {p.nombre}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Cantidad"
                value={item.cantidad}
                onChange={(e) => actualizarDetalle(index, 'cantidad', e.target.value)}
                className="border px-2 py-1 rounded"
                min="1"
              />
              <input
                type="number"
                placeholder="Precio"
                value={item.precio_unitario}
                onChange={(e) => actualizarDetalle(index, 'precio_unitario', e.target.value)}
                className="border px-2 py-1 rounded"
                step="0.01"
              />
              <div className="flex items-center font-semibold">
                ${(item.cantidad * item.precio_unitario).toFixed(2)}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={agregarProducto}
            className="text-blue-600 hover:underline text-sm mt-1"
          >
            + Agregar producto
          </button>
        </div>

        <div className="text-right font-semibold">
          Total: ${calcularTotal().toFixed(2)}
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
        >
          Registrar venta
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Ventas registradas</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-sm rounded-lg shadow-md">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Cliente</th>
                <th className="py-2 px-4">Tipo</th>
                <th className="py-2 px-4">Total</th>
                <th className="py-2 px-4">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id_venta} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{v.id_venta}</td>
                  <td className="py-2 px-4">{v.cliente?.nombre || v.id_cliente}</td>
                  <td className="py-2 px-4">{v.tipo_venta}</td>
                  <td className="py-2 px-4">${v.total.toFixed(2)}</td>
                  <td className="py-2 px-4">{new Date(v.fecha_venta).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
