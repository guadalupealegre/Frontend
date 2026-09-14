import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import {
  Cake,
  ShoppingBag,
  Package,
  User,
  ShieldCheck,
  LogOut,
  LogIn,
  UserPlus,
  RotateCcw,
  Menu,
  X,
  Sparkles,
  FileText,
} from 'lucide-react';

export default function Navbar() {
  const { usuario, cerrarSesion, esAdmin } = useAuth();
  const { cantidadTotal, abrirDrawer } = useCarrito();
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
    <header className="sticky top-0 z-40 bg-[#24120b]/95 backdrop-blur-md border-b border-rose-950/60 text-amber-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Marca Dulce Vicio */}
          <Link
            to="/"
            className="flex items-center space-x-3 group transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/30 group-hover:rotate-6 transition-transform">
              <Cake className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-amber-200 to-rose-100">
                Dulce Vicio
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-rose-300/80 font-medium">
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
                  ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
                  : 'text-amber-100/80 hover:text-white hover:bg-stone-800/40'
              }`}
            >
              Catálogo
            </Link>

            {/* Enlace a Mis Pedidos (si está autenticado) */}
            {usuario && (
              <Link
                to="/mis-pedidos"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center space-x-1.5 transition-all ${
                  linkActivo('/mis-pedidos')
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
                    : 'text-amber-100/80 hover:text-white hover:bg-stone-800/40'
                }`}
              >
                <Package className="w-4 h-4 text-rose-400" />
                <span>Mis Pedidos</span>
              </Link>
            )}

            {/* Enlace a Mis Datos & Portabilidad (si está autenticado) */}
            {usuario && (
              <Link
                to="/mis-datos"
                className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center space-x-1.5 transition-all ${
                  linkActivo('/mis-datos')
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-500/30'
                    : 'text-amber-100/80 hover:text-white hover:bg-stone-800/40'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Mis Datos</span>
              </Link>
            )}

            {/* Enlace destacado de Botón de Arrepentimiento (Res. 424/2020) */}
            <Link
              to="/arrepentimiento"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                linkActivo('/arrepentimiento')
                  ? 'bg-rose-600/30 border-rose-400 text-rose-100 shadow-sm'
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
                    : 'bg-amber-950/70 text-amber-200 hover:bg-amber-900/80 border border-amber-700/50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Panel Admin</span>
              </Link>
            )}
          </nav>

          {/* Sección Derecha: Carrito + Usuario */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Botón Carrito con Badge Contador Animado */}
            <button
              onClick={abrirDrawer}
              className="relative p-2.5 rounded-2xl bg-stone-900/80 border border-stone-800 text-amber-200 hover:text-white hover:bg-stone-800 transition-all duration-200 shadow-sm flex items-center space-x-2 group active:scale-95"
              aria-label="Abrir carrito de compras"
              title="Ver mi carrito"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform text-rose-400" />
              
              {cantidadTotal > 0 && (
                <span
                  key={cantidadTotal}
                  className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold text-[11px] min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center border-2 border-[#24120b] shadow-md animate-pop-badge"
                >
                  {cantidadTotal}
                </span>
              )}
            </button>

            {/* Perfil o Acceso */}
            {usuario ? (
              <div className="flex items-center space-x-3 bg-stone-900/80 border border-stone-800 py-1.5 px-3.5 rounded-2xl">
                <Link
                  to="/mis-datos"
                  className="flex items-center space-x-2 text-sm text-amber-100 hover:text-rose-200 transition-colors"
                  title="Ver datos personales (Ley 25.326)"
                >
                  <div className="w-7 h-7 rounded-full bg-rose-600/40 flex items-center justify-center text-rose-200 font-bold text-xs">
                    {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <span className="block font-semibold text-xs text-amber-100 leading-tight">
                      {usuario.nombre.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-rose-400 capitalize">
                      {usuario.rol}
                    </span>
                  </div>
                </Link>

                <div className="w-[1px] h-6 bg-stone-700"></div>

                <button
                  onClick={handleCerrarSesion}
                  className="p-1.5 rounded-lg text-rose-300/70 hover:text-rose-200 hover:bg-rose-950/50 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-amber-100 hover:text-white hover:bg-stone-800 transition-colors flex items-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4 text-rose-400" />
                  <span>Entrar</span>
                </Link>
                <Link
                  to="/registro"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white shadow-md shadow-rose-600/20 transition-all flex items-center space-x-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registrarse</span>
                </Link>
              </div>
            )}
          </div>

          {/* Botones Móvil: Carrito + Menú Hamburguesa */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={abrirDrawer}
              className="relative p-2 rounded-xl bg-stone-900 border border-stone-800 text-amber-200"
              aria-label="Abrir carrito"
            >
              <ShoppingBag className="w-5 h-5 text-rose-400" />
              {cantidadTotal > 0 && (
                <span
                  key={cantidadTotal}
                  className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[10px] min-w-[18px] h-[18px] px-0.5 rounded-full flex items-center justify-center border-2 border-[#24120b] animate-pop-badge"
                >
                  {cantidadTotal}
                </span>
              )}
            </button>

            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="p-2 rounded-xl text-amber-200 hover:text-white hover:bg-stone-800 focus:outline-none"
              aria-label="Abrir menú"
            >
              {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {menuAbierto && (
        <div className="md:hidden bg-[#1c0c06] border-b border-rose-950 px-4 pt-3 pb-5 space-y-3 animate-fade-in">
          <div className="space-y-1">
            <Link
              to="/"
              onClick={() => setMenuAbierto(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-amber-100 hover:bg-stone-800"
            >
              Catálogo de Postres
            </Link>

            <Link
              to="/carrito"
              onClick={() => setMenuAbierto(false)}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-base font-medium text-amber-100 hover:bg-stone-800"
            >
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-rose-400" />
                <span>Mi Carrito</span>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300">
                {cantidadTotal} ítems
              </span>
            </Link>

            {usuario && (
              <Link
                to="/mis-pedidos"
                onClick={() => setMenuAbierto(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-amber-100 hover:bg-stone-800"
              >
                <Package className="w-4 h-4 text-rose-400" />
                <span>Mis Pedidos Confirmados</span>
              </Link>
            )}

            {usuario && (
              <Link
                to="/mis-datos"
                onClick={() => setMenuAbierto(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium text-amber-100 hover:bg-stone-800"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Mis Datos & Portabilidad</span>
              </Link>
            )}

            <Link
              to="/arrepentimiento"
              onClick={() => setMenuAbierto(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold text-rose-300 bg-rose-950/60 border border-rose-500/40"
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

          <div className="pt-3 border-t border-stone-800">
            {usuario ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-xs text-amber-200/80">
                  Conectado como <strong>{usuario.nombre}</strong> ({usuario.email})
                </div>
                <button
                  onClick={handleCerrarSesion}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-200 bg-rose-950/40 border border-rose-900/60"
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
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium bg-stone-900 text-amber-200 border border-stone-800 text-center"
                >
                  Entrar
                </Link>
                <Link
                  to="/registro"
                  onClick={() => setMenuAbierto(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-amber-600 text-white text-center shadow-md shadow-rose-600/20"
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
