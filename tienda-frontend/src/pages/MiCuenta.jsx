import React from 'react';
import { Link } from 'react-router-dom';
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
  ExternalLink,
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
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
      
      {/* Cabecera del Perfil */}
      <div className="bg-gradient-to-r from-[#382216] to-[#2c1810] rounded-3xl p-6 sm:p-8 text-amber-50 shadow-warm border border-amber-900/40 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400/40 text-amber-300 font-display font-bold text-3xl flex items-center justify-center shrink-0 shadow-lg">
          {usuario.nombre ? usuario.nombre.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
              {usuario.nombre}
            </h1>
            <span className="inline-block mt-1 sm:mt-0 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Rol: {usuario.rol}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-amber-200/80 flex items-center justify-center sm:justify-start space-x-1.5">
            <Mail className="w-4 h-4 text-amber-400" />
            <span>{usuario.email}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full sm:w-auto">
          {esAdmin && (
            <Link
              to="/admin"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 text-xs font-bold rounded-xl shadow-sm text-center flex items-center justify-center space-x-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Ir a Panel Admin</span>
            </Link>
          )}
          <button
            onClick={cerrarSesion}
            className="px-4 py-2 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 text-rose-200 text-xs font-semibold rounded-xl text-center flex items-center justify-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Sección Legal: Datos Personales y Ley 25.326 */}
      <div className="bg-white rounded-3xl border border-amber-100 shadow-sm p-6 sm:p-8 space-y-6">
        
        <div className="flex items-center space-x-3 border-b border-stone-100 pb-4">
          <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-stone-900">
              Privacidad y Protección de Datos Personales (Ley N° 25.326)
            </h2>
            <p className="text-xs text-stone-500">
              Registro legal de consentimiento y garantía de derechos de los titulares de datos.
            </p>
          </div>
        </div>

        {/* Registro de Consentimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-stone-600 text-xs font-medium">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>Estado del Consentimiento:</span>
            </div>
            <p className="text-sm font-bold text-emerald-700">
              {usuario.acepto_tratamiento ? 'Aceptado libre y expresamente' : 'Pendiente'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <div className="flex items-center space-x-2 text-stone-600 text-xs font-medium">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>Fecha y Hora de Consentimiento:</span>
            </div>
            <p className="text-xs font-semibold text-stone-800">
              {fechaFormateada}
            </p>
          </div>
        </div>

        {/* Información de Derechos ARCO */}
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-3 text-xs text-stone-700 leading-relaxed">
          <h3 className="font-bold text-amber-950 text-sm flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span>Tus derechos como consumidor y titular de datos:</span>
          </h3>
          <ul className="space-y-2 list-disc list-inside text-stone-600">
            <li>
              <strong className="text-stone-800">Derecho de Acceso (Art. 14):</strong> Podés solicitar información sobre tus datos personales almacenados en Dulce Vicio de forma gratuita en intervalos no inferiores a seis meses.
            </li>
            <li>
              <strong className="text-stone-800">Derecho de Rectificación y Supresión (Art. 16):</strong> Podés solicitar la corrección, actualización o supresión definitiva de tus datos en cualquier momento.
            </li>
            <li>
              <strong className="text-stone-800">Órgano de Control:</strong> La Agencia de Acceso a la Información Pública (AAIP), en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender denuncias y reclamos.
            </li>
          </ul>

          <div className="pt-2">
            <a
              href="https://www.argentina.gob.ar/aaip/datospersonales"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs text-orange-700 font-semibold hover:underline"
            >
              <span>Conocer más en el portal oficial de la AAIP</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>

    </div>
  );
}
