// src/services/clienteService.js
import api from './api';

export const getClientes = async () => {
  const response = await api.get('/clientes');
  return response.data;
};

export const createCliente = async (cliente) => {
  const response = await api.post('/clientes', cliente);
  return response.data;
};

