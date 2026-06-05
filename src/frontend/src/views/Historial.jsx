import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { historialService } from '../services/historialService';

const HistorialTecnico = () => {
  const [historial, setHistorial] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    historialService.getHistorial().then(data => {
      setHistorial(data);
      setLoading(false);
    });
  }, []);

  // Filtro dinámico por descripción o tipo
  const registrosFiltrados = historial.filter(item => 
    item.descripcion_actividad.toLowerCase().includes(busqueda.toLowerCase()) ||
    item.tipo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#333333]">
      <Sidebar />
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-black text-white italic">BITÁCORA TÉCNICA</h1>
            <p className="text-slate-400 text-sm">Registro histórico inmutable de intervenciones.</p>
          </div>
          <input 
            type="text" 
            placeholder="🔍 Filtrar registros..." 
            className="bg-[#222222] text-white px-4 py-2 rounded-xl border border-white/10 outline-none focus:border-amber-500 text-sm"
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </header>

        <div className="bg-[#222222] rounded-2xl border border-white/5 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-black/20 text-slate-400 text-xs uppercase font-bold">
              <tr>
                <th className="p-4">Fecha</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Actividad</th>
                <th className="p-4 text-right">Costo Repuestos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-slate-300">
              {registrosFiltrados.map((h) => (
                <tr key={h.id} className="hover:bg-white/[0.02]">
                  <td className="p-4 font-mono">{h.fecha}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-white/5 rounded text-xs">{h.tipo}</span></td>
                  <td className="p-4 max-w-md truncate">{h.descripcion_actividad}</td>
                  <td className="p-4 text-right font-mono text-emerald-400">${h.costo_repuestos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default HistorialTecnico;