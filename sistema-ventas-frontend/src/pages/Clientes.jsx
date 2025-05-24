import React, { useEffect, useState } from 'react';
import {
  getClientes,
  createCliente,
  updateCliente,
  deleteCliente,
} from '../services/clienteService';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
  });

  const [busqueda, setBusqueda] = useState('');
  const [modoEditar, setModoEditar] = useState(false);
  const [clienteEditandoId, setClienteEditandoId] = useState(null);

  const fetchClientes = async () => {
    try {
      const data = await getClientes();
      setClientes(data);
    } catch (err) {
      console.error('Error al obtener clientes', err);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) return alert('El nombre es obligatorio');

    try {
      if (modoEditar) {
        await updateCliente(clienteEditandoId, form);
        alert('Cliente actualizado correctamente');
      } else {
        await createCliente(form);
        alert('Cliente creado correctamente');
      }

      setForm({ nombre: '', telefono: '', email: '', direccion: '' });
      setModoEditar(false);
      setClienteEditandoId(null);
      fetchClientes();
    } catch (err) {
      console.error('Error al guardar cliente', err);
      alert(err.response?.data?.detail || 'Error al guardar cliente');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      await deleteCliente(id);
      fetchClientes();
    } catch (err) {
      console.error('Error al eliminar cliente', err);
      alert('No se pudo eliminar el cliente.');
    }
  };

  const handleEditar = (cliente) => {
    setForm({
      nombre: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
    });
    setClienteEditandoId(cliente.id_cliente);
    setModoEditar(true);
  };

  // Filtro de búsqueda
  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombre} ${c.email} ${c.telefono}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Gestión de Clientes</h1>

      {/* Barra de búsqueda */}
      <div className="mt-4">
        <input
          type="text"
          placeholder="Buscar por nombre, email o teléfono..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full md:w-1/2 border p-2 rounded"
        />
      </div>

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl shadow"
      >
        <div>
          <label className="block font-semibold mb-1">Nombre</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1">Dirección</label>
          <input
            type="text"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>
        <div className="col-span-full">
          <button
            type="submit"
            className={`px-6 py-2 rounded text-white ${
              modoEditar ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {modoEditar ? 'Actualizar Cliente' : 'Registrar Cliente'}
          </button>
          {modoEditar && (
            <button
              type="button"
              onClick={() => {
                setModoEditar(false);
                setClienteEditandoId(null);
                setForm({ nombre: '', telefono: '', email: '', direccion: '' });
              }}
              className="ml-4 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Lista de clientes */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <ul className="divide-y">
          {clientesFiltrados.map((c) => (
            <li
              key={c.id_cliente}
              className="p-4 flex justify-between items-center"
            >
              <div>
                <div className="font-semibold text-lg">{c.nombre}</div>
                <div className="text-sm text-gray-600">
                  {c.email || 'Sin email'} · {c.telefono || 'Sin teléfono'} ·{' '}
                  {c.direccion || 'Sin dirección'}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleEditar(c)}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(c.id_cliente)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Clientes;
