import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/ordenes';

export const ordenService = {
  // GET /ordenes
  getOrdenes: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // POST /ordenes
  crearOrden: async (ordenData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/`, ordenData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // PATCH /ordenes/{id}/estado?nuevo_estado=...
  actualizarEstado: async (id, nuevoEstado) => {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/${id}/estado`, null, {
      headers: { Authorization: `Bearer ${token}` },
      params: { nuevo_estado: nuevoEstado }
    });
    return response.data;
  },

  // GET /ordenes/stats (Para el Dashboard principal)
  getStats: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};