import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Jala los datos usando las llaves individuales que ya guarda tu authService
  const usuarioSesion = {
    nombre_completo: localStorage.getItem('user_name') || 'Usuario',
    rol: localStorage.getItem('user_role') || 'Invitado'
  };

  const handleCerrarSesion = (e) => {
    e.preventDefault();
    // Limpia las llaves específicas que tu authService utiliza actualmente
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    navigate('/');
  };

  // Helper para pintar la pestaña activa con tu estilo ámbar original
  const linkClass = (path) => {
    const base = "flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ";
    return location.pathname === path
      ? base + "bg-amber-500 text-slate-900 shadow-md shadow-amber-500/20"
      : base + "text-slate-400 hover:bg-white/[0.03] hover:text-white";
  };

  return (
    <aside className="w-64 bg-[#222222] border-r border-white/5 p-4 flex flex-col justify-between min-h-screen">
      <div className="space-y-6">

        {/* LOGO CMMS EN CURSIVA CON ENGRANE */}
        <div className="flex items-center gap-2 mb-6 select-none">
          <h1 className="text-5xl font-black italic text-amber-500 tracking-wider">CMMS</h1>
          <span className="text-4xl text-amber-500 animate-[spin_8s_linear_infinite]">⚙</span>
        </div>

        {/* LOGO / CABECERA */}
        <div className="px-2 py-4 border-b border-white/5">
          <span className="text-xl font-black text-white tracking-wider italic">GESTOR <span className="text-amber-500">CMMS</span></span>
        </div>

        {/* DETALLE DEL USUARIO LOGUEADO */}
        <div className="px-4 py-2 bg-white/[0.01] rounded-xl border border-white/5">
          <p className="text-sm font-bold text-amber-500 truncate">{usuarioSesion.nombre_completo}</p>
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">{usuarioSesion.rol}</p>
        </div>

        {/* MENÚ DE NAVEGACIÓN */}
        <nav className="space-y-1.5">
          <Link to="/dashboard" className={linkClass('/dashboard')}>
            <span>📊</span> Panel de Inicio
          </Link>
          
          <Link to="/equipos" className={linkClass('/equipos')}>
            <span>🛠️</span> Gestión de Cuadrillas
          </Link>

          {/* Cambia tu línea actual por esta versión que busca "Administrador" */}
          {usuarioSesion.rol?.trim() === 'Administrador' && (
          <Link to="/asignacion" className={linkClass('/asignacion')}>
          <span>🔗</span> Asignación de Personal
          </Link>
          )}
          {/* NUEVA PESTAÑA SEPARADA PARA USUARIOS */}
          {usuarioSesion.rol?.trim() === 'Administrador' && (
            <Link to="/usuarios" className={linkClass('/usuarios')}>
              <span>👥</span> Gestión de Usuarios
            </Link>
          )}

          <Link to="/ordenes" className={linkClass('/ordenes')}>
            <span>📋</span> Órdenes de Trabajo
          </Link>

          <Link to="/historial" className={linkClass('/historial')}>
            <span>⏳</span> Historial Técnico
          </Link>
        </nav>
      </div>

      {/* BOTÓN DE CIERRE DE SESIÓN */}
      <div className="pt-4 border-t border-white/5">
        <button 
          onClick={handleCerrarSesion}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-400 hover:bg-red-500/10 transition-all text-left"
        >
          <span>🚪</span> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;