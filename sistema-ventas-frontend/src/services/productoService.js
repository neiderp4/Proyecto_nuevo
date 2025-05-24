// src/services/productoService.js
import api from './api';

// Obtener todos los productos
export const obtenerProductos = async () => {
  const res = await api.get('/api/productos/');
  return res.data;
};

// Crear un nuevo producto
export const crearProducto = async (producto) => {
  const res = await api.post('/api/productos/', producto);
  return res.data;
};

// Obtener un producto por ID (opcional, útil para editar con carga previa)
export const obtenerProducto = async (id) => {
  const res = await api.get(`/api/productos/${id}`);
  return res.data;
};

// Actualizar un producto existente
export const actualizarProducto = async (id, producto) => {
  const res = await api.put(`/api/productos/${id}`, producto);
  return res.data;
};

// Eliminar un producto por ID
export const eliminarProducto = async (id) => {
  const res = await api.delete(`/api/productos/${id}`);
  return res.data;
};
