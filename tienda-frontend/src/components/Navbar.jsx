import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import {
  Phone,
  Instagram,
  Facebook,
  MessageCircle,
  Search,
  ShoppingBag,
  Package,
  ShieldCheck,
  RotateCcw,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  User,
  Cake,
  ChevronDown,
} from 'lucide-react';

export default function Navbar() {
  const { usuario, cerrarSesion, esAdmin } = useAuth();
  const { cantidadTotal, total, abrirDrawer } = useCarrito();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [busquedaLocal, setBusquedaLocal] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleCerrarSesion = () => {
    cerrarSesion();
    navigate('/');
    setMenuAbierto(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    }
    const el = document.getElementById('seccion-catalogo');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const esLinkActivo = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full shadow-md">
      {/* 1. TOP BAR (Fondo Borravino #3B111E) */}
      <div className="bg-[#3B111E] text-[#FAF8F5] text-xs py-2 px-4 sm:px-6 border-b border-rose-900/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          
          {/* Teléfono & Redes Sociales */}
          <div className="flex items-center space-x-6 text-[#FAF8F5]/90">
            <a
              href="tel:+541145678900"
              className="flex items-center space-x-2 hover:text-[#E85D88] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#E85D88]" />
              <span className="font-medium">+54 11 4567-8900</span>
            </a>
            <span className="hidden sm:inline text-rose-900/60">|</span>
            <div className="hidden sm:flex items-center space-x-3 text-rose-200/80">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Dulce Vicio"
                className="hover:text-[#E85D88] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Dulce Vicio"
                className="hover:text-[#E85D88] transition-colors"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://wa.me/541145678900"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Dulce Vicio"
                className="hover:text-[#E85D88] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Buscador + Auth + Resumen Carrito */}
          <div className="flex items-center space-x-4 w-full md:w-auto justify-between md:justify-end">
            
            {/* Buscador de la Top Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 md:flex-initial max-w-[200px] sm:max-w-[240px]">
              <input
                type="text"
                placeholder="Buscar postre..."
                value={busquedaLocal}
                onChange={(e) => setBusquedaLocal(e.target.value)}
                className="w-full bg-[#4A1525] border border-rose-800/60 rounded-full text-xs text-white placeholder-rose-200/50 pl-8 pr-3 py-1 focus:outline-none focus:ring-1 focus:ring-[#E85D88]"
              />
              <Search className="w-3.5 h-3.5 text-rose-300 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </form>

            {/* Login / Registro o Nombre de Usuario */}
            <div className="flex items-center space-x-3 shrink-0">
              {usuario ? (
                <div className="flex items-center space-x-2 bg-[#4A1525] border border-rose-800/50 py-1 px-3 rounded-full">
                  <Link
                    to="/mis-datos"
                    className="flex items-center space-x-1.5 text-xs text-rose-100 hover:text-[#E85D88] transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#E85D88] text-white flex items-center justify-center text-[10px] font-bold">
                      {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="font-medium max-w-[90px] truncate">
                      {usuario.nombre ? usuario.nombre.split(' ')[0] : 'Usuario'}
                    </span>
                  </Link>
                  <button
                    onClick={handleCerrarSesion}
                    className="text-rose-300 hover:text-white ml-1"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="text-xs font-semibold text-rose-100 hover:text-[#E85D88] transition-colors flex items-center space-x-1"
                  >
                    <LogIn className="w-3.5 h-3.5 text-[#E85D88]" />
                    <span>Entrar</span>
                  </Link>
                  <span className="text-rose-800">/</span>
                  <Link
                    to="/registro"
                    className="text-xs font-semibold text-rose-100 hover:text-[#E85D88] transition-colors flex items-center space-x-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Registrarse</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Resumen del Carrito en vivo */}
            <button
              onClick={abrirDrawer}
              className="flex items-center space-x-2 bg-[#E85D88] hover:bg-[#D81B60] text-white px-3 py-1 rounded-full font-bold text-xs shadow-sm transition-all transform active:scale-95 shrink-0"
              title="Abrir resumen del carrito"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{cantidadTotal}</span>
              <span className="hidden sm:inline">| ${total.toLocaleString('es-AR')}</span>
            </button>

          </div>

        </div>
      </div>

      {/* 2. MENÚ PRINCIPAL (Fondo Blanco #FFFFFF) */}
      <nav className="bg-white border-b border-rose-100/80 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Circular Rosa "Dulce Vicio" */}
          <Link to="/" className="flex items-center space-x-3.5 group">
            <div className="w-12 h-12 rounded-full bg-[#E85D88] group-hover:bg-[#D81B60] flex items-center justify-center text-white shadow-md shadow-rose-500/30 transition-transform duration-300 group-hover:scale-105">
              <Cake className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-serif font-bold text-2xl sm:text-3xl text-[#3B111E] tracking-tight block leading-none">
                Dulce Vicio
              </span>
              <span className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#E85D88] font-bold block mt-1">
                Pastelería Boutique
              </span>
            </div>
          </Link>

          {/* Navegación Horizontal Limpia en Mayúsculas (Escritorio) */}
          <div className="hidden lg:flex items-center space-x-8 font-sans font-semibold text-xs tracking-wider text-[#3B111E]">
            <Link
              to="/"
              className={`hover:text-[#E85D88] transition-colors py-1 border-b-2 ${
                esLinkActivo('/') ? 'border-[#E85D88] text-[#E85D88]' : 'border-transparent'
              }`}
            >
              HOME
            </Link>

            <a
              href="#nosotros"
              onClick={(e) => {
                if (location.pathname !== '/') {
                  e.preventDefault();
                  navigate('/');
                  setTimeout(() => {
                    document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="hover:text-[#E85D88] transition-colors py-1 border-b-2 border-transparent"
            >
              QUIÉNES SOMOS
            </a>

            <a
              href="#catalogo"
              onClick={(e) => {
                if (location.pathname !== '/') {
                  e.preventDefault();
                  navigate('/');
                  setTimeout(() => {
                    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="hover:text-[#E85D88] transition-colors py-1 border-b-2 border-transparent"
            >
              TIENDA
            </a>

            {usuario && (
              <Link
                to="/mis-pedidos"
                className={`hover:text-[#E85D88] transition-colors py-1 border-b-2 ${
                  esLinkActivo('/mis-pedidos') ? 'border-[#E85D88] text-[#E85D88]' : 'border-transparent'
                }`}
              >
                MIS PEDIDOS
              </Link>
            )}

            {usuario && (
              <Link
                to="/mis-datos"
                className={`hover:text-[#E85D88] transition-colors py-1 border-b-2 ${
                  esLinkActivo('/mis-datos') ? 'border-[#E85D88] text-[#E85D88]' : 'border-transparent'
                }`}
              >
                MIS DATOS
              </Link>
            )}

            <Link
              to="/arrepentimiento"
              className={`hover:text-[#E85D88] transition-colors py-1 border-b-2 ${
                esLinkActivo('/arrepentimiento') ? 'border-[#E85D88] text-[#E85D88]' : 'border-transparent'
              }`}
            >
              ARREPENTIMIENTO
            </Link>

            {esAdmin && (
              <Link
                to="/admin"
                className="bg-[#3B111E] text-white px-3 py-1.5 rounded-full font-bold text-[11px] hover:bg-[#5C1B2E] transition-colors"
              >
                ADMIN
              </Link>
            )}

            <a
              href="#contacto"
              onClick={(e) => {
                if (location.pathname !== '/') {
                  e.preventDefault();
                  navigate('/');
                  setTimeout(() => {
                    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className="hover:text-[#E85D88] transition-colors py-1 border-b-2 border-transparent"
            >
              CONTACTO
            </a>
          </div>

          {/* Hamburguesa Móvil */}
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="lg:hidden p-2 rounded-xl text-[#3B111E] hover:text-[#E85D88] hover:bg-rose-50 transition-colors"
            aria-label="Abrir menú de navegación"
          >
            {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </nav>

      {/* Menú Desplegable Móvil */}
      <AnimatePresence>
        {menuAbierto && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-white border-b border-rose-200 px-6 py-4 space-y-3 font-sans text-sm font-semibold text-[#3B111E]"
          >
            <Link
              to="/"
              onClick={() => setMenuAbierto(false)}
              className="block py-2 hover:text-[#E85D88]"
            >
              HOME
            </Link>

            <a
              href="#nosotros"
              onClick={() => setMenuAbierto(false)}
              className="block py-2 hover:text-[#E85D88]"
            >
              QUIÉNES SOMOS
            </a>

            <a
              href="#catalogo"
              onClick={() => setMenuAbierto(false)}
              className="block py-2 hover:text-[#E85D88]"
            >
              TIENDA
            </a>

            {usuario && (
              <Link
                to="/mis-pedidos"
                onClick={() => setMenuAbierto(false)}
                className="block py-2 hover:text-[#E85D88]"
              >
                MIS PEDIDOS
              </Link>
            )}

            {usuario && (
              <Link
                to="/mis-datos"
                onClick={() => setMenuAbierto(false)}
                className="block py-2 hover:text-[#E85D88]"
              >
                MIS DATOS
              </Link>
            )}

            <Link
              to="/arrepentimiento"
              onClick={() => setMenuAbierto(false)}
              className="block py-2 text-[#E85D88]"
            >
              BOTÓN DE ARREPENTIMIENTO
            </Link>

            {esAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuAbierto(false)}
                className="block py-2 text-[#3B111E] font-bold"
              >
                PANEL ADMIN
              </Link>
            )}

            <a
              href="#contacto"
              onClick={() => setMenuAbierto(false)}
              className="block py-2 hover:text-[#E85D88]"
            >
              CONTACTO
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
