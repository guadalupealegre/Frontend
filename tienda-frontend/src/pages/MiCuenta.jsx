import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  Lock,
  FileCheck,
  LogOut,
  Sparkles,
  Package,
  RotateCcw,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

export default function MiCuenta() {
  const { usuario, cerrarSesion, esAdmin } = useAuth();

  if (!usuario) return null;

  const fechaFormateada = usuario.fecha_consentimiento
    ? new Date(usuario.fecha_consentimiento).toLocaleString('es-AR', {
        dateStyle: 'long',
        timeStyle: 'medium',
      })
    : 'Registrado al momento de la creación';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto py-6 px-2 sm:px-4 space-y-8"
    >
      {/* Cabecera del Perfil */}
      <div className="bg-gradient-to-r from-[#28130a] via-[#3a1d12] to-[#200f07] rounded-3xl p-6 sm:p-8 text-amber-50 shadow-warm border border-amber-900/40 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/20 border-2 border-rose-400/40 text-rose-300 font-display font-bold text-3xl flex items-center justify-center shrink-0 shadow-lg">
          {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              {usuario.nombre}
            </h1>
            <span className="inline-block mt-1 sm:mt-0 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Rol: {usuario.rol}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-amber-200/80 flex items-center justify-center sm:justify-start space-x-1.5">
            <Mail className="w-4 h-4 text-rose-400" />
            <span>{usuario.email}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          {esAdmin && (
            <Link
              to="/admin"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-900 text-xs font-bold rounded-xl shadow-sm text-center flex items-center justify-center space-x-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Panel Admin</span>
            </Link>
          )}
          <button
            onClick={cerrarSesion}
            className="px-4 py-2.5 bg-rose-950/60 hover:bg-rose-900/70 border border-rose-500/40 text-rose-200 text-xs font-semibold rounded-xl text-center flex items-center justify-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Accesos Rápidos a Funcionalidades Legales y Compras */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Acceso a Mis Datos & Portabilidad */}
        <Link
          to="/mis-datos"
          className="group bg-white rounded-3xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-stone-900 group-hover:text-rose-600 transition-colors">
                Mis Datos & Portabilidad (Ley 25.326)
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Descargá el archivo JSON con tu historial de datos, revisá el consentimiento y gestioná tus derechos de supresión.
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-rose-600 space-x-1 self-end">
            <span>Gestionar mis datos</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Acceso a Mis Pedidos */}
        <Link
          to="/mis-pedidos"
          className="group bg-white rounded-3xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-stone-900 group-hover:text-rose-600 transition-colors">
                Historial de Mis Pedidos
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Revisá tus pedidos realizados, precios congelados y ejercé el derecho de arrepentimiento de compras activas.
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs font-bold text-rose-600 space-x-1 self-end">
            <span>Ver mis compras</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>

      {/* Sección Legal Informativa */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-stone-100">
          <div className="p-2.5 bg-rose-500/10 text-rose-700 rounded-2xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-display font-bold text-base text-stone-900">
            Registro de Consentimiento Legal
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <span className="text-stone-500 block">Estado del Consentimiento:</span>
            <span className="font-bold text-emerald-700">Aceptado libre y expresamente</span>
          </div>
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <span className="text-stone-500 block">Fecha y Hora de Registro:</span>
            <span className="font-semibold text-stone-800">{fechaConsentimientoFormateada}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
