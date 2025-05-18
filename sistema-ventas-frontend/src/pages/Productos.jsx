// src/pages/Productos.jsx
import { useEffect, useState } from 'react';
import { obtenerProductos, crearProducto } from '../services/productoService';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    precio_unitario: '',
  });

  const obtenerLista = async () => {
    const datos = await obtenerProductos();
    setProductos(datos);
  };

  useEffect(() => {
    obtenerLista();
  }, []);

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await crearProducto({
      ...formulario,
      precio_unitario: parseFloat(formulario.precio_unitario),
    });
    setFormulario({ nombre: '', descripcion: '', precio_unitario: '' });
    obtenerLista();
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Gestión de Productos</h2>
      
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-md p-4 space-y-4 border border-gray-200"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <input
            type="text"
            name="nombre"
            value={formulario.nombre}
            onChange={handleChange}
            placeholder="Nombre del producto"
            className="border rounded-lg px-3 py-2 w-full"
            required
          />
          <input
            type="text"
            name="descripcion"
            value={formulario.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            className="border rounded-lg px-3 py-2 w-full"
          />
          <input
            type="number"
            name="precio_unitario"
            value={formulario.precio_unitario}
            onChange={handleChange}
            placeholder="Precio unitario"
            className="border rounded-lg px-3 py-2 w-full"
            step="0.01"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Guardar producto
        </button>
      </form>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Lista de productos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Nombre</th>
                <th className="py-2 px-4">Descripción</th>
                <th className="py-2 px-4">Precio</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id_producto} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{p.id_producto}</td>
                  <td className="py-2 px-4">{p.nombre}</td>
                  <td className="py-2 px-4">{p.descripcion}</td>
                  <td className="py-2 px-4">${p.precio_unitario.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
