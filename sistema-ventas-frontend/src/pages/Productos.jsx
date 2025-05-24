import React from 'react';
import { useEffect, useState } from 'react';
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../services/productoService';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [formulario, setFormulario] = useState({
    nombre: '',
    descripcion: '',
    precio_unitario: '',
  });

  const [modoEditar, setModoEditar] = useState(false);
  const [productoEditandoId, setProductoEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState('');

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
    try {
      const data = {
        ...formulario,
        precio_unitario: parseFloat(formulario.precio_unitario),
      };

      if (modoEditar) {
        await actualizarProducto(productoEditandoId, data);
        alert('Producto actualizado');
      } else {
        await crearProducto(data);
        alert('Producto creado');
      }

      setFormulario({ nombre: '', descripcion: '', precio_unitario: '' });
      setModoEditar(false);
      setProductoEditandoId(null);
      obtenerLista();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      alert('Error al guardar producto');
    }
  };

  const handleEditar = (producto) => {
    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio_unitario: producto.precio_unitario.toString(),
    });
    setProductoEditandoId(producto.id_producto);
    setModoEditar(true);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await eliminarProducto(id);
      obtenerLista();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      alert('Error al eliminar producto');
    }
  };

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-center">Gestión de Productos</h2>

      {/* Barra de búsqueda */}
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full md:w-1/2 border p-2 rounded"
      />

      {/* Formulario */}
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
        <div>
          <button
            type="submit"
            className={`px-6 py-2 rounded text-white ${
              modoEditar ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {modoEditar ? 'Actualizar Producto' : 'Guardar Producto'}
          </button>
          {modoEditar && (
            <button
              type="button"
              onClick={() => {
                setModoEditar(false);
                setProductoEditandoId(null);
                setFormulario({ nombre: '', descripcion: '', precio_unitario: '' });
              }}
              className="ml-4 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Tabla de productos */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Lista de productos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Nombre</th>
                <th className="py-2 px-4">Descripción</th>
                <th className="py-2 px-4">Precio</th>
                <th className="py-2 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosFiltrados.map((p) => (
                <tr key={p.id_producto} className="border-t hover:bg-gray-50">
                  <td className="py-2 px-4">{p.id_producto}</td>
                  <td className="py-2 px-4">{p.nombre}</td>
                  <td className="py-2 px-4">{p.descripcion}</td>
                  <td className="py-2 px-4">${p.precio_unitario.toFixed(2)}</td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      onClick={() => handleEditar(p)}
                      className="text-blue-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(p.id_producto)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {productosFiltrados.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
