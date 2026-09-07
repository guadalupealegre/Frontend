import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Cake,
  User,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  RotateCcw,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { usuario, cerrarSesion, esAdmin } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/');
    setMenuAbierto(false);
  };

  const linkActivo = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#2c1810]/95 backdrop-blur-md border-b border-amber-900/30 text-amber-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Marca Dulce Vicio */}
          <Link
            to="/"
            className="flex items-center space-x-3 group transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:rotate-6 transition-transform">
              <Cake className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100">
                Dulce Vicio
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-amber-300/80 font-medium">
                Repostería Artesanal
              </span>
            </div>
          </Link>

          {/* Enlaces de Navegación de Escritorio */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                linkActivo('/')
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-500/30'
                  : 'text-amber-100/80 hover:text-amber-100 hover:bg-amber-900/40'
              }`}
            >
              Catálogo
            </Link>

            {/* Enlace destacado de Botón de Arrepentimiento (Res. 424/2020) */}
            <Link
              to="/arrepentimiento"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                linkActivo('/arrepentimiento')
                  ? 'bg-rose-500/20 border-rose-400/50 text-rose-200 shadow-sm'
                  : 'border-rose-500/40 text-rose-300 bg-rose-950/40 hover:bg-rose-900/50'
              }`}
              title="Resolución 424/2020 - Revocación de compra"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>Botón de Arrepentimiento</span>
            </Link>

            {esAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center space-x-1.5 transition-all ${
                  linkActivo('/admin')
                    ? 'bg-amber-500 text-stone-900 shadow-md shadow-amber-500/30'
                    : 'bg-amber-900/60 text-amber-200 hover:bg-amber-800/80 border border-amber-600/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Panel Admin</span>
              </Link>
            )}
          </nav>

          {/* Sección de Usuario / Autenticación */}
          <div className="hidden md:flex items-center space-x-3">
            {usuario ? (
              <div className="flex items-center space-x-3 bg-amber-950/60 border border-amber-800/40 py-1.5 px-3.5 rounded-2xl">
                <Link
                  to="/mi-cuenta"
                  className="flex items-center space-x-2 text-sm text-amber-100 hover:text-amber-300 transition-colors"
                  title="Ver perfil y derechos de datos (Ley 25.326)"
                >
                  <div className="w-7 h-7 rounded-full bg-amber-600/40 flex items-center justify-center text-amber-200 font-bold text-xs">
                    {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold text-xs text-amber-100 leading-tight">
                      Hola, {usuario.nombre.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-amber-400/90 capitalize">
                      {usuario.rol}
                    </span>
                  </div>
                </Link>

                <div className="w-[1px] h-6 bg-amber-800/60"></div>

                <button
                  onClick={handleCerrarSesion}
                  className="p-1.5 rounded-lg text-amber-300/70 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-amber-100 hover:text-white hover:bg-amber-900/50 transition-colors flex items-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4 text-amber-400" />
                  <span>Entrar</span>
                </Link>
                <Link
                  to="/registro"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 transition-all flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registrarse</span>
                </Link>
              </div>
            )}
          </div>

          {/* Botón de Menú Móvil */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="p-2 rounded-xl text-amber-200 hover:text-white hover:bg-amber-900/50 focus:outline-none"
              aria-label="Abrir menú"
            >
              {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {menuAbierto && (
        <div className="md:hidden bg-[#24140d] border-b border-amber-900/40 px-4 pt-3 pb-5 space-y-3 animate-fade-in">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMenuAbierto(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-amber-100 hover:bg-amber-900/50"
            >
              Catálogo de Postres
            </Link>

            <Link
              to="/arrepentimiento"
              onClick={() => setMenuAbierto(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold text-rose-300 bg-rose-950/40 border border-rose-500/30"
            >
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Botón de Arrepentimiento (Res. 424/2020)</span>
            </Link>

            {esAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuAbierto(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-amber-300 bg-amber-950/60"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Panel Administrador</span>
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-amber-900/40">
            {usuario ? (
              <div className="space-y-2">
                <Link
                  to="/mi-cuenta"
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm text-amber-100 bg-amber-900/40"
                >
                  <User className="w-4 h-4 text-amber-400" />
                  <span>Mi Cuenta ({usuario.nombre})</span>
                </Link>
                <button
                  onClick={handleCerrarSesion}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-rose-300 bg-rose-950/30 border border-rose-900/40"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-950/60 text-amber-200 border border-amber-800/40 text-center"
                >
                  Entrar
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center shadow-md shadow-orange-500/20"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
