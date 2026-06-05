import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/auth';

export const usuarioService = {
  // 1. Obtener todos los usuarios (Corregido a /usuarios)
  getUsuarios: async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/usuarios`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // 2. Registrar un nuevo usuario (Manteniendo /register)
  crearUsuario: async (usuarioData) => {
    const token = localStorage.getItem('token');
    // Tu endpoint pide query parameters o un formato mixto para nombre_completo y rol.
    // Pasamos los parámetros en la URL mediante 'params' para acoplarse a tu definición de Python.
    const response = await axios.post(`${API_URL}/register`, 
      { 
        username: usuarioData.username, 
        password: usuarioData.password 
      }, 
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          nombre_completo: usuarioData.nombre_completo,
          rol: usuarioData.rol
        }
      }
    );
    return response.data;
  },

  // 3. LA FUNCIÓN QUE FALTA (Asegúrate de que esté dentro de las llaves del objeto)
  eliminarUsuario: async (id) => {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/usuarios/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};


