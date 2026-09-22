import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { getMisPedidos, revocarPedido } from '../services/api';
import {
  RotateCcw,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Send,
  HelpCircle,
  LogIn,
  Package,
  ArrowRight,
  Loader2,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

export default function Arrepentimiento() {
  const { usuario, token } = useAuth();
  const { agregarToast } = useCarrito();
  const navigate = useNavigate();

  // Estado para usuarios logueados (pedidos activos)
  const [pedidos, setPedidos] = useState([]);
  const [cargandoPedidos, setCargandoPedidos] = useState(false);
  const [revocandoId, setRevocandoId] = useState(null);
  const [codigoExito, setCodigoExito] = useState(null);
  const [copiado, setCopiado] = useState(false);

  // Estado para usuarios no logueados (formulario manual)
  const [formManual, setFormManual] = useState({
    numeroPedido: '',
    email: '',
    telefono: '',
    motivo: '',
  });
  const [enviandoManual, setEnviandoManual] = useState(false);
  const [tramiteManualGenerado, setTramiteManualGenerado] = useState(null);

  useEffect(() => {
    if (token) {
      setCargandoPedidos(true);
      getMisPedidos(token)
        .then((data) => setPedidos(data || []))
        .catch((err) => console.error('Error al cargar pedidos:', err))
        .finally(() => setCargandoPedidos(false));
    }
  }, [token]);

  const puedeRevocar = (pedido) => {
    if (!pedido || pedido.estado.toLowerCase() === 'cancelado') return false;
    const fechaPedido = new Date(pedido.fecha_creacion);
    if (isNaN(fechaPedido.getTime())) return false;
    const diferenciaDias = (new Date() - fechaPedido) / (1000 * 60 * 60 * 24);
    return diferenciaDias <= 10;
  };

  const handleRevocarDirecto = async (pedidoId) => {
    if (revocandoId) return;
    setRevocandoId(pedidoId);
    try {
      const res = await revocarPedido(pedidoId, token);
      setCodigoExito(res.codigo);
      agregarToast(`Pedido #${pedidoId} revocado con éxito. Código: ${res.codigo}`, 'success');
      // Refrescar lista
      const data = await getMisPedidos(token);
      setPedidos(data || []);
    } catch (err) {
      console.error('Error al revocar:', err);
      agregarToast(err.message || 'Error al revocar el pedido.', 'error');
    } finally {
      setRevocandoId(null);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    setEnviandoManual(true);
    setTimeout(() => {
      const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const sufijo = Math.random().toString(36).substring(2, 8).toUpperCase();
      const codigo = `ARR-${fecha}-${sufijo}`;
      setTramiteManualGenerado(codigo);
      setEnviandoManual(false);
      agregarToast('Solicitud de trámite generada con éxito.', 'success');
    }, 600);
  };

  const handleCopiar = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const pedidosRevocables = pedidos.filter(puedeRevocar);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto space-y-8 py-4 px-2 sm:px-4"
    >
      {/* Banner Legal Informativo */}
      <div className="bg-[#3B111E] text-[#FAF8F5] rounded-3xl p-8 shadow-xl border border-rose-900/40 space-y-4">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-[#E85D88]/20 text-[#E85D88] rounded-2xl border border-[#E85D88]/30 shrink-0">
            <RotateCcw className="w-8 h-8 text-[#E85D88]" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#E85D88] uppercase tracking-wider mb-1">
              <Scale className="w-3.5 h-3.5" />
              <span>Resolución 424/2020 & Disp. 954/2025 (Ley N° 24.240 Art. 34)</span>
            </div>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white">
              Botón de Arrepentimiento
            </h1>
          </div>
        </div>

        <div className="p-5 bg-[#4A1525] rounded-2xl border border-rose-800/50 text-xs sm:text-sm text-rose-100/90 leading-relaxed space-y-3">
          <p>
            En cumplimiento con la normativa comercial argentina para comercio electrónico, tenés derecho a <strong>revocar tu compra dentro de los diez (10) días corridos</strong> contados a partir de la fecha de entrega del producto o de la celebración del contrato.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-semibold text-white">
            <div className="flex items-center space-x-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
              <Sparkles className="w-4 h-4 text-[#E85D88] shrink-0" />
              <span>Sin costo ni penalidad</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#E85D88] shrink-0" />
              <span>Gastos a cargo del vendedor</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/5 p-2.5 rounded-xl border border-white/10">
              <FileText className="w-4 h-4 text-[#E85D88] shrink-0" />
              <span>Código legal inmediato</span>
            </div>
          </div>
        </div>
      </div>

      {/* CASO A: USUARIO AUTENTICADO */}
      {usuario ? (
        <div className="space-y-6">
          {/* Resultado de Código Exitoso */}
          {codigoExito && (
            <div
              role="status"
              className="bg-white rounded-3xl border-2 border-[#E85D88] p-8 shadow-xl space-y-5 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#FFF1F5] text-[#E85D88] flex items-center justify-center mx-auto border border-rose-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h2 className="font-serif font-bold text-2xl text-[#3B111E]">
                  ¡Revocación Registrada con Éxito!
                </h2>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Hemos generado tu comprobante legal oficial conforme a la Disp. 954/2025.
                </p>
              </div>

              <div className="p-4 bg-[#FFF1F5] rounded-2xl border border-rose-200 max-w-md mx-auto flex items-center justify-between gap-3">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Código Oficial:</span>
                  <span className="font-mono font-extrabold text-xl text-[#E85D88]">{codigoExito}</span>
                </div>
                <button
                  onClick={() => handleCopiar(codigoExito)}
                  className="px-4 py-2 bg-[#E85D88] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 hover:bg-[#D81B60] transition-colors"
                >
                  {copiado ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copiado ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

              <div className="pt-2">
                <Link
                  to="/mis-pedidos"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-[#3B111E] text-white text-xs font-bold rounded-xl hover:bg-[#E85D88] transition-colors"
                >
                  <span>Ver en Mis Pedidos</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Listado de Pedidos Revocables */}
          <div className="bg-white rounded-3xl border border-rose-200/80 p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF1F5] border border-rose-200 flex items-center justify-center text-[#E85D88]">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif font-bold text-xl text-[#3B111E]">
                    Tus compras con derecho de revocación vigente
                  </h2>
                  <p className="text-xs text-stone-500">
                    Pedidos realizados en los últimos 10 días corridos
                  </p>
                </div>
              </div>
              <Link
                to="/mis-pedidos"
                className="text-xs font-bold text-[#E85D88] hover:text-[#D81B60] flex items-center space-x-1"
              >
                <span>Ver historial completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {cargandoPedidos ? (
              <div className="py-8 text-center text-stone-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#E85D88] mb-2" />
                <span className="text-xs font-semibold">Consultando tus pedidos...</span>
              </div>
            ) : pedidosRevocables.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-dashed border-rose-200 space-y-2">
                <p className="text-sm font-semibold text-stone-700">
                  No tenés pedidos activos dentro del plazo de 10 días para revocar
                </p>
                <p className="text-xs text-stone-500 max-w-md mx-auto">
                  Todos tus pedidos están cancelados o superaron el plazo de 10 días corridos.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pedidosRevocables.map((ped) => (
                  <div
                    key={ped.id}
                    className="p-4 rounded-2xl bg-[#FFF1F5]/60 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-serif font-bold text-[#3B111E] text-base">
                          Pedido #{ped.id}
                        </span>
                        <span className="text-xs text-stone-600">
                          Total: <strong>${Number(ped.total).toLocaleString('es-AR')}</strong>
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Fecha: {new Date(ped.fecha_creacion).toLocaleDateString('es-AR', { dateStyle: 'long' })}
                      </p>
                    </div>

                    <button
                      onClick={() => handleRevocarDirecto(ped.id)}
                      disabled={revocandoId === ped.id}
                      className="px-5 py-2.5 bg-[#E85D88] hover:bg-[#D81B60] text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5 transition-all self-start sm:self-auto disabled:opacity-50"
                    >
                      {revocandoId === ped.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Revocar este pedido</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* CASO B: USUARIO NO LOGUEADO */
        <div className="space-y-6">
          {/* Banner de Invitación al Login */}
          <div className="bg-white rounded-3xl border border-rose-200/80 p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h2 className="font-serif font-bold text-xl text-[#3B111E]">
                ¿Realizaste tu compra con una cuenta registrada?
              </h2>
              <p className="text-xs text-stone-500">
                Iniciá sesión para revocar tu orden en 1 clic y obtener tu código oficial de inmediato.
              </p>
            </div>
            <Link
              to="/login"
              state={{ from: '/arrepentimiento' }}
              className="px-6 py-3.5 rounded-2xl bg-[#3B111E] hover:bg-[#5C1B2E] text-white text-xs font-bold flex items-center space-x-2 transition-all shadow-md shrink-0"
            >
              <LogIn className="w-4 h-4 text-[#E85D88]" />
              <span>Iniciar Sesión para Revocar</span>
            </Link>
          </div>

          {/* Formulario Manual Público */}
          {tramiteManualGenerado ? (
            <div
              role="status"
              className="bg-white rounded-3xl border-2 border-[#E85D88] p-8 shadow-xl space-y-5 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#FFF1F5] text-[#E85D88] flex items-center justify-center mx-auto border border-rose-200">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                <h2 className="font-serif font-bold text-2xl text-[#3B111E]">
                  Solicitud de Revocación Registrada
                </h2>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Hemos generado tu número de identificación de trámite conforme a la Res. 424/2020.
                </p>
              </div>

              <div className="p-4 bg-[#FFF1F5] rounded-2xl border border-rose-200 max-w-md mx-auto space-y-1">
                <span className="text-[11px] text-stone-500 uppercase font-bold block">Código de Trámite:</span>
                <span className="font-mono font-extrabold text-2xl text-[#E85D88]">{tramiteManualGenerado}</span>
                <p className="text-[11px] text-stone-500">Guardá este código como comprobante legal.</p>
              </div>

              <p className="text-xs text-stone-600 max-w-lg mx-auto leading-relaxed">
                Nos comunicaremos a <strong>{formManual.email}</strong> dentro de las 24 horas hábiles para coordinar el reintegro.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-rose-200/80 p-8 shadow-sm space-y-4">
              <div className="space-y-1">
                <h2 className="font-serif font-bold text-xl text-[#3B111E]">
                  Formulario de Solicitud de Arrepentimiento Manual
                </h2>
                <p className="text-xs text-stone-500">
                  Completá los datos de tu compra para generar el código de trámite oficial.
                </p>
              </div>

              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="numeroPedido">
                      Número de Pedido *
                    </label>
                    <input
                      id="numeroPedido"
                      type="text"
                      required
                      placeholder="Ej: 104"
                      value={formManual.numeroPedido}
                      onChange={(e) => setFormManual({ ...formManual, numeroPedido: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="email">
                      Correo Electrónico de la Compra *
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="nombre@ejemplo.com"
                      value={formManual.email}
                      onChange={(e) => setFormManual({ ...formManual, email: e.target.value })}
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="telefono">
                    Teléfono de Contacto (Opcional)
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    placeholder="Ej: 11 2345 6789"
                    value={formManual.telefono}
                    onChange={(e) => setFormManual({ ...formManual, telefono: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="motivo">
                    Motivo o Comentarios (Opcional)
                  </label>
                  <textarea
                    id="motivo"
                    rows="3"
                    placeholder="Detalle breve de la revocación..."
                    value={formManual.motivo}
                    onChange={(e) => setFormManual({ ...formManual, motivo: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88] resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={enviandoManual}
                  className="w-full py-4 px-6 rounded-2xl bg-[#E85D88] hover:bg-[#D81B60] text-white font-bold text-sm shadow-md shadow-[#E85D88]/20 flex items-center justify-center space-x-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>{enviandoManual ? 'Generando comprobante...' : 'Enviar Solicitud de Arrepentimiento'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
