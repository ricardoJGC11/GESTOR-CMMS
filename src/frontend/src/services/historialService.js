import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/historial'; // Ajusta si el prefix en tu router cambia

export const historialService = {
  // POST /historial/ -> Registra el mantenimiento y cierra la OT automáticamente en el Backend
  registrarMantenimiento: async (historialData) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/`, historialData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
  // --- NUEVA FUNCIÓN (AGRÉGALA AQUÍ ABAJO) ---
  getHistorial: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Ordenamos por fecha descendente para que lo más reciente aparezca arriba
    return response.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }
};