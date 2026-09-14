import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCarrito } from '../context/CarritoContext';
import { useAuth } from '../context/AuthContext';
import { crearPedido } from '../services/api';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  ArrowLeft,
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

export default function Carrito() {
  const { items, total, cantidadTotal, actualizarCantidad, quitar, vaciar, agregarToast } = useCarrito();
  const { usuario, token } = useAuth();
  const navigate = useNavigate();

  const [enviando, setEnviando] = useState(false);
  const [errorStock, setErrorStock] = useState(null);

  /**
   * Procesa la confirmación de la compra transaccional
   */
  const confirmar = async () => {
    if (enviando) return;

    if (!usuario || !token) {
      agregarToast('Debés iniciar sesión para confirmar tu compra.', 'warning');
      navigate('/login', { state: { from: '/carrito' } });
      return;
    }

    if (items.length === 0) {
      agregarToast('Tu carrito está vacío.', 'warning');
      return;
    }

    setEnviando(true);
    setErrorStock(null);

    try {
      const pedidoCreado = await crearPedido(items, token);
      vaciar();
      agregarToast(`¡Pedido #${pedidoCreado.id} confirmado con éxito! 🎉`, 'success');
      navigate('/mis-pedidos', {
        state: { nuevoPedidoId: pedidoCreado.id },
      });
    } catch (err) {
      console.error('Error al confirmar pedido:', err);
      setErrorStock(err.message || 'Ocurrió un inconveniente al procesar tu compra.');
      agregarToast(err.message || 'Error al procesar el pedido.', 'error');
    } finally {
      setEnviando(false);
    }
  };

  // Vista de Carrito Vacío
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto py-12 px-4 text-center space-y-6"
      >
        <div className="bg-white rounded-3xl p-10 sm:p-16 border border-rose-100 shadow-warm space-y-6">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-rose-50 border-2 border-rose-200/80 flex items-center justify-center text-5xl shadow-inner">
            🧁
          </div>

          <div className="space-y-2">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-stone-900">
              Tu carrito está vacío
            </h1>
            <p className="text-sm text-stone-500 max-w-md mx-auto">
              Aún no has agregado ningún postre de nuestra repostería. Te invitamos a conocer nuestras especialidades artesanales.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-rose-500/25 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Explorar el Catálogo de Postres</span>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-7xl mx-auto py-2 px-2 sm:px-4"
    >
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-200/60 pb-5">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-stone-900 flex items-center space-x-3">
            <span>Tu Carrito de Compras</span>
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              {cantidadTotal} {cantidadTotal === 1 ? 'ítem' : 'ítems'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Revisá tus postres seleccionados antes de confirmar tu pedido artesanal.
          </p>
        </div>

        <button
          onClick={vaciar}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline self-start sm:self-auto flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Vaciar todo el carrito</span>
        </button>
      </div>

      {/* Alerta de Conflicto de Stock (HTTP 409) */}
      {errorStock && (
        <div className="bg-rose-50 border-2 border-rose-200 text-rose-900 p-5 rounded-3xl flex items-start space-x-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <h3 className="font-bold text-sm text-rose-950">
              Disponibilidad de Stock Modificada
            </h3>
            <p className="text-xs text-rose-800 leading-relaxed">
              {errorStock}
            </p>
            <p className="text-[11px] text-rose-600 pt-1">
              Podés ajustar la cantidad de unidades en tu carrito o elegir otro postre para continuar.
            </p>
          </div>
        </div>
      )}

      {/* Contenido Principal: Grid de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Columna Izquierda: Lista de Ítems */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-4 sm:p-6 space-y-4">
            
            <div className="hidden sm:grid sm:grid-cols-12 text-xs font-semibold text-stone-400 uppercase tracking-wider pb-3 border-b border-stone-100">
              <span className="sm:col-span-6">Postre</span>
              <span className="sm:col-span-2 text-center">Precio Unitario</span>
              <span className="sm:col-span-2 text-center">Cantidad</span>
              <span className="sm:col-span-2 text-right">Subtotal</span>
            </div>

            {items.map(({ producto, cantidad }) => {
              const emoji = ICONOS_POSTRES[producto.nombre] || '🧁';
              const precioUnitario = Number(producto.precio_final) || 0;
              const subtotalItem = precioUnitario * cantidad;

              return (
                <div
                  key={producto.id}
                  className="p-4 sm:p-3 rounded-2xl bg-rose-50/30 border border-rose-100/80 flex flex-col sm:grid sm:grid-cols-12 items-center gap-3 transition-all hover:bg-rose-50/60"
                >
                  {/* Info Producto */}
                  <div className="sm:col-span-6 flex items-center space-x-3.5 w-full">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-100 to-amber-100 border border-rose-200 flex items-center justify-center text-3xl shrink-0 shadow-xs">
                      {emoji}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-stone-900 text-base leading-tight truncate">
                        {producto.nombre}
                      </h3>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Stock disp.: <span className="font-semibold text-emerald-700">{producto.stock} u.</span>
                      </p>
                    </div>
                  </div>

                  {/* Precio Unitario */}
                  <div className="sm:col-span-2 text-center w-full sm:w-auto flex sm:block justify-between text-xs">
                    <span className="sm:hidden text-stone-500">Precio Unitario:</span>
                    <span className="font-semibold text-stone-700">
                      ${precioUnitario.toLocaleString('es-AR')}
                    </span>
                  </div>

                  {/* Controles de Cantidad */}
                  <div className="sm:col-span-2 flex items-center justify-center space-x-1.5 w-full sm:w-auto justify-between sm:justify-center">
                    <span className="sm:hidden text-xs text-stone-500">Cantidad:</span>
                    <div className="flex items-center space-x-1 bg-white rounded-xl p-1 border border-stone-200 shadow-xs">
                      <button
                        onClick={() => actualizarCantidad(producto.id, cantidad - 1)}
                        className="w-7 h-7 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-rose-600 flex items-center justify-center transition-colors"
                        aria-label="Restar una unidad"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-stone-900">
                        {cantidad}
                      </span>
                      <button
                        onClick={() => actualizarCantidad(producto.id, cantidad + 1)}
                        disabled={cantidad >= producto.stock}
                        className="w-7 h-7 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 hover:text-rose-600 flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Sumar una unidad"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal y Botón Quitar */}
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-rose-100">
                    <div className="text-right">
                      <span className="sm:hidden text-xs text-stone-500 mr-2">Subtotal:</span>
                      <span className="font-display font-extrabold text-sm sm:text-base text-stone-900">
                        ${subtotalItem.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <button
                      onClick={() => quitar(producto.id)}
                      className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Quitar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-xs font-bold text-rose-700 hover:text-rose-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continuar eligiendo postres</span>
            </Link>
          </div>
        </div>

        {/* Columna Derecha: Resumen de Compra */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-rose-100 shadow-sm p-6 space-y-5">
            
            <h2 className="font-display font-bold text-lg text-stone-900 border-b border-stone-100 pb-3">
              Resumen de la Compra
            </h2>

            {/* Desglose de Precios */}
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-stone-600">
                <span>Subtotal ({cantidadTotal} u.):</span>
                <span className="font-semibold text-stone-800">${total.toLocaleString('es-AR')}</span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <span>Costo de Envío:</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Bonificado / Gratis
                </span>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-baseline justify-between">
                <span className="font-display font-bold text-base text-stone-900">Total Final (Contado):</span>
                <span className="font-display font-extrabold text-2xl sm:text-3xl text-rose-950 tracking-tight">
                  ${total.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Banner Informativo de Financiación */}
            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/60 space-y-1.5 text-xs text-rose-900">
              <div className="flex items-center space-x-1.5 font-bold">
                <CreditCard className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Financiación disponible:</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Podés abonar en 1 pago de contado o consultar cuotas sin interés con tarjetas bancarias seleccionadas.
              </p>
            </div>

            {/* Botón de Confirmación con Control de Doble Envío */}
            <button
              onClick={confirmar}
              disabled={enviando || items.length === 0}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-bold text-base shadow-lg shadow-rose-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
            >
              {enviando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Confirmando pedido…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmar Compra</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>

            {/* Marco Legal Argentino */}
            <div className="space-y-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Precios finales exhibidos bajo <strong>Ley 24.240</strong>.</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <RotateCcw className="w-4 h-4 text-rose-500 shrink-0" />
                <span>Facultad de revocación bajo <strong>Res. 424/2020</strong>.</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </motion.div>
  );
}
