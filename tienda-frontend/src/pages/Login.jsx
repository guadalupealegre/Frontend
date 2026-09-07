import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

  const origen = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      // El backend espera form-data con 'username' para el email
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

  // Ayudante de prueba rápida para desarrollo
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
    <div className="max-w-md mx-auto py-8 px-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-amber-100/90 shadow-warm p-6 sm:p-10 space-y-6">
        
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center mx-auto shadow-md shadow-orange-500/20">
            <Cake className="w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-stone-900">
            Bienvenido a Dulce Vicio
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Ingresá a tu cuenta para continuar con tus pedidos
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start space-x-3 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Error de autenticación</p>
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
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 text-stone-800"
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
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 text-stone-800"
              />
            </div>
          </div>

          {/* Botón de Ingreso */}
          <button
            type="submit"
            disabled={cargando}
            className="w-full py-3.5 px-4 rounded-2xl font-semibold text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
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
        <div className="pt-2 border-t border-stone-100 space-y-2">
          <p className="text-[11px] font-semibold text-stone-400 text-center uppercase tracking-wider">
            Credenciales de prueba rápida
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => cargarCredenciales('admin')}
              className="px-2.5 py-1.5 text-xs bg-amber-50 text-amber-900 border border-amber-200 rounded-xl hover:bg-amber-100 flex items-center justify-center space-x-1 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Admin Demo</span>
            </button>
            <button
              type="button"
              onClick={() => cargarCredenciales('cliente')}
              className="px-2.5 py-1.5 text-xs bg-stone-50 text-stone-800 border border-stone-200 rounded-xl hover:bg-stone-100 flex items-center justify-center space-x-1 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-stone-600" />
              <span>Cliente Demo</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-2 text-xs text-stone-500">
          ¿Aún no tenés cuenta?{' '}
          <Link to="/registro" className="font-semibold text-orange-600 hover:text-orange-700 hover:underline">
            Registrate ahora
          </Link>
        </div>

      </div>
    </div>
  );
}
