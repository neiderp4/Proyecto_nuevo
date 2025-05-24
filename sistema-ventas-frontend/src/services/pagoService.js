import api from './api';

export const obtenerPagos = async () => {
  const res = await api.get('/api/pagos/');
  return res.data;
};

export const crearPago = async (pago) => {
  const res = await api.post('/api/pagos/', pago);
  return res.data;
};

export const eliminarPago = async (id) => {
  const res = await api.delete(`/api/pagos/${id}`);
  return res.data;
};


