import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getProductos } from '../services/api';
import ProductCard from '../components/ProductCard';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Loader2,
  AlertCircle,
  RefreshCw,
  Heart,
} from 'lucide-react';

const LIMITE_POR_PAGINA = 6;

export default function Catalogo() {
  const [productos, setProductos] = useState([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados de filtros y paginación
  const [busqueda, setBusqueda] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [pagina, setPagina] = useState(0); // 0-indexed para skip

  useEffect(() => {
    let cancelado = false;

    async function cargarCatalogo() {
      setCargando(true);
      setError(null);
      try {
        const respuesta = await getProductos({
          skip: pagina * LIMITE_POR_PAGINA,
          limit: LIMITE_POR_PAGINA,
          nombre: busqueda,
          precio_max: precioMax ? Number(precioMax) : null,
        });

        if (!cancelado) {
          setProductos(respuesta.items || []);
          setTotal(respuesta.total || 0);
        }
      } catch (err) {
        if (!cancelado) {
          setError(err.message || 'Error al conectar con el servidor.');
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    cargarCatalogo();

    return () => {
      cancelado = true;
    };
  }, [pagina, busqueda, precioMax]);

  const handleBusquedaChange = (e) => {
    setBusqueda(e.target.value);
    setPagina(0);
  };

  const handlePrecioMaxChange = (e) => {
    setPrecioMax(e.target.value);
    setPagina(0);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setPrecioMax('');
    setPagina(0);
  };

  const totalPaginas = Math.ceil(total / LIMITE_POR_PAGINA) || 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-10 py-2"
    >
      {/* Hero Banner Dulce Vicio */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#28130a] via-[#3d1d11] to-[#200f07] text-amber-50 p-8 md:p-12 shadow-warm border border-rose-950/60">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 bg-rose-500/20 border border-rose-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-200">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Repostería Fina Artesanal</span>
          </div>
          
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white leading-tight">
            El sabor de lo auténtico en cada porción.
          </h1>
          
          <p className="text-sm sm:text-base text-rose-100/80 leading-relaxed">
            Descubrí nuestros postres recién horneados elaborados con ingredientes de primera línea. Transparencia total de precios de contado, opciones de cuotas y cumplimiento legal garantizado.
          </p>

          {/* Badges de Confianza Legal */}
          <div className="pt-2 flex flex-wrap gap-3 text-xs text-rose-100/90 font-medium">
            <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Precios Claros (Ley 24.240)</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>Botón de Arrepentimiento (Res. 424/2020)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de Búsqueda y Filtros */}
      <section className="bg-white p-5 rounded-3xl border border-rose-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Buscador por Nombre */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar postre (ej: Tiramisú, Brownie)..."
            value={busqueda}
            onChange={handleBusquedaChange}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-400 text-stone-800"
          />
        </div>

        {/* Filtro por Precio Máximo */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <SlidersHorizontal className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              placeholder="Precio Máximo ($)"
              value={precioMax}
              onChange={handlePrecioMaxChange}
              min="0"
              className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 focus:border-rose-400 text-stone-800"
            />
          </div>

          {(busqueda || precioMax) && (
            <button
              onClick={limpiarFiltros}
              className="px-3.5 py-2.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-2xl font-medium transition-colors"
            >
              Limpiar
            </button>
          )}
        </div>
      </section>

      {/* Estado de Error */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-5 rounded-3xl flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
          <button
            onClick={() => setPagina(0)}
            className="px-3.5 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 flex items-center space-x-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* Grid de Productos */}
      {cargando ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
          <p className="text-sm font-medium text-stone-600">Cargando delicias de Dulce Vicio...</p>
        </div>
      ) : productos.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 space-y-3">
          <p className="text-4xl">🧁</p>
          <h3 className="font-display font-bold text-lg text-stone-800">No encontramos postres</h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            No hay especialidades que coincidan con los filtros aplicados. Intentá con otro nombre o limpiá los filtros.
          </p>
          <button
            onClick={limpiarFiltros}
            className="mt-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
          >
            Ver todos los postres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {productos.map((producto) => (
            <ProductCard key={producto.id} producto={producto} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {!cargando && total > LIMITE_POR_PAGINA && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-rose-100 shadow-sm text-sm">
          <div className="text-xs text-stone-500">
            Mostrando <span className="font-semibold text-stone-800">{productos.length}</span> de <span className="font-semibold text-stone-800">{total}</span> postres
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagina((p) => Math.max(0, p - 1))}
              disabled={pagina === 0}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <span className="text-xs font-semibold text-stone-800 px-2">
              Página {pagina + 1} de {totalPaginas}
            </span>

            <button
              onClick={() => setPagina((p) => (p + 1 < totalPaginas ? p + 1 : p))}
              disabled={pagina + 1 >= totalPaginas}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
