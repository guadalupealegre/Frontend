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
        <div className="bg-white rounded-3xl p-10 sm:p-16 border border-rose-200/80 shadow-warm space-y-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-[#FFF1F5] border-2 border-rose-200 flex items-center justify-center text-5xl shadow-inner">
            🧁
          </div>

          <div className="space-y-2">
            <h1 className="font-serif font-bold text-3xl text-[#3B111E]">
              Tu carrito está vacío
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
              Aún no has agregado ningún postre de nuestra repostería. Te invitamos a conocer nuestras especialidades artesanales.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-full bg-[#3B111E] hover:bg-[#E85D88] text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all active:scale-95"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-200/80 pb-5">
        <div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#3B111E] flex items-center space-x-3">
            <span>Tu Carrito de Compras</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF1F5] text-[#E85D88] border border-rose-200">
              {cantidadTotal} {cantidadTotal === 1 ? 'ítem' : 'ítems'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Revisá tus postres seleccionados antes de confirmar tu pedido artesanal.
          </p>
        </div>

        <button
          onClick={vaciar}
          className="text-xs font-bold text-[#E85D88] hover:text-[#D81B60] hover:underline self-start sm:self-auto flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Vaciar todo el carrito</span>
        </button>
      </div>

      {/* Alerta de Conflicto de Stock (HTTP 409) */}
      {errorStock && (
        <div className="bg-rose-50 border-2 border-rose-200 text-rose-900 p-5 rounded-3xl flex items-start space-x-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-[#E85D88] shrink-0 mt-0.5" />
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
          <div className="bg-white rounded-3xl border border-rose-200/80 shadow-sm p-4 sm:p-6 space-y-4">
            
            <div className="hidden sm:grid sm:grid-cols-12 text-xs font-bold text-[#3B111E] uppercase tracking-wider pb-3 border-b border-rose-100">
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
                  className="p-4 sm:p-3 rounded-2xl bg-[#FFF1F5]/40 border border-rose-200 flex flex-col sm:grid sm:grid-cols-12 items-center gap-3 transition-all hover:bg-[#FFF1F5]"
                >
                  {/* Info Producto */}
                  <div className="sm:col-span-6 flex items-center space-x-3.5 w-full">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-rose-200 flex items-center justify-center text-3xl shrink-0 shadow-xs">
                      {emoji}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif font-bold text-[#3B111E] text-base leading-tight truncate">
                        {producto.nombre}
                      </h3>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Stock disp.: <span className="font-bold text-emerald-700">{producto.stock} u.</span>
                      </p>
                    </div>
                  </div>

                  {/* Precio Unitario */}
                  <div className="sm:col-span-2 text-center w-full sm:w-auto flex sm:block justify-between text-xs">
                    <span className="sm:hidden text-stone-500">Precio Unitario:</span>
                    <span className="font-bold text-[#3B111E]">
                      ${precioUnitario.toLocaleString('es-AR')}
                    </span>
                  </div>

                  {/* Controles de Cantidad */}
                  <div className="sm:col-span-2 flex items-center justify-center space-x-1.5 w-full sm:w-auto justify-between sm:justify-center">
                    <span className="sm:hidden text-xs text-stone-500">Cantidad:</span>
                    <div className="flex items-center space-x-1 bg-white rounded-xl p-1 border border-rose-200 shadow-xs">
                      <button
                        onClick={() => actualizarCantidad(producto.id, cantidad - 1)}
                        className="w-7 h-7 rounded-lg bg-[#FAF8F5] hover:bg-rose-100 text-[#3B111E] hover:text-[#E85D88] flex items-center justify-center transition-colors"
                        aria-label="Restar una unidad"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-[#3B111E]">
                        {cantidad}
                      </span>
                      <button
                        onClick={() => actualizarCantidad(producto.id, cantidad + 1)}
                        disabled={cantidad >= producto.stock}
                        className="w-7 h-7 rounded-lg bg-[#FAF8F5] hover:bg-rose-100 text-[#3B111E] hover:text-[#E85D88] flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Sumar una unidad"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal y Botón Quitar */}
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-end space-x-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-rose-200">
                    <div className="text-right">
                      <span className="sm:hidden text-xs text-stone-500 mr-2">Subtotal:</span>
                      <span className="font-serif font-extrabold text-[#3B111E]">
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
              className="inline-flex items-center space-x-2 text-xs font-bold text-[#E85D88] hover:text-[#D81B60] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continuar eligiendo postres</span>
            </Link>
          </div>
        </div>

        {/* Columna Derecha: Resumen de Compra */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-rose-200/80 shadow-sm p-6 space-y-5">
            
            <h2 className="font-serif font-bold text-xl text-[#3B111E] border-b border-rose-100 pb-3">
              Resumen de la Compra
            </h2>

            {/* Desglose de Precios */}
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center justify-between text-stone-600">
                <span>Subtotal ({cantidadTotal} u.):</span>
                <span className="font-bold text-[#3B111E]">${total.toLocaleString('es-AR')}</span>
              </div>

              <div className="flex items-center justify-between text-stone-600">
                <span>Costo de Envío:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Bonificado / Gratis
                </span>
              </div>

              <div className="pt-3 border-t border-rose-100 flex items-baseline justify-between">
                <span className="font-serif font-bold text-base text-[#3B111E]">Total Final (Contado):</span>
                <span className="font-serif font-extrabold text-2xl sm:text-3xl text-[#E85D88] tracking-tight">
                  ${total.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Banner Informativo de Financiación */}
            <div className="p-4 rounded-2xl bg-[#FFF1F5] border border-rose-200 space-y-1.5 text-xs text-[#3B111E]">
              <div className="flex items-center space-x-1.5 font-bold">
                <CreditCard className="w-4 h-4 text-[#E85D88] shrink-0" />
                <span>Financiación disponible:</span>
              </div>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Podés abonar en 1 pago de contado o consultar cuotas sin interés con tarjetas bancarias seleccionadas.
              </p>
            </div>

            {/* Botón de Confirmación */}
            <button
              onClick={confirmar}
              disabled={enviando || items.length === 0}
              className="w-full py-4 px-6 rounded-2xl bg-[#E85D88] hover:bg-[#D81B60] text-white font-bold text-sm uppercase tracking-wider shadow-md shadow-[#E85D88]/20 flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
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
            <div className="space-y-2 pt-2 border-t border-rose-100 text-[11px] text-stone-500">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Precios finales exhibidos bajo <strong>Ley 24.240</strong>.</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <RotateCcw className="w-4 h-4 text-[#E85D88] shrink-0" />
                <span>Facultad de revocación bajo <strong>Res. 424/2020</strong>.</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </motion.div>
  );
}
