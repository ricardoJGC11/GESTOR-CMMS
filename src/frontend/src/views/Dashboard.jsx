import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { dashboardService } from '../services/dashboardService';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    pendientes: 0,
    en_proceso: 0,
    terminadas: 0,
    total_cuadrillas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarMetricas = async () => {
      try {
        const data = await dashboardService.getStats();
        setMetrics(data);
      } catch (error) {
        console.error("No se pudieron sincronizar los KPIs:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarMetricas();
  }, []);

  const stats = [
    { title: "OTs Pendientes", value: loading ? "..." : metrics.pendientes, color: "bg-red-500" },
    { title: "En Proceso", value: loading ? "..." : metrics.en_proceso, color: "bg-amber-500" },
    { title: "Terminadas", value: loading ? "..." : metrics.terminadas, color: "bg-emerald-500" },
    { title: "Cuadrillas", value: loading ? "..." : metrics.total_cuadrillas, color: "bg-blue-500" },
  ];

  return (
    <div className="flex min-h-screen bg-[#333333]">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-white italic">PANEL DE CONTROL</h1>
          <div className="h-1 w-20 bg-amber-500 mt-2"></div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#222222] p-6 rounded-2xl border border-white/5 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.title}</p>
                  <p className="text-4xl font-black text-white mt-2">{stat.value}</p>
                </div>
                <div className={`w-3 h-12 ${stat.color} rounded-full`}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-[#222222] p-8 rounded-3xl border border-white/5">
          <h2 className="text-xl font-bold text-amber-500 mb-4">Bienvenido al Gestor de Planta</h2>
          <p className="text-slate-300 leading-relaxed">
            Desde este panel puedes gestionar el mantenimiento preventivo y correctivo de la planta. 
            Utiliza el menú lateral para gestionar el personal, asignar órdenes de trabajo o revisar 
            los costos en el historial técnico.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;