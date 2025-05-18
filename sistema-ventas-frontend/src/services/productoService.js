// src/services/productoService.js
import api from './api';

export const obtenerProductos = async () => {
  const res = await api.get('/productos/');
  return res.data;
};

export const crearProducto = async (producto) => {
  const res = await api.post('/productos/', producto);
  return res.data;
};
