import React, { useEffect, useState } from 'react';
import { getClientes, createCliente, deleteCliente } from '../services/clienteService';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: ''
  });
  const [searchNombre, setSearchNombre] = useState('');

  const fetchClientes = async (nombre = '') => {
    try {
      // Si hay nombre, se pasa como parámetro para filtrar
      const data = await getClientes(nombre);
      setClientes(data);
    } catch (err) {
      console.error("Error al obtener clientes", err);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Para cuando cambia el texto de búsqueda
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchNombre(value);
    fetchClientes(value);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return alert('El nombre es obligatorio');
    try {
      await createCliente(form);
      setForm({ nombre: '', telefono: '', email: '', direccion: '' });
      fetchClientes(searchNombre); // Refrescar con filtro aplicado si hay
    } catch (err) {
      console.error('Error al crear cliente', err);
      if (err.response?.status === 400) {
        alert(err.response.data.detail);
      } else {
        alert('Error al crear cliente');
      }
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este cliente?")) return;
    try {
      await deleteCliente(id);
      fetchClientes(searchNombre);
    } catch (err) {
      console.error("Error al eliminar cliente", err);
      alert("No se pudo eliminar el cliente.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Gestión de Clientes</h1>

      {/* Campo de búsqueda */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar cliente por nombre..."
          value={searchNombre}
          onChange={handleSearchChange}
          className="border p-2 w-full rounded"
        />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow">
        <div>
          <label className="block font-semibold mb-1">Nombre</label>
          <input type="text" name="nombre" value={form.nombre} onChange={handleChange}
            className="border p-2 w-full rounded" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Teléfono</label>
          <input type="text" name="telefono" value={form.telefono} onChange={handleChange}
            className="border p-2 w-full rounded" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            className="border p-2 w-full rounded" />
        </div>
        <div>
          <label className="block font-semibold mb-1">Dirección</label>
          <input type="text" name="direccion" value={form.direccion} onChange={handleChange}
            className="border p-2 w-full rounded" />
        </div>
        <div className="col-span-full">
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
            Registrar Cliente
          </button>
        </div>
      </form>

      <div className="bg-white shadow rounded-xl overflow-hidden">
        <ul className="divide-y">
          {clientes.length === 0 ? (
            <li className="p-4 text-center text-gray-500">No hay clientes que mostrar</li>
          ) : (
            clientes.map((c) => (
              <li key={c.id_cliente} className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-lg">{c.nombre}</div>
                  <div className="text-sm text-gray-600">
                    {c.email || 'Sin email'} · {c.telefono || 'Sin teléfono'} · {c.direccion || 'Sin dirección'}
                  </div>
                </div>
                <button
                  onClick={() => handleEliminar(c.id_cliente)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default Clientes;






