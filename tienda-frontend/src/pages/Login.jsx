import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  Cake,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const origen = location.state?.from?.pathname || location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const data = await login({
        username: email,
        password: password,
      });

      iniciarSesion(data);
      navigate(origen, { replace: true });
    } catch (err) {
      setError(err.message || 'Credenciales inválidas. Verifique su correo electrónico y contraseña.');
    } finally {
      setCargando(false);
    }
  };

  const cargarCredenciales = (tipo) => {
    if (tipo === 'admin') {
      setEmail('admin@dulcevicio.com');
      setPassword('Admin123!');
    } else {
      setEmail('cliente@dulcevicio.com');
      setPassword('Cliente123!');
    }
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto py-8 px-4"
    >
      <div className="bg-white rounded-3xl border border-rose-200/80 shadow-warm p-8 space-y-6">
        
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#E85D88] text-white flex items-center justify-center mx-auto shadow-md shadow-rose-500/30">
            <Cake className="w-7 h-7" />
          </div>
          <h1 className="font-serif font-bold text-3xl text-[#3B111E]">
            Bienvenido a Dulce Vicio
          </h1>
          <p className="text-xs text-stone-500">
            Ingresá a tu cuenta para continuar con tus pedidos
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl flex items-start space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 text-[#E85D88] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-xs">Error de autenticación</p>
              <p className="text-xs text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5" htmlFor="email">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                required
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#E85D88] text-[#3B111E]"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#E85D88] text-[#3B111E]"
              />
            </div>
          </div>

          {/* Botón de Ingreso */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider bg-[#3B111E] hover:bg-[#E85D88] text-white shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Ingresar</span>
              </>
            )}
          </button>
        </form>

        {/* Accesos directos de prueba */}
        <div className="pt-2 border-t border-rose-100 space-y-2">
          <p className="text-[10px] font-semibold text-stone-400 text-center uppercase tracking-wider">
            Credenciales de prueba rápida
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => cargarCredenciales('admin')}
              className="px-3 py-2 text-xs bg-[#FFF1F5] text-[#3B111E] border border-rose-200 rounded-xl hover:bg-rose-100 flex items-center justify-center space-x-1 font-semibold transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#E85D88]" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={() => cargarCredenciales('cliente')}
              className="px-3 py-2 text-xs bg-[#FAF8F5] text-stone-800 border border-stone-200 rounded-xl hover:bg-stone-100 flex items-center justify-center space-x-1 font-semibold transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-stone-600" />
              <span>Cliente Demo</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-stone-500">
          ¿Aún no tenés cuenta?{' '}
          <Link to="/registro" className="font-bold text-[#E85D88] hover:underline">
            Registrate ahora
          </Link>
        </div>

      </div>
    </motion.div>
  );
}
