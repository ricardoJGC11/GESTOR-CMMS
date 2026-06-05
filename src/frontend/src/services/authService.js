import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/auth';

export const authService = {
  // 1. Función para iniciar sesión
  login: async (username, password) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(`${API_URL}/login`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // CORRECCIÓN: Leer el objeto "user" según la respuesta de FastAPI
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        const userData = response.data.user;
        if (userData) {
          localStorage.setItem('user_role', userData.rol || 'Operador');
          localStorage.setItem('user_name', userData.nombre || 'Usuario Planta');
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.detail || 'Error al iniciar sesión';
    }
  },

  // 2. Función para cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
  },

  // 3. Obtener el token actual guardado
  getCurrentToken: () => {
    return localStorage.getItem('token');
  }
};