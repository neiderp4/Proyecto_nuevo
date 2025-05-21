// src/services/clienteService.js
import api from './api';  // Importación desde la misma carpeta con ./

export const getClientes = async () => {
  const response = await api.get('/api/clientes');
  return response.data;
};

export const createCliente = async (cliente) => {
  const response = await api.post('/api/clientes', cliente);
  return response.data;
};

export const getCliente = async (id) => {
  const response = await api.get(`/api/clientes/${id}`);
  return response.data;
};

export const updateCliente = async (id, cliente) => {
  const response = await api.put(`/api/clientes/${id}`, cliente);
  return response.data;
};

export const deleteCliente = async (id) => {
  const response = await api.delete(`/api/clientes/${id}`);
  return response.data;
};

export const getResumenCliente = async (id) => {
  const response = await api.get(`/api/clientes/${id}/resumen`);
  return response.data;
};