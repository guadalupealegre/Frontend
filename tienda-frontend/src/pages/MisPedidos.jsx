import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMisPedidos } from '../services/api';
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
  ArrowRight,
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
    etiqueta: 'Pendiente de Pago / Preparación',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    punto: 'bg-amber-500',
  },
  pagado: {
    etiqueta: 'Pago Confirmado',
    color: 'bg-blue-100 text-blue-900 border-blue-300',
    punto: 'bg-blue-500',
  },
  entregado: {
    etiqueta: 'Entregado / Completado',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    punto: 'bg-emerald-500',
  },
  cancelado: {
    etiqueta: 'Cancelado',
    color: 'bg-rose-100 text-rose-900 border-rose-300',
    punto: 'bg-rose-500',
  },
};

export default function MisPedidos() {
  const { token, usuario } = useAuth();
  const location = useLocation();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Control de acordeón expandido (por defecto abre el primer pedido o el recién creado)
  const [expandidos, setExpandidos] = useState({});

  const nuevoPedidoId = location.state?.nuevoPedidoId;

  const cargarHistorial = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getMisPedidos(token);
      setPedidos(data || []);

      // Autoexpandir el pedido más reciente o el recién creado
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

  // ==========================================
  // ESTADO 1: CARGANDO
  // ==========================================
  if (cargando) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 animate-fade-in">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 flex items-center justify-center animate-pulse">
            <Cake className="w-9 h-9 text-amber-600 animate-bounce" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="font-display font-bold text-lg text-stone-900">
            Consultando tu historial de compras...
          </h2>
          <p className="text-xs text-stone-500">Recuperando pedidos en Dulce Vicio</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ESTADO 2: ERROR
  // ==========================================
  if (error) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-6 sm:p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center space-y-4 shadow-sm animate-fade-in">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="font-display font-bold text-lg text-rose-950">
            No pudimos cargar tus pedidos
          </h2>
          <p className="text-xs text-rose-700 max-w-md mx-auto">{error}</p>
        </div>
        <button
          onClick={cargarHistorial}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reintentar</span>
        </button>
      </div>
    );
  }

  // ==========================================
  // ESTADO 3: LISTA VACÍA
  // ==========================================
  if (pedidos.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 sm:p-12 bg-white border border-amber-100 rounded-3xl text-center space-y-6 shadow-warm animate-fade-in">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-50 border-2 border-amber-200/80 flex items-center justify-center text-4xl shadow-inner">
          🍰
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-stone-900">
            Aún no realizaste ningún pedido
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            ¡Descubrí la carta de postres recién horneados y hacé tu primer pedido artesanal hoy mismo!
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ver Catálogo de Postres</span>
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // HISTORIAL DE PEDIDOS EXITOSO (ACORDEÓN)
  // ==========================================
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Banner de Bienvenida y Resumen */}
      <div className="bg-gradient-to-r from-[#382216] via-[#4d281a] to-[#2c1810] text-amber-50 p-6 sm:p-8 rounded-3xl shadow-warm border border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center space-x-1.5 bg-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold text-amber-300 border border-amber-400/30">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Compras Confirmadas</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Historial de Mis Pedidos
          </h1>
          <p className="text-xs text-amber-200/80">
            Hola <span className="font-semibold text-white">{usuario?.nombre}</span>, aquí tenés el registro de todos tus pedidos en Dulce Vicio.
          </p>
        </div>

        <div className="bg-black/30 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
          <span className="block text-2xl font-extrabold text-amber-300">{pedidos.length}</span>
          <span className="text-[10px] uppercase font-bold text-amber-200/80 tracking-wider">
            {pedidos.length === 1 ? 'Pedido Registrado' : 'Pedidos Registrados'}
          </span>
        </div>
      </div>

      {/* Alerta si acaba de confirmar un pedido */}
      {nuevoPedidoId && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center space-x-3 shadow-xs animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-xs sm:text-sm font-medium">
            ¡Felicitaciones! Tu orden <strong>#{nuevoPedidoId}</strong> fue registrada y se encuentra en estado de preparación.
          </p>
        </div>
      )}

      {/* Lista de Tarjetas / Acordeón de Pedidos */}
      <div className="space-y-4">
        {pedidos.map((pedido) => {
          const abierto = expandidos[pedido.id];
          const infoEstado = ESTADOS_PEDIDO[pedido.estado] || ESTADOS_PEDIDO['pendiente'];

          // Formateo de fecha argentina
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
              className="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              {/* Encabezado del Acordeón (Clickable) */}
              <button
                onClick={() => toggleExpandido(pedido.id)}
                className="w-full p-5 sm:p-6 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:bg-amber-50/40 transition-colors"
                aria-expanded={abierto}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-200 flex items-center justify-center text-amber-800 font-bold shrink-0">
                    <Receipt className="w-6 h-6 text-amber-700" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-display font-extrabold text-lg text-stone-900">
                        Pedido #{pedido.id}
                      </span>
                      {nuevoPedidoId === pedido.id && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-600 text-white">
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
                    <span className="font-display font-extrabold text-xl text-amber-950">
                      ${Number(pedido.total).toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div className="p-1.5 rounded-xl bg-stone-100 text-stone-600">
                    {abierto ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </button>

              {/* Cuerpo del Acordeón: Detalle de Ítems Congelados */}
              {abierto && (
                <div className="px-5 pb-6 pt-2 sm:px-6 border-t border-stone-100 bg-stone-50/50 space-y-4 animate-fade-in">
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
                          className="bg-white rounded-2xl p-3.5 border border-stone-200/80 flex items-center justify-between shadow-xs"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{emoji}</span>
                            <div>
                              <span className="font-semibold text-sm text-stone-900 block">
                                {nombreProd}
                              </span>
                              <span className="text-xs text-stone-500">
                                Cantidad: <strong>{item.cantidad} u.</strong> &times; ${precioUnitario.toLocaleString('es-AR')} (Precio congelado)
                              </span>
                            </div>
                          </div>

                          <span className="font-display font-bold text-sm sm:text-base text-amber-950">
                            ${subtotalItem.toLocaleString('es-AR')}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Acciones del Pedido & Marco Legal */}
                  <div className="pt-3 border-t border-stone-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="flex items-center space-x-1.5 text-stone-500">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Transacción registrada con protección al consumidor (Ley 24.240).</span>
                    </div>

                    <Link
                      to="/arrepentimiento"
                      className="inline-flex items-center space-x-1.5 text-rose-700 hover:text-rose-900 font-semibold transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                      <span>Botón de Arrepentimiento para este pedido</span>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
