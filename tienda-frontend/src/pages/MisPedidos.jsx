import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCarrito } from '../context/CarritoContext';
import { getMisPedidos, revocarPedido } from '../services/api';
import {
  Package,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Cake,
  Receipt,
  Copy,
  Check,
  Loader2,
  X,
  Info,
} from 'lucide-react';

const ICONOS_POSTRES = {
  'Tiramisú': '☕🍰',
  'Brownie': '🍫✨',
  'Chocotorta': '🍪🎂',
  'Turrón de Quaker': '🌾🍫',
  'Budín de pan': '🍮🍯',
  'Flan': '🍮✨',
  'Cookie': '🍪🍪',
};

const ESTADOS_PEDIDO = {
  pendiente: {
    etiqueta: 'En Preparación / Pendiente',
    color: 'bg-amber-50 text-amber-900 border-amber-300',
    punto: 'bg-amber-500',
  },
  pagado: {
    etiqueta: 'Pago Confirmado',
    color: 'bg-blue-50 text-blue-900 border-blue-300',
    punto: 'bg-blue-500',
  },
  entregado: {
    etiqueta: 'Entregado / Completado',
    color: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    punto: 'bg-emerald-500',
  },
  cancelado: {
    etiqueta: 'Cancelado / Revocado',
    color: 'bg-rose-50 text-rose-900 border-rose-300',
    punto: 'bg-rose-500',
  },
};

export default function MisPedidos() {
  const { token, usuario } = useAuth();
  const { agregarToast } = useCarrito();
  const location = useLocation();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Control de acordeón expandido
  const [expandidos, setExpandidos] = useState({});

  // Estados de revocación de compra
  const [pedidoARevocar, setPedidoARevocar] = useState(null);
  const [enviandoRevocacion, setEnviandoRevocacion] = useState(false);
  const [comprobanteRevocacion, setComprobanteRevocacion] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const nuevoPedidoId = location.state?.nuevoPedidoId;

  const cargarHistorial = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getMisPedidos(token);
      setPedidos(data || []);

      if (data && data.length > 0) {
        const idParaAbrir = nuevoPedidoId || data[0].id;
        setExpandidos({ [idParaAbrir]: true });
      }
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      setError(err.message || 'No se pudo cargar tu historial de pedidos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (token) {
      cargarHistorial();
    }
  }, [token]);

  const toggleExpandido = (id) => {
    setExpandidos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  /**
   * Determina si una orden puede revocarse legalmente:
   * 1. No debe estar ya en estado 'cancelado'.
   * 2. Deben haber transcurrido 10 días corridos o menos desde su creación.
   */
  const puedeRevocar = (pedido) => {
    if (!pedido || pedido.estado.toLowerCase() === 'cancelado') return false;

    const fechaPedido = new Date(pedido.fecha_creacion);
    if (isNaN(fechaPedido.getTime())) return false;

    const ahora = new Date();
    const diferenciaDias = (ahora - fechaPedido) / (1000 * 60 * 60 * 24);
    return diferenciaDias <= 10;
  };

  /**
   * Ejecuta la revocación del pedido llamando a POST /pedidos/{id}/revocacion
   */
  const handleEjecutarRevocacion = async () => {
    if (!pedidoARevocar || enviandoRevocacion) return;

    setEnviandoRevocacion(true);
    try {
      const res = await revocarPedido(pedidoARevocar.id, token);
      
      // Mostrar comprobante legal
      setComprobanteRevocacion({
        codigo: res.codigo,
        pedidoId: pedidoARevocar.id,
        fecha: res.creada_en,
      });

      setPedidoARevocar(null);
      agregarToast(`Revocación registrada con código ${res.codigo}`, 'success');

      // Refrescar lista de pedidos para reflejar el estado "cancelado"
      await cargarHistorial();
    } catch (err) {
      console.error('Error al revocar pedido:', err);
      agregarToast(err.message || 'No se pudo procesar la revocación.', 'error');
    } finally {
      setEnviandoRevocacion(false);
    }
  };

  const handleCopiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  // ESTADO CARGANDO
  if (cargando && pedidos.length === 0) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FFF1F5] flex items-center justify-center animate-pulse">
          <Cake className="w-9 h-9 text-[#E85D88] animate-bounce" />
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-serif font-bold text-xl text-[#3B111E]">
            Consultando tu historial de compras...
          </h2>
          <p className="text-xs text-stone-500">Recuperando pedidos en Dulce Vicio</p>
        </div>
      </div>
    );
  }

  // ESTADO ERROR
  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 flex items-center justify-center text-[#E85D88]">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="font-serif font-bold text-xl text-rose-950">
            No pudimos cargar tus pedidos
          </h2>
          <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
        </div>
        <button
          onClick={cargarHistorial}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-[#3B111E] text-white rounded-xl text-xs font-bold hover:bg-[#E85D88] transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reintentar</span>
        </button>
      </div>
    );
  }

  // ESTADO LISTA VACÍA
  if (pedidos.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-12 bg-white border border-rose-200/80 rounded-3xl text-center space-y-6 shadow-warm">
        <div className="w-20 h-20 mx-auto rounded-full bg-[#FFF1F5] border-2 border-rose-200 flex items-center justify-center text-4xl shadow-inner">
          🍰
        </div>
        <div className="space-y-2">
          <h2 className="font-serif font-bold text-2xl text-[#3B111E]">
            Aún no realizaste ningún pedido
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            ¡Descubrí nuestra carta de postres recién horneados y hacé tu primer pedido artesanal hoy mismo!
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-[#3B111E] hover:bg-[#E85D88] text-white font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver Catálogo de Postres</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-4xl mx-auto space-y-8 py-4 px-2 sm:px-4"
    >
      {/* Banner Header */}
      <div className="bg-[#3B111E] text-[#FAF8F5] p-8 rounded-3xl shadow-xl border border-rose-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center space-x-1.5 bg-[#E85D88]/20 px-3.5 py-1 rounded-full text-xs font-bold text-[#E85D88] border border-[#E85D88]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#E85D88]" />
            <span>Compras Confirmadas</span>
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white">
            Historial de Mis Pedidos
          </h1>
          <p className="text-xs text-rose-100/80">
            Hola <span className="font-semibold text-white">{usuario?.nombre}</span>, aquí tenés el registro de todos tus pedidos en Dulce Vicio.
          </p>
        </div>

        <div className="bg-[#4A1525] px-6 py-4 rounded-2xl border border-rose-800/50 text-center shrink-0">
          <span className="block text-3xl font-extrabold text-[#E85D88]">{pedidos.length}</span>
          <span className="text-[10px] uppercase font-bold text-rose-200 tracking-wider">
            {pedidos.length === 1 ? 'Pedido Registrado' : 'Pedidos Registrados'}
          </span>
        </div>
      </div>

      {/* Alerta de nuevo pedido recién creado */}
      {nuevoPedidoId && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center space-x-3 shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs sm:text-sm font-medium">
            ¡Felicitaciones! Tu orden <strong>#{nuevoPedidoId}</strong> fue registrada y se encuentra en estado de preparación.
          </p>
        </div>
      )}

      {/* BANNER DESTACADO DE COMPROBANTE DE REVOCACIÓN (role="status") */}
      <AnimatePresence>
        {comprobanteRevocacion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            role="status"
            aria-live="polite"
            className="p-6 sm:p-8 rounded-3xl bg-[#FFF1F5] border-2 border-[#E85D88] text-rose-950 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg.E85D88 bg-[#E85D88] text-white rounded-2xl shadow-sm">
                  <RotateCcw className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#3B111E]">
                    ¡Solicitud de Revocación Registrada con Éxito!
                  </h3>
                  <p className="text-xs text-rose-900">
                    Conforme a la Ley N° 24.240 Art. 34 y la Disp. 954/2025 para el pedido #{comprobanteRevocacion.pedidoId}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setComprobanteRevocacion(null)}
                className="p-1.5 text-rose-700 hover:text-rose-950 rounded-lg"
                aria-label="Cerrar aviso de revocación"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold block">
                  Código Único de Identificación de Trámite:
                </span>
                <span className="font-mono font-extrabold text-2xl text-[#E85D88] tracking-wider">
                  {comprobanteRevocacion.codigo}
                </span>
              </div>

              <button
                onClick={() => handleCopiarCodigo(comprobanteRevocacion.codigo)}
                className="px-5 py-2.5 bg-[#FFF1F5] hover:bg-rose-100 text-[#3B111E] border border-rose-200 rounded-xl text-xs font-bold flex items-center space-x-2 transition-colors shrink-0"
              >
                {copiado ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#E85D88]" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              Guardá este código como constancia legal de tu solicitud. El stock fue reincorporado a nuestro inventario y el reembolso correspondiente será procesado por el mismo medio de pago utilizado.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de Tarjetas / Acordeón de Pedidos */}
      <div className="space-y-4">
        {pedidos.map((pedido) => {
          const abierto = expandidos[pedido.id];
          const infoEstado = ESTADOS_PEDIDO[pedido.estado.toLowerCase()] || ESTADOS_PEDIDO['pendiente'];
          const revocable = puedeRevocar(pedido);

          // Formateo de fecha
          const fechaObj = new Date(pedido.fecha_creacion);
          const fechaFormateada = !isNaN(fechaObj.getTime())
            ? fechaObj.toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Fecha no disponible';

          return (
            <div
              key={pedido.id}
              className="bg-white rounded-3xl border border-rose-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              {/* Encabezado del Acordeón */}
              <button
                onClick={() => toggleExpandido(pedido.id)}
                className="w-full p-6 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-[#FAF0F3]/40 transition-colors"
                aria-expanded={abierto}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FFF1F5] border border-rose-200 flex items-center justify-center text-[#E85D88] shrink-0">
                    <Receipt className="w-6 h-6 text-[#E85D88]" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-serif font-bold text-xl text-[#3B111E]">
                        Pedido #{pedido.id}
                      </span>
                      {nuevoPedidoId === pedido.id && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-600 text-white">
                          ¡Nuevo!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-stone-500">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{fechaFormateada}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0 border-stone-100">
                  {/* Badge de Estado */}
                  <span
                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${infoEstado.color}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${infoEstado.punto}`} />
                    <span>{infoEstado.etiqueta}</span>
                  </span>

                  {/* Total */}
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block uppercase font-bold">Total</span>
                    <span className="font-serif font-extrabold text-xl text-[#3B111E]">
                      ${Number(pedido.total).toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div className="p-1.5 rounded-xl bg-stone-100 text-stone-600">
                    {abierto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Cuerpo del Acordeón */}
              {abierto && (
                <div className="px-6 pb-6 pt-2 border-t border-stone-100 bg-[#FAF8F5]/60 space-y-4">
                  <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Desglose de Productos Adquiridos
                  </h4>

                  <div className="space-y-2">
                    {pedido.items?.map((item) => {
                      const nombreProd = item.producto?.nombre || `Postre #${item.producto_id}`;
                      const emoji = ICONOS_POSTRES[nombreProd] || '🧁';
                      const precioUnitario = Number(item.precio_unitario) || 0;
                      const subtotalItem = precioUnitario * item.cantidad;

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl p-4 border border-rose-200/60 flex items-center justify-between shadow-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{emoji}</span>
                            <div>
                              <span className="font-serif font-bold text-sm text-[#3B111E] block">
                                {nombreProd}
                              </span>
                              <span className="text-xs text-stone-500">
                                Cantidad: <strong>{item.cantidad} u.</strong> &times; ${precioUnitario.toLocaleString('es-AR')} (Precio congelado)
                              </span>
                            </div>
                          </div>

                          <span className="font-serif font-bold text-base text-[#3B111E]">
                            ${subtotalItem.toLocaleString('es-AR')}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Acciones y Botón de Arrepentimiento */}
                  <div className="pt-3 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-1.5 text-stone-500">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Transacción protegida por la Ley 24.240.</span>
                    </div>

                    {/* Botón de Revocación Condicional (Clase 9) */}
                    {revocable ? (
                      <button
                        onClick={() => setPedidoARevocar(pedido)}
                        disabled={enviandoRevocacion}
                        className="px-5 py-2.5 rounded-xl bg-[#E85D88] hover:bg-[#D81B60] text-white font-bold text-xs shadow-md shadow-[#E85D88]/20 flex items-center space-x-1.5 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Arrepentirme de esta compra</span>
                      </button>
                    ) : pedido.estado.toLowerCase() === 'cancelado' ? (
                      <span className="text-stone-400 italic">
                        Pedido revocado o cancelado previamente.
                      </span>
                    ) : (
                      <span className="text-stone-400 italic" title="Plazo de 10 días vencido">
                        Plazo legal de arrepentimiento cumplido (10 días).
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Confirmación de Revocación */}
      <AnimatePresence>
        {pedidoARevocar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3B111E]/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-lg w-full p-8 space-y-6"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF1F5] text-[#E85D88] flex items-center justify-center border border-rose-200">
                  <RotateCcw className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-2xl text-[#3B111E]">
                  ¿Deseás revocar el Pedido #{pedidoARevocar.id}?
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Conforme a la <strong>Ley N° 24.240 Art. 34</strong> y la <strong>Disp. 954/2025</strong>, tenés derecho a revocar tu compra sin cargo alguno.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#FFF1F5] border border-rose-200 space-y-2 text-xs text-[#3B111E]">
                <p className="font-bold">Efectos legales de la revocación:</p>
                <ul className="list-disc list-inside space-y-1 text-stone-700">
                  <li>El pedido quedará cancelado de forma inmediata.</li>
                  <li>Las unidades compradas volverán a sumarse al stock de la tienda.</li>
                  <li>Se generará un <strong>código único ARR-YYYYMMDD-XXXXXX</strong> como comprobante oficial.</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPedidoARevocar(null)}
                  disabled={enviandoRevocacion}
                  className="py-3 px-4 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEjecutarRevocacion}
                  disabled={enviandoRevocacion}
                  className="py-3 px-4 rounded-xl bg-[#E85D88] hover:bg-[#D81B60] text-white text-xs font-bold shadow-md flex items-center justify-center space-x-1.5 transition-all disabled:opacity-60"
                >
                  {enviandoRevocacion ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>Confirmar Revocación</span>
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
