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
  ShoppingBag,
  MapPin,
  Clock,
  Truck,
  Store,
  Coffee,
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
  const [pagina, setPagina] = useState(0); // 0-indexed

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

  const scrollToGrid = () => {
    document.getElementById('catalogo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-16 py-2"
    >
      {/* 1. SECCIÓN HERO (Inspirada en plantilla Wix) */}
      <section className="relative rounded-3xl overflow-hidden shadow-2xl min-h-[480px] sm:min-h-[540px] flex items-center justify-center border border-rose-900/20">
        {/* Imagen de fondo gourmet con overlay de alta elegancia */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105 transform transition-transform duration-1000"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#3B111E]/90 via-[#3B111E]/75 to-transparent" />

        {/* Contenido Hero */}
        <div className="relative z-10 w-full max-w-4xl px-6 sm:px-12 py-12 text-[#FAF8F5] space-y-6">
          <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#E85D88] block">
            Pastelería y café Est. 2024
          </span>

          <h1 className="font-serif font-bold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1]">
            Tu lugar para comer delicioso y tomar café
          </h1>

          <p className="text-sm sm:text-base text-rose-100/90 max-w-xl leading-relaxed font-sans">
            En Dulce Vicio creamos recetas artesanales únicas con ingredientes seleccionados de primera línea. Precios transparentes de contado, cuotas sin sorpresas y garantía legal.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={scrollToGrid}
              className="px-8 py-3.5 bg-[#E85D88] hover:bg-[#D81B60] text-white font-bold text-xs uppercase tracking-widest rounded-full shadow-lg shadow-[#E85D88]/30 transition-all hover:scale-105 active:scale-95"
            >
              Pedir ahora
            </button>
            <button
              onClick={scrollToGrid}
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-bold text-xs uppercase tracking-widest rounded-full backdrop-blur-md transition-all hover:scale-105 active:scale-95"
            >
              Nuestro menú
            </button>
          </div>
        </div>
      </section>

      {/* 2. DOS CUADROS FLOTANTES CENTRALES ESTILO BOUTIQUE */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 -mt-8 relative z-20">
        {/* Cuadro 1: Tu pedido a domicilio */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl p-8 border border-rose-200/80 shadow-warm flex items-start space-x-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#FFF1F5] text-[#E85D88] border border-[#E85D88]/30 flex items-center justify-center shrink-0">
            <Truck className="w-7 h-7 text-[#E85D88]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-xl text-[#3B111E]">
              Tu pedido a domicilio
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Envíos cuidados para conservar el sabor recién horneado de cada porción directamente en la puerta de tu casa.
            </p>
            <span className="inline-block text-[11px] font-bold text-[#E85D88] uppercase tracking-wider pt-1">
              Desayuno, merienda y repostería artesanal
            </span>
          </div>
        </motion.div>

        {/* Cuadro 2: Compra online / Recogida en tienda */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white rounded-3xl p-8 border border-rose-200/80 shadow-warm flex items-start space-x-5"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#FAF0F3] text-[#3B111E] border border-[#3B111E]/20 flex items-center justify-center shrink-0">
            <Store className="w-7 h-7 text-[#3B111E]" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-xl text-[#3B111E]">
              Compra online / Recogida en tienda
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-sans">
              Comprá en la web y retirá sin demoras por nuestra boutique boutique pastelera.
            </p>
            <div className="text-[11px] text-[#3B111E] font-semibold pt-1">
              Av. Fray A. Alcalde 10 | Lun - Vie: 9:00 - 18:00
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. SECCIÓN PRESENTACIÓN BOUTIQUE / QUIÉNES SOMOS */}
      <section id="nosotros" className="bg-white rounded-3xl p-8 sm:p-12 border border-rose-200/60 shadow-sm space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#E85D88]">
            Experiencia Dulce Vicio
          </span>
          <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#3B111E]">
            Repostería de autor elaborada a diario
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
            Cada receta combina técnicas tradicionales de pastelería con materias primas seleccionadas. Creemos en la transparencia absoluta de precios y en un servicio excepcional.
          </p>
        </div>

        {/* Bloques inspirados en la plantilla Wix (Come, Bebe, Disfruta) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3 p-6 rounded-2xl bg-[#FAF8F5] border border-rose-100/80">
            <h3 className="font-serif font-bold text-2xl text-[#3B111E]">Come.</h3>
            <p className="text-xs font-semibold text-[#E85D88]">Desayuno, comida y repostería artesanal</p>
            <p className="text-xs text-stone-600 leading-relaxed">
              Tiramisú, Brownies intensos, Chocotorta clásica argentina y tortas de elaboración propia horneadas en el día.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-2xl bg-[#FAF8F5] border border-rose-100/80">
            <h3 className="font-serif font-bold text-2xl text-[#3B111E]">Bebe.</h3>
            <p className="text-xs font-semibold text-[#E85D88]">La taza más fresca de la ciudad</p>
            <p className="text-xs text-stone-600 leading-relaxed">
              El maridaje perfecto para tus postres favoritos con cafés de especialidad e infusiones seleccionadas.
            </p>
          </div>

          <div className="space-y-3 p-6 rounded-2xl bg-[#FAF8F5] border border-rose-100/80">
            <h3 className="font-serif font-bold text-2xl text-[#3B111E]">Disfruta.</h3>
            <p className="text-xs font-semibold text-[#E85D88]">Siéntete como en casa</p>
            <p className="text-xs text-stone-600 leading-relaxed">
              Hacé tu pedido online con total tranquilidad y respaldo legal (Ley 24.240 y Ley 25.326).
            </p>
          </div>
        </div>
      </section>

      {/* 4. GRILLA DE PRODUCTOS DE DULCE VICIO */}
      <section id="catalogo" className="space-y-8">
        
        {/* Encabezado y Filtros */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-rose-200/80 pb-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#E85D88]">
              Nuestra Carta
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#3B111E]">
              Postres de Dulce Vicio
            </h2>
          </div>

          {/* Barra de Filtros */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            {/* Buscador */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar postre..."
                value={busqueda}
                onChange={handleBusquedaChange}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-rose-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#E85D88] text-[#3B111E]"
              />
            </div>

            {/* Precio Máximo */}
            <div className="relative w-full sm:w-48">
              <SlidersHorizontal className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                placeholder="Precio Max ($)"
                value={precioMax}
                onChange={handlePrecioMaxChange}
                min="0"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-rose-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-[#E85D88] text-[#3B111E]"
              />
            </div>

            {(busqueda || precioMax) && (
              <button
                onClick={limpiarFiltros}
                className="px-4 py-2.5 text-xs text-[#3B111E] bg-rose-100 hover:bg-rose-200 rounded-2xl font-bold transition-colors shrink-0"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Estado de Error */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-900 p-6 rounded-3xl flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-[#E85D88] shrink-0" />
              <p className="text-xs sm:text-sm font-medium">{error}</p>
            </div>
            <button
              onClick={() => setPagina(0)}
              className="px-4 py-2 bg-[#3B111E] text-white rounded-xl text-xs font-bold hover:bg-[#5C1B2E] flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>
          </div>
        )}

        {/* Renderizado de Tarjetas */}
        {cargando ? (
          <div className="min-h-[320px] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-9 h-9 text-[#E85D88] animate-spin" />
            <p className="text-xs font-semibold text-stone-600">Cargando especialidades de Dulce Vicio...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-rose-200/80 space-y-3 shadow-sm">
            <p className="text-5xl">🧁</p>
            <h3 className="font-serif font-bold text-xl text-[#3B111E]">No encontramos postres</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              No hay productos que coincidan con los filtros aplicados. Intentá con otro nombre o limpiá los filtros.
            </p>
            <button
              onClick={limpiarFiltros}
              className="mt-2 px-6 py-3 bg-[#3B111E] text-white rounded-xl text-xs font-bold hover:bg-[#E85D88] transition-colors shadow-sm"
            >
              Ver todos los postres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}

        {/* Paginación */}
        {!cargando && total > LIMITE_POR_PAGINA && (
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-rose-200/80 shadow-sm text-xs">
            <div className="text-stone-500">
              Mostrando <span className="font-bold text-[#3B111E]">{productos.length}</span> de <span className="font-bold text-[#3B111E]">{total}</span> postres
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagina((p) => Math.max(0, p - 1))}
                disabled={pagina === 0}
                className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-[#3B111E] hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <span className="font-semibold text-[#3B111E] px-2">
                Página {pagina + 1} de {totalPaginas}
              </span>

              <button
                onClick={() => setPagina((p) => (p + 1 < totalPaginas ? p + 1 : p))}
                disabled={pagina + 1 >= totalPaginas}
                className="px-3 py-1.5 rounded-xl border border-rose-200 text-xs font-bold text-[#3B111E] hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 5. SECCIÓN CONTACTO (Inspirada en Wix: Pásate a comer algo) */}
      <section id="contacto" className="bg-[#FAF0F3] rounded-3xl p-8 sm:p-12 border border-rose-200 text-center space-y-8">
        <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#3B111E]">
          Pásate a comer algo.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto text-xs text-stone-700">
          <div className="space-y-2 border-r-0 md:border-r border-rose-200/80 pr-0 md:pr-8">
            <h3 className="font-serif font-bold text-lg text-[#3B111E]">Dirección</h3>
            <p>Av. Fray A. Alcalde 10,</p>
            <p>44100 Buenos Aires, Arg.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-serif font-bold text-lg text-[#3B111E]">Horario laboral</h3>
            <p>Lun - Vie: 9:00 - 18:00</p>
            <p>Sábado: 10:00 - 14:00</p>
            <p className="text-stone-400">Domingo: cerrado</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
