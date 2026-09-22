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
      <div className="bg-white rounded-3xl border border-rose-200/80 shadow-warm p-8 space-y-6">
        
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-[#FFF1F5] border border-rose-200 text-[#E85D88] flex items-center justify-center mx-auto">
            <UserPlus className="w-7 h-7" />
          </div>
          <h1 className="font-serif font-bold text-3xl text-[#3B111E]">
            Creá tu cuenta en Dulce Vicio
          </h1>
          <p className="text-xs text-stone-500">
            Registrate para gestionar tus pedidos y disfrutar de nuestras especialidades
          </p>
        </div>

        {/* Mensaje de Éxito */}
        {exito && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center space-x-3 text-xs font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">¡Cuenta creada con éxito!</p>
              <p className="text-emerald-700">Redirigiendo a la pantalla de inicio de sesión...</p>
            </div>
          </div>
        )}

        {/* Mensaje de Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl flex items-start space-x-3 text-xs font-medium">
            <AlertCircle className="w-5 h-5 text-[#E85D88] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-rose-950">No pudimos completar el registro</p>
              <p className="text-rose-700">{error}</p>
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
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#E85D88] text-[#3B111E]"
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
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#E85D88] text-[#3B111E]"
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
                className="w-full pl-10 pr-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#E85D88] text-[#3B111E]"
              />
            </div>
          </div>

          {/* Checkbox Obligatorio de Protección de Datos Personales (Ley 25.326) */}
          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-[#FFF1F5] border border-rose-200 space-y-3">
              <div className="flex items-start space-x-3">
                <input
                  id="acepto_tratamiento"
                  name="acepto_tratamiento"
                  type="checkbox"
                  checked={form.acepto_tratamiento}
                  onChange={cambiar}
                  className="mt-1 w-4 h-4 text-[#E85D88] rounded border-stone-300 focus:ring-[#E85D88] cursor-pointer"
                />
                <label
                  htmlFor="acepto_tratamiento"
                  className="text-xs text-stone-700 leading-relaxed cursor-pointer select-none"
                >
                  <strong className="text-[#3B111E] block font-bold mb-0.5">
                    Consentimiento Legal de Datos Personales (Ley N° 25.326):
                  </strong>
                  Acepto expresamente que mis datos sean tratados por Dulce Vicio con fines de gestión comercial y entrega de pedidos. Declaro conocer mis derechos de acceso, actualización y supresión conforme a la ley.
                </label>
              </div>

              <div className="flex items-center space-x-1.5 text-[11px] text-stone-600 pl-7">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E85D88] shrink-0" />
                <span>Tu consentimiento quedará registrado con fecha y hora segura.</span>
              </div>
            </div>
          </div>

          {/* Botón de Envío */}
          <button
            type="submit"
            disabled={!form.acepto_tratamiento || cargando}
            className={`w-full py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all duration-200 shadow-md ${
              !form.acepto_tratamiento || cargando
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                : 'bg-[#3B111E] hover:bg-[#E85D88] text-white'
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
          <Link to="/login" className="font-bold text-[#E85D88] hover:underline">
            Iniciá sesión aquí
          </Link>
        </div>

      </div>
    </motion.div>
  );
}
