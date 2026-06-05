import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { usuarioService } from '../services/usuarioService';

const GestionUsuarios = () => {
  // 1. LOS HOOKS SIEMPRE VAN EN LA RAÍZ DEL COMPONENTE
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [rol, setRol] = useState('Operador');

  // 2. EL BLOQUEO DE SEGURIDAD SE EVALÚA DESPUÉS DE LOS HOOKS
  const esAdmin = (localStorage.getItem('user_role') || '').trim() === 'Administrador';
  if (!esAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuarioService.getUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError('No se pudieron recuperar los usuarios del sistema.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (esAdmin) {
      cargarUsuarios();
    }
  }, []);

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !nombreCompleto.trim()) return;
    setError('');
    setSuccess('');

    const usuarioData = {
      username: username.toLowerCase().trim(),
      password: password,
      nombre_completo: nombreCompleto.trim(),
      rol: rol
    };

    try {
      await usuarioService.crearUsuario(usuarioData);
      setSuccess('Usuario registrado exitosamente en la base de datos.');
      setUsername('');
      setPassword('');
      setNombreCompleto('');
      setRol('Operador');
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al registrar el usuario.');
    }
  };

  const handleEliminar = async (id, usernameTarget) => {
    // 1. Mensaje de confirmación directo sin validaciones previas de localStorage
    if (!window.confirm(`¿Está seguro de eliminar al usuario "${usernameTarget}"?`)) return;
    
    setError('');
    setSuccess('');

    try {
      console.log("Enviando petición de borrado para el ID:", id); // Rastro en consola F12
      
      // 2. Forzamos que el ID viaje como un número entero puro hacia FastAPI
      await usuarioService.eliminarUsuario(Number(id));
      
      setSuccess('Usuario removido con éxito.');
      cargarUsuarios(); // Recarga la tabla de Postgres
    } catch (err) {
      console.error("Error capturado en el borrado:", err);
      setError(err.response?.data?.detail || 'Error al intentar eliminar el usuario.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#333333]">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-white italic">CONTROL DE ACCESO Y USUARIOS</h1>
          <div className="h-1 w-20 bg-amber-500 mt-2"></div>
        </header>

        {error && <div className="mb-6 bg-red-600/20 text-red-400 p-4 rounded-xl border border-red-500/30 text-sm">⚠ {error}</div>}
        {success && <div className="mb-6 bg-emerald-600/20 text-emerald-400 p-4 rounded-xl border border-emerald-500/30 text-sm">✓ {success}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* FORMULARIO DE REGISTRO */}
          <div className="bg-[#222222] p-6 rounded-2xl border border-white/5 shadow-lg h-fit">
            <h2 className="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
              <span>👤</span> Registrar Nuevo Usuario
            </h2>
            
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Username (ID de Login)</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm font-mono"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ej: ahernandes"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contraseña Inicial</label>
                <input
                  type="password"
                  required
                  className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre Completo</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="ej: Alonso Ernandes"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Rol Asignado en Planta</label>
                <select
                  className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm cursor-pointer"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                >
                  <option value="Administrador">Administrador</option>
                  <option value="Supervisor de Planta">Supervisor de Planta</option>
                  <option value="TÉCNICO DE PRUEBAS">TÉCNICO DE PRUEBAS</option>
                  <option value="Operador">Operador</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-all shadow-md pt-2">
                Dar de Alta Usuario
              </button>
            </form>
          </div>

          {/* TABLA DE USUARIOS */}
          <div className="xl:col-span-2 bg-[#222222] p-6 rounded-2xl border border-white/5 shadow-lg overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📋</span> Operativos Registrados (`usuarios`)
            </h2>

            <div className="overflow-x-auto">
              {loading ? (
                <p className="text-slate-400 text-sm animate-pulse">Sincronizando cuentas...</p>
              ) : usuarios.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No hay más usuarios en el sistema.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-4 pl-2">ID</th>
                      <th className="pb-4">Username</th>
                      <th className="pb-4">Nombre Completo</th>
                      <th className="pb-4">Rol</th>
                      <th className="pb-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                    {usuarios.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 pl-2 text-slate-500 font-mono">{user.id}</td>
                        <td className="py-4 font-mono font-bold text-amber-400">{user.username}</td>
                        <td className="py-4 font-bold text-white">{user.nombre_completo}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            user.rol === 'Administrador' 
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                              : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {user.rol}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <button 
                            type="button"
                            onClick={() => handleEliminar(user.id, user.username)}
                            className="bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition-all"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default GestionUsuarios;