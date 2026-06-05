import api from './api';

export const equipoService = {
  getEquipos: async () => {
    try {
      const response = await api.get('/equipos/');
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Error al obtener las cuadrillas';
    }
  },

  crearEquipo: async (equipoData) => {
    try {
      const response = await api.post('/equipos/', equipoData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Error al registrar la cuadrilla';
    }
  },

  // NUEVO: Método para actualizar (PUT)
  actualizarEquipo: async (id, equipoData) => {
    try {
      const response = await api.put(`/equipos/${id}`, equipoData);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Error al actualizar la cuadrilla';
    }
  },

  // NUEVO: Método para eliminar (DELETE)
  eliminarEquipo: async (id) => {
    try {
      const response = await api.delete(`/equipos/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Error al eliminar la cuadrilla';
    }
  },

  asignarMiembro: async (equipoId, usuarioId) => {
    try {
      const response = await api.post(`/equipos/${equipoId}/usuarios/${usuarioId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Error al asignar el miembro';
    }
  },

  removerMiembro: async (equipoId, usuarioId) => {
    try {
      const response = await api.delete(`/equipos/${equipoId}/usuarios/${usuarioId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Error al remover el miembro';
    }
  }
};