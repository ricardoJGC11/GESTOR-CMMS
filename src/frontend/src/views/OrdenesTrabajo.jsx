import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { ordenService } from '../services/ordenService';
import { cuadrillaService } from '../services/cuadrillaService';
import { historialService } from '../services/historialService';

const OrdenesTrabajo = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [cuadrillas, setCuadrillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulario Nueva OT
  const [codigoOt, setCodigoOt] = useState('');
  const [componente, setComponente] = useState('');
  const [prioridad, setPrioridad] = useState('Media');
  const [cuadrillaId, setCuadrillaId] = useState('');

  // Modal de Cierre
  const [mostrarModalCierre, setMostrarModalCierre] = useState(false);
  const [otSeleccionada, setOtSeleccionada] = useState(null);
  const [tipoMantenimiento, setTipoMantenimiento] = useState('Correctivo');
  const [descripcionActividad, setDescripcionActividad] = useState('');
  const [costoRepuestos, setCostoRepuestos] = useState(0);

  const inicializarVista = async () => {
    try {
      setLoading(true);
      const [resOrdenes, resCuadrillas] = await Promise.all([
        ordenService.getOrdenes(),
        cuadrillaService.getCuadrillas()
      ]);
      setOrdenes(resOrdenes);
      setCuadrillas(resCuadrillas);
      if (resCuadrillas.length > 0) setCuadrillaId(resCuadrillas[0].id);
    } catch (err) {
      setError('Error al sincronizar datos operativos con la planta.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    inicializarVista();
  }, []);

  const handleCrearOT = async (e) => {
    e.preventDefault();
    if (!codigoOt.trim() || !componente.trim() || !cuadrillaId) return;
    setError(''); setSuccess('');

    const nuevaOtData = {
      codigo_ot: codigoOt.trim().toUpperCase(),
      componente_intervenido: componente.trim(),
      prioridad: prioridad,
      equipo_trabajo_id: Number(cuadrillaId)
    };

    try {
      await ordenService.crearOrden(nuevaOtData);
      setSuccess(`Orden ${nuevaOtData.codigo_ot} aperturada con éxito.`);
      setCodigoOt(''); setComponente('');
      inicializarVista();
    } catch (err) {
      console.dir(err.response?.data);
      setError(err.response?.data?.detail || 'Error al emitir la orden de trabajo.');
    }
  };

  const handleAvanzarEstado = async (id, estadoActual) => {
    setError(''); setSuccess('');
    let siguienteEstado = estadoActual === 'Pendiente' ? 'En Proceso' : 'Terminada';

    try {
      await ordenService.actualizarEstado(id, siguienteEstado);
      setSuccess(`Orden actualizada a: ${siguienteEstado}`);
      inicializarVista();
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al modificar el estado de la OT.');
    }
  };

  const handleAbrirCierre = (ot) => {
    setOtSeleccionada(ot);
    setMostrarModalCierre(true);
  };

  const handleEjecutarCierreHistorial = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const fechaAjustada = new Date().toISOString().split('T')[0];

    const historialData = {
      fecha: fechaAjustada,
      tipo: tipoMantenimiento,
      descripcion_actividad: descripcionActividad.trim(),
      costo_repuestos: Number(costoRepuestos),
      orden_origen_id: otSeleccionada.id,
      equipo_trabajo_id: otSeleccionada.equipo_trabajo_id,
      tecnico_responsable_id: Number(localStorage.getItem('user_id') || 1) 
    };

    try {
      await historialService.registrarMantenimiento(historialData);
      setSuccess(`OT ${otSeleccionada.codigo_ot} finalizada y archivada en historial.`);
      setMostrarModalCierre(false);
      setOtSeleccionada(null);
      setDescripcionActividad('');
      setCostoRepuestos(0);
      inicializarVista();
    } catch (err) {
      console.log("Error completo recibido:", err.response?.data);

      const detalle = err.response?.data?.detail;
      
      // Validamos si el detalle es un objeto/arreglo de validación de FastAPI (Error 422)
      if (typeof detalle === 'object' && Array.isArray(detalle)) {
        // Tomamos el mensaje del primer campo que falló mapeando su locación y mensaje
        const msgError = detalle.map(e => `Campo [${e.loc[1]}]: ${e.msg}`).join(', ');
        setError(msgError);
      } else if (typeof detalle === 'string') {
        // Si el backend mandó un string plano (Error 400 o 404 custom)
        setError(detalle);
      } else {
        setError('Error de validación en los datos del historial técnico.');
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-[#333333]">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-white italic">ÓRDENES DE TRABAJO (OT)</h1>
          <div className="h-1 w-20 bg-amber-500 mt-2"></div>
        </header>

        {error && <div className="mb-6 bg-red-600/20 text-red-400 p-4 rounded-xl border border-red-500/30 text-sm">⚠ {error}</div>}
        {success && <div className="mb-6 bg-emerald-600/20 text-emerald-400 p-4 rounded-xl border border-emerald-500/30 text-sm">✓ {success}</div>}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* APERTURA DE OT */}
          <div className="bg-[#222222] p-6 rounded-2xl border border-white/5 shadow-lg h-fit">
            <h2 className="text-xl font-bold text-amber-500 mb-6 flex items-center gap-2"><span>🛠</span> Aperturar Orden</h2>
            <form onSubmit={handleCrearOT} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Código OT</label>
                <input type="text" required className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm font-mono" value={codigoOt} onChange={(e) => setCodigoOt(e.target.value)} placeholder="ej: OT-2026-01" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Componente / Activo Intervenido</label>
                <input type="text" required className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm" value={componente} onChange={(e) => setComponente(e.target.value)} placeholder="ej: Motor Extractor Banda A" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Prioridad</label>
                  <select className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm cursor-pointer" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Cuadrilla Responsable</label>
                  <select className="w-full bg-[#333333] text-white px-4 py-2.5 rounded-xl border border-white/10 focus:border-amber-500 outline-none text-sm cursor-pointer" value={cuadrillaId} onChange={(e) => setCuadrillaId(e.target.value)}>
                    {cuadrillas.map((c) => (<option key={c.id} value={c.id}>{c.nombre_equipo || `Cuadrilla #${c.id}`}</option>))}
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-2.5 rounded-xl text-sm transition-all shadow-md mt-2">Liberar Orden en Planta</button>
            </form>
          </div>

          {/* LISTADO OPERATIVO */}
          <div className="xl:col-span-2 bg-[#222222] p-6 rounded-2xl border border-white/5 shadow-lg overflow-hidden">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><span>📋</span> Bitácora de Piso</h2>
            <div className="overflow-x-auto">
              {loading ? (
                <p className="text-slate-400 text-sm animate-pulse">Consultando órdenes...</p>
              ) : ordenes.length === 0 ? (
                <p className="text-slate-500 text-sm italic">No existen órdenes de trabajo activas.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="pb-4 pl-2">Código</th>
                      <th className="pb-4">Componente</th>
                      <th className="pb-4">Prioridad</th>
                      <th className="pb-4">Estado</th>
                      <th className="pb-4 text-center">Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-slate-200">
                    {ordenes.map((ot) => (
                      <tr key={ot.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 pl-2 font-mono font-bold text-amber-400">{ot.codigo_ot}</td>
                        <td className="py-4 font-bold text-white">{ot.componente_intervenido}</td>
                        <td className="py-4 text-xs font-semibold">{ot.prioridad}</td>
                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                            ot.estado === 'Pendiente' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            ot.estado === 'En Proceso' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>{ot.estado}</span>
                        </td>
                        <td className="py-4 text-center">
                          {ot.estado === 'Pendiente' && (
                            <button type="button" onClick={() => handleAvanzarEstado(ot.id, ot.estado)} className="bg-sky-600/20 hover:bg-sky-600 text-sky-400 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition-all">Iniciar</button>
                          )}
                          {ot.estado === 'En Proceso' && (
                            <button type="button" onClick={() => handleAbrirCierre(ot)} className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-3 py-1 rounded-lg text-xs font-bold transition-all">Cerrar (Historial)</button>
                          )}
                          {ot.estado === 'Terminada' && <span className="text-slate-500 text-xs italic">Archivada</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* MODAL DE CIERRE TÉCNICO */}
        {mostrarModalCierre && otSeleccionada && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-[#222222] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
              <h3 className="text-lg font-black text-white italic mb-2">CIERRE TÉCNICO: {otSeleccionada.codigo_ot}</h3>
              <p className="text-xs text-slate-400 mb-6">Completa el reporte técnico para archivar la orden de mantenimiento.</p>
              <form onSubmit={handleEjecutarCierreHistorial} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tipo de Intervención</label>
                  <select className="w-full bg-[#333333] text-white px-4 py-2 rounded-xl border border-white/10 text-sm cursor-pointer" value={tipoMantenimiento} onChange={(e) => setTipoMantenimiento(e.target.value)}>
                    <option value="Correctivo">Correctivo</option>
                    <option value="Preventivo">Preventivo</option>
                    <option value="Predictivo">Predictivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Descripción de la Actividad</label>
                  <textarea required rows="3" className="w-full bg-[#333333] text-white px-4 py-2 rounded-xl border border-white/10 text-sm outline-none focus:border-emerald-500 resize-none" value={descripcionActividad} onChange={(e) => setDescripcionActividad(e.target.value)} placeholder="Detalla los trabajos ejecutados y fallas encontradas..."></textarea>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Costo Total de Repuestos ($)</label>
                  <input type="number" step="0.01" min="0" className="w-full bg-[#333333] text-white px-4 py-2 rounded-xl border border-white/10 text-sm outline-none focus:border-emerald-500 font-mono" value={costoRepuestos} onChange={(e) => setCostoRepuestos(e.target.value)} />
                </div>
                <div className="flex gap-4 pt-2">
                  <button type="button" onClick={() => setMostrarModalCierre(false)} className="flex-1 bg-[#333333] text-white py-2 rounded-xl text-sm font-bold hover:bg-[#444444] transition-all">Cancelar</button>
                  <button type="submit" className="flex-1 bg-emerald-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-md">Archivar y Cerrar</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default OrdenesTrabajo;