import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { equipoService } from '../services/equipoService';

const GestionEquipos = () => {
  const [cuadrillas, setCuadrillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados del formulario controlados bajo tu esquema SQL
  const [idEditando, setIdEditando] = useState(null); 
  const [codigoEquipo, setCodigoEquipo] = useState('');
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [areaAsignada, setAreaAsignada] = useState('Planta A');
  const [descripcion, setDescripcion] = useState('');

  const esAdmin = (localStorage.getItem('user_role') || '').trim() === 'Administrador'; //nueva linea

  const cargarCuadrillas = async () => {
    try {
      setLoading(true);
      const data = await equipoService.getEquipos();
      setCuadrillas(data);
    } catch (err) {
      setError('No se pudieron recuperar las cuadrillas de la planta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCuadrillas();
  }, []);

  const iniciarEdicion = (cuadrilla) => {
    setIdEditando(cuadrilla.id);
    setCodigoEquipo(cuadrilla.codigo_equipo);
    setNombreEquipo(cuadrilla.nombre_equipo);
    setAreaAsignada(cuadrilla.area_asignada);
    setDescripcion(cuadrilla.descripcion || '');
    setError('');
    setSuccess('');
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    setCodigoEquipo('');
    setNombreEquipo('');
    setAreaAsignada('Planta A');
    setDescripcion('');
    setError('');
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!codigoEquipo.trim() || !nombreEquipo.trim()) return;
    setError('');
    setSuccess('');

    const equipoData = {
      codigo_equipo: codigoEquipo.toUpperCase(),
      nombre_equipo: nombreEquipo,
      area_asignada: areaAsignada,
      descripcion: descripcion
    };

    try {
      if (idEditando) {
        await equipoService.actualizarEquipo(idEditando, equipoData);
        setSuccess('Cuadrilla actualizada correctamente en Postgres.');
      } else {
        await equipoService.crearEquipo(equipoData);
        setSuccess('Cuadrilla registrada con éxito.');
      }
      cancelarEdicion();
      cargarCuadrillas();
    } catch (err) {
      setError(err || 'Ocurrió un error en la operación.');
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta cuadrilla? Esta acción no se puede deshacer.')) return;
    setError('');
    setSuccess('');

    try {
      await equipoService.eliminarEquipo(id);
      setSuccess('Cuadrilla eliminada del sistema.');
      cargarCuadrillas();
    } catch (err) {
      setError(err || 'No se puede eliminar la cuadrilla porque tiene dependencias operativas.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#333333]">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-white italic">GESTIÓN DE CUADRILLAS</h1>
          <div className="h-1 w-20 bg-amber-500 mt-2"></div>
        </header>

        {error && <div className="mb-6 bg-red-600/20 text-red-400 p-4 rounded-xl border border-red-500/30 text-sm">⚠ {error}</div>}
        {success && <div className="mb-6 bg-emerald-600/20 text-emerald-400 p-4 rounded-xl border border-emerald-500/30 text-sm">✓ {success}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* FORMULARIO */}
          {esAdmin && (
          <div className="bg-[#222222] p-6 rounded-2xl border border-white/5 shadow-lg h-fit">
            <h2 className="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2">
              <span>{idEditando ? '📝' : '➕'}</span> {idEditando ? 'Modificar Cuadrilla' : 'Registrar Cuadrilla'}
            </h2>
            
            <form onSubmit={handleGuardar} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Código de Equipo (No repetible)</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm font-mono"
                  value={codigoEquipo}
                  onChange={(e) => setCodigoEquipo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre de la Cuadrilla</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm"
                  value={nombreEquipo}
                  onChange={(e) => setNombreEquipo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Área Asignada</label>
                <select
                  className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm cursor-pointer"
                  value={areaAsignada}
                  onChange={(e) => setAreaAsignada(e.target.value)}
                >
                  <option value="Planta A">Planta A</option>
                  <option value="Planta B">Planta B</option>
                  <option value="Servicios Críticos">Servicios Críticos</option>
                  <option value="Talleres Centrales">Talleres Centrales</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descripción / Notas técnico-operativas</label>
                <textarea
                  rows="3"
                  className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm resize-none"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-all shadow-md">
                  {idEditando ? 'Actualizar' : 'Guardar'}
                </button>
                {idEditando && (
                  <button type="button" onClick={cancelarEdicion} className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
          )}

          {/* TABLA CON DESCRIPCIÓN INCLUIDA */}
          <div className="xl:col-span-2 bg-[#222222] p-6 rounded-2xl border border-white/5 shadow-lg overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span>📋</span> Cuadrillas Activas (equipos de trabajo)
            </h2>

            <div className="overflow-x-auto">
              {loading ? (
                <p className="text-slate-400 text-sm animate-pulse">Sincronizando con la planta...</p>
              ) : cuadrillas.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No hay cuadrillas registradas en el sistema.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-4 pl-2">Código</th>
                      <th className="pb-4">Nombre Equipo</th>
                      <th className="pb-4">Área Asignada</th>
                      <th className="pb-4">Descripción</th>
                      {/* permiso admin */}
                      {esAdmin && <th className="pb-4 text-center">Acciones</th>}
                      <th className="pb-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                    {cuadrillas.map((cuadrilla) => (
                      <tr key={cuadrilla.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 pl-2 font-mono font-bold text-amber-500">{cuadrilla.codigo_equipo}</td>
                        <td className="py-4 font-bold text-white">{cuadrilla.nombre_equipo}</td>
                        <td className="py-4">
                          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-md text-xs font-semibold">
                            {cuadrilla.area_asignada}
                          </span>
                        </td>
                        {/* COLUMNA DE DESCRIPCIÓN CORREGIDA */}
                        <td className="py-4 text-slate-400 text-xs max-w-xs truncate" title={cuadrilla.descripcion}>
                          {cuadrilla.descripcion || <span className="italic text-slate-600">Sin descripción</span>}
                        </td>
                        {/* INSERCIÓN AQUÍ */}
                        {esAdmin && (
                        <td className="py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => iniciarEdicion(cuadrilla)} className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-900 px-3 py-1 rounded-lg text-xs font-bold transition-all">
                              Editar
                            </button>
                            <button onClick={() => handleEliminar(cuadrilla.id)} className="bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition-all">
                              Eliminar
                            </button>
                          </div>
                        </td>
                        )}
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

export default GestionEquipos;