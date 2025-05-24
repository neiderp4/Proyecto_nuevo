// src/services/ventaService.js
import api from './api';

/**
 * Obtener todas las ventas registradas desde el backend.
 * @returns {Promise<Array>} Lista de ventas
 */
export const obtenerVentas = async () => {
  try {
    const res = await api.get('/api/ventas/');
    return res.data;
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    throw error;
  }
};

/**
 * Crear una nueva venta en el backend.
 * @param {Object} venta - Datos de la venta a registrar
 * @returns {Promise<Object>} Venta creada
 */
export const crearVenta = async (venta) => {
  try {
    const res = await api.post('/api/ventas/', venta);
    return res.data;
  } catch (error) {
    console.error('Error al crear venta:', error);
    throw error;
  }
};

/**
 * Eliminar una venta del backend por su ID.
 * @param {number} id - ID de la venta a eliminar
 * @returns {Promise<Object>} Respuesta del backend
 */
export const eliminarVenta = async (id) => {
  try {
    const res = await api.delete(`/api/ventas/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error al eliminar venta:', error);
    throw error;
  }
};

