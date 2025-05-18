import api from './api';

export const obtenerPagos = async () => {
  const res = await api.get('/pagos/');
  return res.data;
};

export const crearPago = async (pago) => {
  const res = await api.post('/pagos/', pago);
  return res.data;
};
