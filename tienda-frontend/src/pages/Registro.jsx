import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { registrar } from '../services/api';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Scale,
} from 'lucide-react';

export default function Registro() {
  const navigate = useNavigate();

  // Estado del formulario: checkbox arranca desmarcado (false) por ley
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    acepto_tratamiento: false,
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.acepto_tratamiento) {
      setError('Es requisito legal obligatorio aceptar el tratamiento de datos personales conforme a la Ley 25.326.');
      return;
    }

    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setCargando(true);
    try {
      await registrar({
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        acepto_tratamiento: form.acepto_tratamiento,
      });

      setExito(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(err.message || 'Ocurrió un error al registrar la cuenta.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto py-8 px-4"
    >
      <div className="bg-white rounded-3xl border border-rose-100 shadow-warm p-6 sm:p-10 space-y-6">
        
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center mx-auto">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-stone-900">
            Creá tu cuenta en Dulce Vicio
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Registrate para gestionar tus pedidos y disfrutar de nuestras especialidades
          </p>
        </div>

        {/* Mensaje de Éxito */}
        {exito && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center space-x-3 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold">¡Cuenta creada con éxito!</p>
              <p className="text-xs text-emerald-700">Redirigiendo a la pantalla de inicio de sesión...</p>
            </div>
          </div>
        )}

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-start space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">No pudimos completar el registro</p>
              <p className="text-xs text-rose-700">{error}</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5" htmlFor="nombre">
              Nombre y Apellido
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="nombre"
                name="nombre"
                type="text"
                required
                placeholder="Ej: Lucía Gómez"
                value={form.nombre}
                onChange={cambiar}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-400 text-stone-800"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5" htmlFor="email">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="nombre@ejemplo.com"
                value={form.email}
                onChange={cambiar}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-400 text-stone-800"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5" htmlFor="password">
              Contraseña segura (mínimo 6 caracteres)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={cambiar}
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-400 text-stone-800"
              />
            </div>
          </div>

          {/* Checkbox Obligatorio de Protección de Datos Personales (Ley 25.326) */}
          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-3">
              <div className="flex items-start space-x-3">
                <input
                  id="acepto_tratamiento"
                  name="acepto_tratamiento"
                  type="checkbox"
                  checked={form.acepto_tratamiento}
                  onChange={cambiar}
                  className="mt-1 w-4 h-4 text-rose-600 rounded border-stone-300 focus:ring-rose-500 cursor-pointer"
                />
                <label
                  htmlFor="acepto_tratamiento"
                  className="text-xs text-stone-700 leading-relaxed cursor-pointer select-none"
                >
                  <strong className="text-rose-950 block font-semibold mb-0.5">
                    Consentimiento Legal de Datos Personales (Ley N° 25.326):
                  </strong>
                  Acepto expresamente que mis datos sean tratados por Dulce Vicio con fines de gestión comercial y entrega de pedidos. Declaro conocer mis derechos de acceso, actualización y supresión conforme a la ley.
                </label>
              </div>

              <div className="flex items-center space-x-1.5 text-[11px] text-rose-900/80 pl-7">
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Tu consentimiento quedará registrado con fecha y hora segura.</span>
              </div>
            </div>
          </div>

          {/* Botón de Envío */}
          <button
            type="submit"
            disabled={!form.acepto_tratamiento || cargando}
            className={`w-full py-3.5 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-md ${
              !form.acepto_tratamiento || cargando
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                : 'bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white shadow-rose-500/25 hover:shadow-lg'
            }`}
          >
            {cargando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registrando usuario...</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Crear Cuenta</span>
              </>
            )}
          </button>
        </form>

        {/* Footer del Formulario */}
        <div className="text-center pt-2 border-t border-stone-100 text-xs text-stone-500">
          ¿Ya tenés una cuenta?{' '}
          <Link to="/login" className="font-semibold text-rose-600 hover:text-rose-700 hover:underline">
            Iniciá sesión aquí
          </Link>
        </div>

      </div>
    </motion.div>
  );
}
