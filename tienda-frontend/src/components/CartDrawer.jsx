import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCarrito } from '../context/CarritoContext';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
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

export default function CartDrawer() {
  const {
    items,
    total,
    cantidadTotal,
    drawerAbierto,
    cerrarDrawer,
    actualizarCantidad,
    quitar,
    vaciar,
  } = useCarrito();
  const navigate = useNavigate();

  const irAlCarrito = () => {
    cerrarDrawer();
    navigate('/carrito');
  };

  return (
    <AnimatePresence>
      {drawerAbierto && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop con desenfoque */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cerrarDrawer}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-screen max-w-md bg-[#faf7f2] border-l border-rose-200/80 shadow-2xl flex flex-col justify-between"
            >
              {/* Cabecera del Drawer */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-[#28130a] via-[#3a1d12] to-[#200f07] text-amber-50 flex items-center justify-between border-b border-rose-950/60">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-rose-300" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg text-white">Tu Carrito Dulce</h2>
                    <p className="text-xs text-rose-200/80">
                      {cantidadTotal} {cantidadTotal === 1 ? 'postre seleccionado' : 'postres seleccionados'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={cerrarDrawer}
                  className="p-2 rounded-xl text-rose-200/80 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Cerrar panel de carrito"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lista de Ítems */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                    <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-4xl shadow-inner">
                      🧁
                    </div>
                    <div className="space-y-1 max-w-xs">
                      <h3 className="font-display font-bold text-stone-800 text-lg">Tu carrito está vacío</h3>
                      <p className="text-xs text-stone-500">
                        Aún no agregaste postres artesanales a tu pedido. ¡Elegí tu delicia favorita del catálogo!
                      </p>
                    </div>
                    <button
                      onClick={cerrarDrawer}
                      className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 text-white font-semibold text-xs shadow-md shadow-rose-500/20 hover:from-rose-600 hover:to-amber-700 transition-all"
                    >
                      Explorar Catálogo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-rose-100 text-xs text-stone-500">
                      <span>Productos en la orden</span>
                      <button
                        onClick={vaciar}
                        className="text-rose-600 hover:text-rose-800 font-medium transition-colors"
                      >
                        Vaciar todo
                      </button>
                    </div>

                    {items.map(({ producto, cantidad }) => {
                      const emoji = ICONOS_POSTRES[producto.nombre] || '🧁';
                      const subtotalItem = (Number(producto.precio_final) || 0) * cantidad;

                      return (
                        <div
                          key={producto.id}
                          className="bg-white rounded-2xl p-3.5 border border-rose-100 shadow-sm flex items-center space-x-3 transition-all hover:shadow-md"
                        >
                          {/* Emoji Icon Preview */}
                          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center justify-center text-2xl shrink-0">
                            {emoji}
                          </div>

                          {/* Información y Precio */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-display font-bold text-sm text-stone-900 truncate">
                              {producto.nombre}
                            </h4>
                            <div className="flex items-baseline space-x-1.5 mt-0.5">
                              <span className="text-xs font-semibold text-rose-900">
                                ${Number(producto.precio_final).toLocaleString('es-AR')}
                              </span>
                              <span className="text-[10px] text-stone-400">c/u</span>
                            </div>
                          </div>

                          {/* Controles de Cantidad */}
                          <div className="flex items-center space-x-1 bg-stone-100 rounded-xl p-1 border border-stone-200/60">
                            <button
                              onClick={() => actualizarCantidad(producto.id, cantidad - 1)}
                              className="w-6 h-6 rounded-lg bg-white text-stone-700 hover:text-rose-600 flex items-center justify-center shadow-xs transition-colors"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-stone-800">
                              {cantidad}
                            </span>
                            <button
                              onClick={() => actualizarCantidad(producto.id, cantidad + 1)}
                              disabled={cantidad >= producto.stock}
                              className="w-6 h-6 rounded-lg bg-white text-stone-700 hover:text-rose-600 flex items-center justify-center shadow-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Botón Eliminar */}
                          <button
                            onClick={() => quitar(producto.id)}
                            className="p-1.5 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Eliminar postre"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer del Drawer: Totales y Acciones */}
              {items.length > 0 && (
                <div className="p-5 sm:p-6 bg-white border-t border-rose-100 space-y-4 shadow-lg">
                  
                  {/* Desglose */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Subtotal estimado:</span>
                      <span className="font-medium text-stone-700">${total.toLocaleString('es-AR')}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-stone-500">
                      <span>Envío artesanal:</span>
                      <span className="text-emerald-700 font-semibold">Gratis / Bonificado</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <span className="font-display font-bold text-base text-stone-900">Total a Pagar:</span>
                      <span className="font-display font-extrabold text-2xl text-rose-950">
                        ${total.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>

                  {/* Botones de Navegación */}
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={irAlCarrito}
                      className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-bold text-sm shadow-md shadow-rose-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95"
                    >
                      <span>Confirmar Pedido</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={irAlCarrito}
                      className="w-full py-2.5 px-4 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs flex items-center justify-center transition-colors"
                    >
                      Ver carrito en detalle
                    </button>
                  </div>

                  <div className="flex items-center justify-center space-x-1.5 text-[11px] text-stone-400 text-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>Compra protegida bajo la Ley N° 24.240</span>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
