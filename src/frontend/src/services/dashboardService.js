import api from './api';

export const dashboardService = {
  getStats: async () => {
    try {
      const response = await api.get('/ordenes/stats'); // Cambiado a /ordenes/stats
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Error al cargar estadísticas';
    }
  }
};