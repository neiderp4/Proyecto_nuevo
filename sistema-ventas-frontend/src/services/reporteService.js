import api from './api';

export const descargarReporteVentas = async (params) => {
  const response = await api.get('/reportes/ventas', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

export const descargarReporteCliente = async (clienteId) => {
  const response = await api.get(`/reportes/cliente/${clienteId}`, {
    responseType: 'blob'
  });
  return response.data;
};

export const obtenerSaldos = async () => {
  const response = await api.get('/reportes/saldos');
  return response.data;
};
