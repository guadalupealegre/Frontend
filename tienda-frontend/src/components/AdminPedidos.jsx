import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getAdminPedidos, actualizarEstadoPedido } from '../services/api';
import {
  ShoppingBag,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Loader2,
  User,
  Mail,
  DollarSign,
  Package,
  Calendar,
  Check,
  X,
  Sparkles,
  Layers,
} from 'lucide-react';

const ESTADOS_OPCIONES = [
  { value: 'pendiente', label: 'Pendiente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'confirmado', label: 'Confirmado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'en preparación', label: 'En Preparación', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'listo para entrega', label: 'Listo para Entrega', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'entregado', label: 'Entregado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { value: 'revocado', label: 'Revocado', color: 'bg-rose-100 text-rose-800 border-rose-200' },
];

export default function AdminPedidos() {
  const { token } = useAuth();

  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  // Filtros y Búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // Estado para filas desplegadas
  const [filaExpandida, setFilaExpandida] = useState(null);

  // Estado de actualización por id de pedido { [pedidoId]: boolean }
  const [actualizandoId, setActualizandoId] = useState({});

  const cargarPedidos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getAdminPedidos(token);
      setPedidos(data || []);
    } catch (err) {
      console.error('Error al cargar pedidos admin:', err);
      setError(err.message || 'No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, [token]);

  const handleCambiarEstado = async (pedidoId, nuevoEstado) => {
    setActualizandoId((prev) => ({ ...prev, [pedidoId]: true }));
    setError(null);
    setMensajeExito(null);

    try {
      const pedidoActualizado = await actualizarEstadoPedido(pedidoId, nuevoEstado, token);

      // Actualizar en el estado local
      setPedidos((prev) =>
        prev.map((p) => (p.id === pedidoId ? { ...p, estado: pedidoActualizado.estado } : p))
      );

      setMensajeExito(`El estado del pedido #${pedidoId} fue actualizado a "${nuevoEstado}".`);
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError(err.message || 'No se pudo actualizar el estado del pedido.');
    } finally {
      setActualizandoId((prev) => ({ ...prev, [pedidoId]: false }));
    }
  };

  const toggleExpandir = (id) => {
    setFilaExpandida((prev) => (prev === id ? null : id));
  };

  // Helper para badge de estado
  const renderBadgeEstado = (estado) => {
    const estadoLower = (estado || '').toLowerCase().strip ? estado.toLowerCase().strip() : (estado || '').toLowerCase();
    
    if (['confirmado', 'pagado', 'entregado'].includes(estadoLower)) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200/80 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
          <span className="capitalize">{estado}</span>
        </span>
      );
    }

    if (['cancelado', 'revocado'].includes(estadoLower)) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200/80 shadow-xs">
          <XCircle className="w-3.5 h-3.5 mr-1 text-[#E85D88]" />
          <span className="capitalize">{estado}</span>
        </span>
      );
    }

    // Default: pendiente, en preparación, listo para entrega
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200/80 shadow-xs">
        <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
        <span className="capitalize">{estado}</span>
      </span>
    );
  };

  // Formateador de fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    try {
      const date = new Date(fechaStr);
      return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return fechaStr;
    }
  };

  // Filtrado de pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    // Filtro por estado
    if (filtroEstado !== 'todos') {
      const estadoNorm = p.estado ? p.estado.toLowerCase() : '';
      if (filtroEstado === 'cancelados' && !['cancelado', 'revocado'].includes(estadoNorm)) return false;
      if (filtroEstado === 'confirmados' && !['confirmado', 'pagado', 'entregado'].includes(estadoNorm)) return false;
      if (filtroEstado === 'en_preparacion' && !['pendiente', 'en preparación', 'listo para entrega'].includes(estadoNorm)) return false;
    }

    // Búsqueda por ID, cliente o email
    if (busqueda.trim() !== '') {
      const q = busqueda.toLowerCase().trim();
      const idMatch = p.id.toString().includes(q);
      const clienteNombre = p.usuario && p.usuario.nombre ? p.usuario.nombre.toLowerCase() : '';
      const clienteEmail = p.usuario && p.usuario.email ? p.usuario.email.toLowerCase() : '';
      const matchCliente = clienteNombre.includes(q) || clienteEmail.includes(q);

      return idMatch || matchCliente;
    }

    return true;
  });

  // Cálculo de KPIs
  const totalFacturado = pedidos
    .filter((p) => !['cancelado', 'revocado'].includes(p.estado.toLowerCase()))
    .reduce((acc, p) => acc + (p.monto_total || p.total || 0), 0);

  const pendientesCount = pedidos.filter((p) =>
    ['pendiente', 'en preparación', 'listo para entrega'].includes(p.estado.toLowerCase())
  ).length;

  const entregadosCount = pedidos.filter((p) =>
    ['confirmado', 'entregado', 'pagado'].includes(p.estado.toLowerCase())
  ).length;

  return (
    <div className="space-y-6">
      {/* 1. CARDS RESUMEN / KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Pedidos */}
        <div className="bg-white rounded-3xl p-5 border border-rose-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-stone-400 block">
              Total Pedidos
            </span>
            <span className="text-3xl font-serif font-bold text-[#3B111E] block mt-1">
              {pedidos.length}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FFF1F5] text-[#E85D88] flex items-center justify-center border border-rose-200">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 2: Facturación Total */}
        <div className="bg-white rounded-3xl p-5 border border-rose-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-stone-400 block">
              Monto Acumulado
            </span>
            <span className="text-2xl font-bold text-[#E85D88] block mt-1">
              ${totalFacturado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 3: Pendientes / En preparación */}
        <div className="bg-white rounded-3xl p-5 border border-rose-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-stone-400 block">
              En Curso / Pendientes
            </span>
            <span className="text-3xl font-serif font-bold text-amber-600 block mt-1">
              {pendientesCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* KPI 4: Entregados / Confirmados */}
        <div className="bg-white rounded-3xl p-5 border border-rose-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-stone-400 block">
              Completados / Entregados
            </span>
            <span className="text-3xl font-serif font-bold text-emerald-700 block mt-1">
              {entregadosCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. ALERTAS */}
      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-[#E85D88] shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3. BARRA DE FILTROS & BÚSQUEDA */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-rose-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Buscador */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Buscar por cliente, email o # de pedido..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-rose-200/80 rounded-2xl text-xs text-[#3B111E] placeholder-stone-400 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#E85D88]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Tabs de Filtro de Estado */}
        <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setFiltroEstado('todos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filtroEstado === 'todos'
                ? 'bg-[#3B111E] text-white shadow-sm'
                : 'bg-[#FAF8F5] text-stone-600 hover:bg-rose-50'
            }`}
          >
            Todos ({pedidos.length})
          </button>
          <button
            onClick={() => setFiltroEstado('en_preparacion')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filtroEstado === 'en_preparacion'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[#FAF8F5] text-stone-600 hover:bg-amber-50'
            }`}
          >
            Pendientes / En Curso
          </button>
          <button
            onClick={() => setFiltroEstado('confirmados')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filtroEstado === 'confirmados'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#FAF8F5] text-stone-600 hover:bg-emerald-50'
            }`}
          >
            Confirmados
          </button>
          <button
            onClick={() => setFiltroEstado('cancelados')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filtroEstado === 'cancelados'
                ? 'bg-[#E85D88] text-white shadow-sm'
                : 'bg-[#FAF8F5] text-stone-600 hover:bg-rose-50'
            }`}
          >
            Cancelados / Revocados
          </button>
        </div>
      </div>

      {/* 4. TABLA PRINCIPAL DE PEDIDOS */}
      <div className="bg-white rounded-3xl border border-rose-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-[#FAF8F5] border-b border-rose-200/80 text-[#3B111E] text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6"># Pedido / Fecha</th>
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6">Resumen de Productos</th>
                <th className="py-4 px-6">Monto Total</th>
                <th className="py-4 px-6">Estado Actual</th>
                <th className="py-4 px-6 text-right">Actualizar Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100">
              {cargando ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-500">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#E85D88] mb-2" />
                    Cargando gestión de pedidos...
                  </td>
                </tr>
              ) : pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-stone-500">
                    No se encontraron pedidos con el criterio seleccionado.
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map((pedido) => {
                  const estaExpandido = filaExpandida === pedido.id;
                  const estaActualizando = actualizandoId[pedido.id];
                  const itemsDetalles = pedido.detalles || pedido.items || [];
                  const totalCantidad = itemsDetalles.reduce((acc, it) => acc + (it.cantidad || 1), 0);
                  const montoFinal = pedido.monto_total ?? pedido.total ?? 0;

                  return (
                    <React.Fragment key={pedido.id}>
                      <tr className={`hover:bg-[#FFF1F5]/40 transition-colors ${estaExpandido ? 'bg-[#FFF1F5]/30' : ''}`}>
                        {/* 1. # Pedido & Fecha */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-[#3B111E] bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl text-xs">
                              #{pedido.id}
                            </span>
                          </div>
                          <span className="text-[11px] text-stone-400 block mt-1">
                            {formatearFecha(pedido.fecha || pedido.fecha_creacion)}
                          </span>
                        </td>

                        {/* 2. Cliente */}
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#3B111E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {pedido.usuario && pedido.usuario.nombre
                                ? pedido.usuario.nombre.charAt(0).toUpperCase()
                                : 'C'}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-[#3B111E] text-xs block truncate">
                                {pedido.usuario ? pedido.usuario.nombre : 'Cliente Desconocido'}
                              </span>
                              <span className="text-[11px] text-stone-400 block truncate">
                                {pedido.usuario ? pedido.usuario.email : 'Sin email'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 3. Resumen de Productos (con Toggle Expandible) */}
                        <td className="py-4 px-6">
                          <button
                            onClick={() => toggleExpandir(pedido.id)}
                            className="flex items-center space-x-2 bg-[#FAF8F5] hover:bg-rose-100/60 border border-rose-200/80 px-3 py-1.5 rounded-xl transition-all text-xs text-stone-700 font-medium group"
                          >
                            <Package className="w-3.5 h-3.5 text-[#E85D88]" />
                            <span>
                              {totalCantidad} item(s) (
                              {itemsDetalles.length} producto{itemsDetalles.length > 1 ? 's' : ''})
                            </span>
                            {estaExpandido ? (
                              <ChevronUp className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#3B111E]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#3B111E]" />
                            )}
                          </button>
                          
                          {/* Resumen rápido visible inline */}
                          <div className="text-[11px] text-stone-500 mt-1 max-w-[220px] truncate">
                            {itemsDetalles.map((it) => `${it.cantidad}x ${it.producto_nombre || (it.producto && it.producto.nombre) || 'Producto'}`).join(', ')}
                          </div>
                        </td>

                        {/* 4. Total */}
                        <td className="py-4 px-6 font-serif font-bold text-base text-[#E85D88]">
                          ${Number(montoFinal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </td>

                        {/* 5. Estado Actual */}
                        <td className="py-4 px-6">
                          {renderBadgeEstado(pedido.estado)}
                        </td>

                        {/* 6. Acciones (Selector de Estado Interactive) */}
                        <td className="py-4 px-6 text-right">
                          <div className="relative inline-block text-left">
                            {estaActualizando ? (
                              <div className="flex items-center justify-end space-x-1 py-1 px-3 text-xs text-[#E85D88]">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Guardando...</span>
                              </div>
                            ) : (
                              <select
                                value={(pedido.estado || '').toLowerCase()}
                                onChange={(e) => handleCambiarEstado(pedido.id, e.target.value)}
                                className="bg-[#FAF8F5] border border-rose-200 hover:border-[#E85D88] text-xs font-semibold text-[#3B111E] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#E85D88] cursor-pointer transition-colors"
                              >
                                {ESTADOS_OPCIONES.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    Cambiar a: {opt.label}
                                  </option>
                                ))}
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* FILA DESPLEGABLE CON DETALLE COMPLETO DEL PEDIDO */}
                      <AnimatePresence>
                        {estaExpandido && (
                          <tr className="bg-[#FAF8F5]/80">
                            <td colSpan="6" className="p-6 border-y border-rose-200/60">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4"
                              >
                                <div className="flex items-center justify-between border-b border-rose-200/50 pb-3">
                                  <div className="flex items-center space-x-2">
                                    <Sparkles className="w-4 h-4 text-[#E85D88]" />
                                    <h4 className="font-serif font-bold text-sm text-[#3B111E]">
                                      Desglose de Productos - Pedido #{pedido.id}
                                    </h4>
                                  </div>
                                  <span className="text-xs text-stone-500">
                                    Cliente: <strong>{pedido.usuario?.nombre}</strong> ({pedido.usuario?.email})
                                  </span>
                                </div>

                                {/* Tabla Interna de Ítems */}
                                <div className="bg-white rounded-2xl border border-rose-200/60 overflow-hidden">
                                  <table className="w-full text-xs text-stone-700">
                                    <thead className="bg-[#FFF1F5] text-[#3B111E] font-bold">
                                      <tr>
                                        <th className="py-2.5 px-4 text-left">Producto</th>
                                        <th className="py-2.5 px-4 text-center">Cantidad</th>
                                        <th className="py-2.5 px-4 text-right">Precio Unitario</th>
                                        <th className="py-2.5 px-4 text-right">Subtotal</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-rose-100">
                                      {itemsDetalles.map((item, idx) => {
                                        const nomProd = item.producto_nombre || (item.producto && item.producto.nombre) || `Producto #${item.producto_id}`;
                                        const pu = Number(item.precio_unitario || 0);
                                        const cant = Number(item.cantidad || 1);
                                        const sub = pu * cant;

                                        return (
                                          <tr key={item.id || idx} className="hover:bg-rose-50/50">
                                            <td className="py-3 px-4 font-semibold text-[#3B111E]">
                                              {nomProd}
                                            </td>
                                            <td className="py-3 px-4 text-center font-bold text-stone-600">
                                              {cant} u.
                                            </td>
                                            <td className="py-3 px-4 text-right text-stone-500">
                                              ${pu.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-[#E85D88]">
                                              ${sub.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                    <tfoot className="bg-[#FAF8F5] border-t border-rose-200/80 font-bold text-[#3B111E]">
                                      <tr>
                                        <td colSpan="3" className="py-3 px-4 text-right uppercase text-[11px] tracking-wider">
                                          Total Acumulado del Pedido:
                                        </td>
                                        <td className="py-3 px-4 text-right text-sm text-[#E85D88]">
                                          ${Number(montoFinal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  </table>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
