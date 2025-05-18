import api from './api';

export const obtenerVentas = async () => {
  const res = await api.get('/ventas/');
  return res.data;
};

export const crearVenta = async (venta) => {
  const res = await api.post('/ventas/', venta);
  return res.data;
};
