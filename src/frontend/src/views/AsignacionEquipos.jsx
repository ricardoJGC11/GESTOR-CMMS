import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { equipoService } from '../services/equipoService';
import api from '../services/api'; // Para jalar usuarios de tu módulo de auth

const AsignacionEquipos = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados de selección (Almacenan IDs numéricos por debajo)
  const [equipoSeleccionado, setEquipoSeleccionado] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');

  const cargarDatosDimanicos = async () => {
    try {
      setLoading(true);
      // 1. Jalar asignaciones detalladas (usando el endpoint tipo GET #7 del backend)
      const resAsignaciones = await api.get('/equipos/asignaciones/detalles');
      setAsignaciones(resAsignaciones.data);

      // 2. Jalar cuadrillas disponibles para los dropdowns
      const resEquipos = await equipoService.getEquipos();
      setEquipos(resEquipos);

      // 3. Jalar usuarios del sistema (Ajusta la ruta según tu auth.py o usuarios.py)
      const resUsuarios = await api.get('/auth/usuarios'); 
      setUsuarios(resUsuarios.data);

      // Inicializar selectores por defecto si hay datos
      if (resEquipos.length > 0) setEquipoSeleccionado(resEquipos[0].id);
      if (resUsuarios.length > 0) setUsuarioSeleccionado(resUsuarios[0].id);

    } catch (err) {
      setError('Error al sincronizar los catálogos de personal o cuadrillas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosDimanicos();
  }, []);

  const handleAsignar = async (e) => {
    e.preventDefault();
    if (!equipoSeleccionado || !usuarioSeleccionado) return;
    setError('');
    setSuccess('');

    try {
      // Consume tu endpoint #5 usando los IDs capturados del dropdown
      await equipoService.asignarMiembro(equipoSeleccionado, usuarioSeleccionado);
      setSuccess('Técnico asignado exitosamente.');
      cargarDatosDimanicos(); // Recarga la tabla de relaciones
    } catch (err) {
      setError(err || 'El usuario ya pertenece a esta cuadrilla.');
    }
  };

  const handleRemover = async (equipoId, usuarioId) => {
    if (!window.confirm('¿Remover a este técnico de la cuadrilla?')) return;
    setError('');
    setSuccess('');

    try {
      // Consume tu endpoint #6
      await equipoService.removerMiembro(equipoId, usuarioId);
      setSuccess('Asignación removida.');
      cargarDatosDimanicos();
    } catch (err) {
      setError(err || 'No se pudo completar la operación.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#333333]">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-white italic">ASIGNACIÓN DE PERSONAL</h1>
          <div className="h-1 w-20 bg-amber-500 mt-2"></div>
        </header>

        {error && <div className="mb-6 bg-red-600/20 text-red-400 p-4 rounded-xl border border-red-500/30 text-sm">⚠ {error}</div>}
        {success && <div className="mb-6 bg-emerald-600/20 text-emerald-400 p-4 rounded-xl border border-emerald-500/30 text-sm">✓ {success}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* FORMULARIO CON DROPDOWNS AUTOMÁTICOS */}
          <div className="bg-[#222222] p-6 rounded-2xl border border-white/5 shadow-lg h-fit">
            <h2 className="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
              <span>🔗</span> Vincular Operador
            </h2>
            
            <form onSubmit={handleAsignar} className="space-y-5">
              {/* SELECT DE CUADRILLAS */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Seleccionar Cuadrilla</label>
                <select
                  className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm cursor-pointer"
                  value={equipoSeleccionado}
                  onChange={(e) => setEquipoSeleccionado(e.target.value)}
                >
                  {equipos.map(e => (
                    <option key={e.id} value={e.id}>{e.codigo_equipo} - {e.nombre_equipo}</option>
                  ))}
                </select>
              </div>

              {/* SELECT DE USUARIOS */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Seleccionar Técnico / Operario</label>
                <select
                  className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm cursor-pointer"
                  value={usuarioSeleccionado}
                  onChange={(e) => setUsuarioSeleccionado(e.target.value)}
                >
                  {usuarios.map(u => (
                    <option key={u.id} value={u.id}>{u.username} - {u.nombre_completo} ({u.rol})</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-all shadow-md mt-2">
                Establecer Asignación
              </button>
            </form>
          </div>

          {/* TABLA DE RELACIONES DETALLADAS */}
          <div className="xl:col-span-2 bg-[#222222] p-6 rounded-2xl border border-white/5 shadow-lg overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📋</span> Distribución de Personal Activo
            </h2>

            <div className="overflow-x-auto">
              {loading ? (
                <p className="text-slate-400 text-sm animate-pulse">Cargando asignaciones...</p>
              ) : asignaciones.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No hay operarios asignados a ninguna cuadrilla aún.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-4 pl-2">Cuadrilla</th>
                      <th className="pb-4">Técnico</th>
                      <th className="pb-4">Especialidad/Rol</th>
                      <th className="pb-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                    {asignaciones.map((asig, index) => (
                      <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 pl-2">
                          <span className="font-mono font-bold text-amber-500 mr-2">{asig.codigo_equipo}</span>
                          <span className="text-white text-xs">{asig.nombre_equipo}</span>
                        </td>
                        <td className="py-4 font-bold text-slate-200">{asig.nombre_completo} <span className="text-xs font-mono text-slate-500">({asig.username})</span></td>
                        <td className="py-4"><span className="px-2 py-0.5 bg-zinc-800 text-slate-400 rounded text-xs">{asig.rol}</span></td>
                        <td className="py-4 text-center">
                          <button 
                            onClick={() => handleRemover(asig.equipo_id, asig.usuario_id)} 
                            className="bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition-all"
                          >
                            Remover
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

export default AsignacionEquipos;