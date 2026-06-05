import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [intentos, setIntentos] = useState(0); // Para el texto de abajo

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    try {
      await authService.login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Error: Usuario o contraseña incorrectos. Verifique sus credenciales.');
      setIntentos((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#333333] px-4 font-sans selection:bg-amber-500 selection:text-white">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* LOGO CMMS EN CURSIVA CON ENGRANE */}
        <div className="flex items-center gap-2 mb-6 select-none">
          <h1 className="text-5xl font-black italic text-amber-500 tracking-wider">CMMS</h1>
          <span className="text-4xl text-amber-500 animate-[spin_8s_linear_infinite]">⚙</span>
        </div>

        {/* ALERTA DE ERROR ESTILO PÍLDORA */}
        {error && (
          <div className="w-full mb-6 bg-[#ea4335] text-white px-5 py-3 rounded-2xl flex items-center gap-3 text-xs md:text-sm shadow-md border border-red-600/30">
            <span className="text-lg bg-white/20 rounded-full w-6 h-6 flex items-center justify-center font-bold">ⓘ</span>
            <p className="flex-1 text-center font-medium leading-tight">{error}</p>
          </div>
        )}

        {/* FORMULARIO */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          
          {/* CAMPO USUARIO */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-amber-500 pl-4">
              Usuario
            </label>
            <input
              type="text"
              required
              className="w-full bg-[#fff5f5] text-slate-800 px-5 py-3 rounded-full border-2 border-red-200 focus:border-amber-500 focus:bg-white outline-none font-medium transition-all shadow-inner text-center"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* CAMPO CONTRASEÑA */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-amber-500 pl-4">
              Contraseña
            </label>
            <input
              type="password"
              required
              className="w-full bg-[#fff5f5] text-slate-800 px-5 py-3 rounded-full border-2 border-red-200 focus:border-amber-500 focus:bg-white outline-none font-medium transition-all shadow-inner text-center"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* BOTÓN CONFIRMAR */}
          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-900 font-bold px-12 py-3 rounded-full shadow-md transition-all tracking-wide text-md"
            >
              {loading ? 'Cargando...' : 'Confirmar'}
            </button>
          </div>
        </form>

        {/* CONTADOR DE INTENTOS */}
        {intentos > 0 && (
          <p className="mt-4 text-xs font-semibold text-red-500 tracking-wide select-none animate-pulse">
            Intentos fallidos: {intentos} de 3
          </p>
        )}
        
      </div>
    </div>
  );
};

export default Login;