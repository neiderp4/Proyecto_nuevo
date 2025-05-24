import React, { useEffect, useState } from 'react';
import { obtenerVentas, crearVenta, eliminarVenta } from '../services/ventaService';
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
    fecha_venta: '',
  });

  useEffect(() => {
    const cargarDatos = async () => {
      setClientes(await getClientes());
      setProductos(await obtenerProductos());
      setVentas(await obtenerVentas());
    };
    cargarDatos();
  }, []);

  const limpiarFormulario = () => {
    setFormulario({ id_cliente: '', tipo_venta: 'contado' });
    setDetalle([]);
  };

  const handleClienteChange = (e) => {
    const nuevoCliente = e.target.value;
    if (detalle.length > 0) {
      const confirmar = window.confirm(
        'Cambiar de cliente eliminará los productos seleccionados. ¿Deseas continuar?'
      );
      if (!confirmar) return;
    }
    setFormulario({ ...formulario, id_cliente: nuevoCliente });
    setDetalle([]);
  };

  const agregarProducto = () => {
    setDetalle([...detalle, {
      id_producto: '',
      cantidad: 1,
      precio_unitario: 0,
      subtotal: 0,
    }]);
  };

  const actualizarDetalle = (index, campo, valor) => {
    const nuevos = [...detalle];
    if (campo === 'id_producto') {
      const producto = productos.find(p => p.id_producto === parseInt(valor));
      nuevos[index].id_producto = parseInt(valor);
      nuevos[index].precio_unitario = producto ? producto.precio_unitario : 0;
    } else if (campo === 'cantidad') {
      nuevos[index].cantidad = parseInt(valor);
    } else if (campo === 'precio_unitario') {
      nuevos[index].precio_unitario = parseFloat(valor);
    } else if (campo === 'fecha_entrega') {
      nuevos[index].fecha_entrega = valor;
    }
    nuevos[index].subtotal = (nuevos[index].cantidad || 0) * (nuevos[index].precio_unitario || 0);
    setDetalle(nuevos);
  };

  const calcularTotal = () =>
    detalle.reduce((sum, d) => sum + (d.cantidad * d.precio_unitario || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const total = calcularTotal();
      const venta = {
        ...formulario,
        id_cliente: parseInt(formulario.id_cliente),
        total,
        detalles: detalle
      };
      await crearVenta(venta);
      alert('Venta registrada correctamente');
      limpiarFormulario();
      setVentas(await obtenerVentas());
    } catch (error) {
      console.error('Error al crear venta:', error);
      alert('Error al registrar venta');
    }
  };

  const handleEliminarVenta = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta venta?')) return;
    try {
      await eliminarVenta(id);
      setVentas(await obtenerVentas());
    } catch (error) {
      console.error('Error al eliminar venta:', error);
      alert('No se pudo eliminar la venta');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Registro de Ventas</h2>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow space-y-4 border">
        <div className="grid md:grid-cols-3 gap-4">
          <select
            name="id_cliente"
            value={formulario.id_cliente}
            onChange={handleClienteChange}
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
            <div key={index} className="grid md:grid-cols-5 gap-2 mb-2">
              <select
                value={item.id_producto}
                onChange={(e) => actualizarDetalle(index, 'id_producto', e.target.value)}
                className="border px-2 py-1 rounded"
                required
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
                required
              />
              <input
                type="number"
                placeholder="Precio"
                value={item.precio_unitario}
                onChange={(e) => actualizarDetalle(index, 'precio_unitario', e.target.value)}
                className="border px-2 py-1 rounded"
                min="0"
                step="0.01"
                required
              />
              <input
                type="date"
                value={item.fecha_entrega}
                onChange={(e) => actualizarDetalle(index, 'fecha_entrega', e.target.value)}
                className="border px-2 py-1 rounded"
                required
              />
              <div className="flex items-center font-semibold">
                ${isNaN(item.subtotal) ? '0.00' : item.subtotal.toFixed(2)}
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

        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition"
          >
            Registrar venta
          </button>
          <button
            type="button"
            onClick={limpiarFormulario}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Limpiar
          </button>
        </div>
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
                <th className="py-2 px-4">Acciones</th>
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
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleEliminarVenta(v.id_venta)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Eliminar
                    </button>
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
