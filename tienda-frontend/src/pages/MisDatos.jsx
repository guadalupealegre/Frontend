import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { getMisDatos, exportarMisDatos, eliminarMiCuenta } from '../services/api';
import {
  ShieldCheck,
  Download,
  Trash2,
  AlertTriangle,
  FileCheck,
  Calendar,
  Mail,
  User,
  Package,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Receipt,
  FileText,
} from 'lucide-react';

export default function MisDatos() {
  const { token, usuario, cerrarSesion } = useAuth();
  const { vaciar, agregarToast } = useCarrito();
  const navigate = useNavigate();

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados de exportación
  const [exportando, setExportando] = useState(false);

  // Estados de zona de peligro (Baja y anonimización)
  const [modalBajaAbierto, setModalBajaAbierto] = useState(false);
  const [palabraConfirmacion, setPalabraConfirmacion] = useState('');
  const [procesandoBaja, setProcesandoBaja] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getMisDatos(token);
      setDatos(data);
    } catch (err) {
      console.error('Error al cargar datos del usuario:', err);
      setError(err.message || 'No se pudieron recuperar tus datos personales.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarDatos();
    }
  }, [token]);

  const handleDescargarJSON = async () => {
    if (exportando) return;
    setExportando(true);
    try {
      await exportarMisDatos(token);
      agregarToast('¡Archivo mis_datos.json descargado correctamente! 📄', 'success');
    } catch (err) {
      console.error('Error al exportar datos:', err);
      agregarToast(err.message || 'Error al descargar el archivo de datos.', 'error');
    } finally {
      setExportando(false);
    }
  };

  const handleConfirmarBaja = async () => {
    if (palabraConfirmacion.trim() !== 'ELIMINAR' || procesandoBaja) return;

    setProcesandoBaja(true);
    try {
      await eliminarMiCuenta(token);
      vaciar();
      cerrarSesion();
      agregarToast(
        'Tu cuenta fue dada de baja y tus datos personales han sido anonimizados.',
        'info'
      );
      navigate('/');
    } catch (err) {
      console.error('Error al dar de baja la cuenta:', err);
      agregarToast(err.message || 'No se pudo procesar la baja de la cuenta.', 'error');
      setProcesandoBaja(false);
    }
  };

  if (cargando) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-9 h-9 text-rose-500 animate-spin" />
        <div className="text-center space-y-1">
          <h2 className="font-display font-bold text-lg text-stone-900">
            Cargando tu información legal...
          </h2>
          <p className="text-xs text-stone-500">
            Consultando registros bajo la Ley N° 25.326 de Protección de Datos Personales
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="font-display font-bold text-lg text-rose-950">
          No pudimos consultar tus datos
        </h2>
        <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
        <button
          onClick={cargarDatos}
          className="px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const perfil = datos?.usuario || usuario;
  const pedidos = datos?.pedidos || [];
  const revocaciones = datos?.solicitudes_revocacion || [];

  const fechaConsentimientoFormateada = perfil?.fecha_consentimiento
    ? new Date(perfil.fecha_consentimiento).toLocaleString('es-AR', {
        dateStyle: 'long',
        timeStyle: 'medium',
      })
    : 'Registrado al momento de la creación';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-5xl mx-auto space-y-8 py-4 px-2 sm:px-4"
    >
      {/* Cabecera Principal */}
      <div className="bg-gradient-to-r from-[#28130a] via-[#3a1d12] to-[#200f07] text-amber-50 p-6 sm:p-8 rounded-3xl shadow-warm border border-amber-900/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 bg-rose-500/20 px-3 py-1 rounded-full text-xs font-semibold text-rose-300 border border-rose-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Ley N° 25.326 & Portabilidad de Datos</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
            Mis Datos Personales y Consentimiento
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/80 leading-relaxed">
            En Dulce Vicio garantizamos el control total de tu información personal. Podés consultar tus registros, descargar una copia en formato JSON o ejercer tu derecho de supresión.
          </p>
        </div>

        {/* Botón de Portabilidad / Exportar JSON */}
        <button
          onClick={handleDescargarJSON}
          disabled={exportando}
          className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95 shrink-0 self-stretch md:self-auto disabled:opacity-60"
        >
          {exportando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generando archivo...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Descargar mis datos (.json)</span>
            </>
          )}
        </button>
      </div>

      {/* Grid de Perfil & Consentimiento Legal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta 1: Perfil */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-rose-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-stone-900">
                Información del Titular
              </h2>
              <span className="text-[11px] text-stone-400">Identificación en el sistema</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-stone-50">
              <span className="text-stone-500">Nombre Completo:</span>
              <span className="font-bold text-stone-900">{perfil.nombre}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-50">
              <span className="text-stone-500">Correo Electrónico:</span>
              <span className="font-semibold text-stone-800">{perfil.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-stone-50">
              <span className="text-stone-500">Rol de Usuario:</span>
              <span className="font-semibold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/60">
                {perfil.rol}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-stone-500">Estado de la Cuenta:</span>
              <span className="font-semibold text-emerald-700 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{perfil.activo ? 'Activa y Operativa' : 'Inactiva'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Consentimiento Legal */}
        <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center space-x-3 pb-3 border-b border-stone-100">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-stone-900">
                Consentimiento Expreso
              </h2>
              <span className="text-[11px] text-stone-400">Ley N° 25.326 Art. 5</span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-950 space-y-1">
              <span className="font-bold block">Consentimiento de Tratamiento:</span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Otorgado de forma libre, expresa e informada al registrarse en Dulce Vicio.
              </p>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-stone-500 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Fecha y Hora UTC:</span>
              </span>
              <span className="font-semibold text-stone-800 text-[11px]">
                {fechaConsentimientoFormateada}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Solicitudes de Revocación (Clase 9) */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-stone-900">
                Historial de Solicitudes de Revocación
              </h2>
              <p className="text-xs text-stone-500">
                Registro de trámites ejercidos bajo el Art. 34 de la Ley 24.240 y Disp. 954/2025
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {revocaciones.length} {revocaciones.length === 1 ? 'trámite' : 'trámites'}
          </span>
        </div>

        {revocaciones.length === 0 ? (
          <div className="p-8 text-center bg-stone-50/60 rounded-2xl border border-dashed border-stone-200 space-y-2">
            <p className="text-sm font-semibold text-stone-700">
              No tenés solicitudes de revocación registradas
            </p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Si realizás una compra y decidís revocarla dentro de los 10 días corridos, tu código de trámite legal aparecerá guardado aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {revocaciones.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-stone-500">Código Oficial:</span>
                    <span className="font-mono font-extrabold text-sm text-rose-700 tracking-wider">
                      {rev.codigo}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Pedido Asociado: <strong>#{rev.pedido_id}</strong>
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs text-stone-500">
                  <span className="block text-[11px] text-stone-400">Fecha de Emisión:</span>
                  <span className="font-semibold text-stone-700">
                    {new Date(rev.creada_en).toLocaleString('es-AR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MÓDULO DE PELIGRO: Baja de Cuenta & Anonimización (Ley 25.326 Art. 16) */}
      <div className="bg-rose-50/70 border-2 border-rose-300 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-sm shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display font-bold text-xl text-rose-950">
              Zona de Peligro: Eliminar mi cuenta (Derecho de Supresión)
            </h2>
            <p className="text-xs sm:text-sm text-rose-900/90 leading-relaxed">
              Conforme al <strong>Artículo 16 de la Ley N° 25.326</strong>, tenés derecho a solicitar la baja de tu cuenta y la anonimización definitiva de tus datos personales.
            </p>
          </div>
        </div>

        {/* Explicación clara de qué se borra y qué se conserva */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200 space-y-3 text-xs text-stone-700 leading-relaxed">
          <h4 className="font-bold text-rose-950 text-sm">
            ¿Qué sucede al solicitar la baja?
          </h4>
          <ul className="list-disc list-inside space-y-1.5 text-stone-600">
            <li>
              <strong className="text-stone-900">Datos personales que se anonimizan:</strong> Tu nombre, apellido, correo electrónico y contraseña serán reemplazados por identificadores anónimos irreversibles.
            </li>
            <li>
              <strong className="text-stone-900">Registros que se conservan:</strong> Los pedidos y montos históricos se preservan disociados de tu identidad por estricta obligación legal y contable tributaria.
            </li>
            <li>
              <strong className="text-stone-900">Acceso al sistema:</strong> Tu cuenta quedará inhabilitada de forma permanente y se cerrará tu sesión activa de inmediato.
            </li>
          </ul>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setModalBajaAbierto(true)}
            className="px-5 py-3 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-700/30 flex items-center space-x-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Iniciar Proceso de Baja de Cuenta</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmación Estricta de Baja */}
      <AnimatePresence>
        {modalBajaAbierto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-xl text-stone-900">
                  ¿Confirmás la baja definitiva de tu cuenta?
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Esta acción es <strong>irreversible</strong>. Tu nombre y correo serán anonimizados y perderás el acceso a Dulce Vicio.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
                <label htmlFor="palabraBaja" className="block font-semibold text-rose-950">
                  Para confirmar, escribí la palabra <span className="font-mono font-extrabold text-rose-700">ELIMINAR</span> a continuación:
                </label>
                <input
                  id="palabraBaja"
                  type="text"
                  placeholder="ELIMINAR"
                  value={palabraConfirmacion}
                  onChange={(e) => setPalabraConfirmacion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-rose-300 rounded-xl font-mono text-sm uppercase text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalBajaAbierto(false);
                    setPalabraConfirmacion('');
                  }}
                  disabled={procesandoBaja}
                  className="py-3 px-4 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarBaja}
                  disabled={palabraConfirmacion.trim() !== 'ELIMINAR' || procesandoBaja}
                  className="py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {procesandoBaja ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Anonimizando...</span>
                    </>
                  ) : (
                    <span>Confirmar Baja</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
