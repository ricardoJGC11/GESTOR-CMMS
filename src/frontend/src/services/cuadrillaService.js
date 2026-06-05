import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/equipos'; 

export const cuadrillaService = {
  // GET /equipos/ -> Lista las cuadrillas operativas para el <select> de la OT
  getCuadrillas: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};