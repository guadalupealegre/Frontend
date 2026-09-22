import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCarrito } from '../context/CarritoContext';
import { urlImagen } from '../utils/imagenes';
import { ShoppingBag, CreditCard, Shield, CheckCircle2, Sparkles, AlertCircle, Plus } from 'lucide-react';

const ICONOS_POSTRES = {
  'Tiramisú': { emoji: '☕🍰', badge: 'Especialidad Italiana', color: 'from-[#3B111E] via-[#4A1525] to-[#290B14]' },
  'Brownie': { emoji: '🍫✨', badge: 'Chocolate Puro Intenso', color: 'from-[#290B14] via-[#3B111E] to-[#4A1525]' },
  'Chocotorta': { emoji: '🍪🎂', badge: 'Clásico Argentino', color: 'from-[#4A1525] via-[#7A243D] to-[#3B111E]' },
  'Turrón de Quaker': { emoji: '🌾🍫', badge: 'Avena & Cacao Fino', color: 'from-[#5C1B2E] via-[#3B111E] to-[#290B14]' },
  'Budín de pan': { emoji: '🍮🍯', badge: 'Receta Tradicional', color: 'from-[#3B111E] via-[#4A1525] to-[#7A243D]' },
  'Flan': { emoji: '🍮✨', badge: 'Caramelo Artesanal', color: 'from-[#4A1525] via-[#5C1B2E] to-[#3B111E]' },
  'Cookie': { emoji: '🍪🍪', badge: 'Chips Artesanales', color: 'from-[#7A243D] via-[#3B111E] to-[#290B14]' },
  'Macarons de Frambuesa': { emoji: '🧁✨', badge: 'Repostería Francesa', color: 'from-[#4A1525] via-[#E85D88]/30 to-[#3B111E]' },
  'Medialunas Artesanales': { emoji: '🥐✨', badge: 'Panadería Fina', color: 'from-[#3B111E] via-[#5C1B2E] to-[#290B14]' },
  'Tarta de Frutillas': { emoji: '🍓🍰', badge: 'Frutas Frescas', color: 'from-[#5C1B2E] via-[#E85D88]/40 to-[#3B111E]' },
};

export default function ProductCard({ producto }) {
  const { agregar } = useCarrito();
  const [agregadoAnim, setAgregadoAnim] = useState(false);

  const {
    id,
    nombre,
    precio_final,
    cuotas_cantidad,
    cuotas_valor,
    garantia_meses,
    stock,
  } = producto;

  const infoVisual = ICONOS_POSTRES[nombre] || {
    emoji: '🧁✨',
    badge: 'Repostería Fina',
    color: 'from-[#3B111E] via-[#4A1525] to-[#290B14]',
  };

  const imgReal = urlImagen(producto);

  const handleAgregarAlCarrito = () => {
    if (stock <= 0) return;
    agregar(producto, 1);
    setAgregadoAnim(true);
    setTimeout(() => setAgregadoAnim(false), 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-3xl border border-[#3B111E]/10 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden flex flex-col justify-between group"
    >
      {/* 1. Header con Imagen Cuadrada Perfecta (aspect-square) */}
      <div className="relative aspect-square w-full bg-[#FAF8F5] overflow-hidden flex items-center justify-center">
        {imgReal ? (
          <img
            src={imgReal}
            alt={nombre}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          /* Recuadro / Placeholder de estética refinada */
          <div className={`w-full h-full bg-gradient-to-br ${infoVisual.color} flex items-center justify-center relative`}>
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="text-6xl sm:text-7xl group-hover:scale-110 duration-500 transition-transform drop-shadow-lg select-none">
              {infoVisual.emoji}
            </div>
          </div>
        )}
        
        {/* Badge de Especialidad */}
        <div className="absolute top-3.5 left-3.5 bg-[#3B111E]/75 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-[#FAF8F5] border border-white/20 flex items-center space-x-1.5 shadow-sm">
          <Sparkles className="w-3 h-3 text-[#E85D88]" />
          <span>{infoVisual.badge}</span>
        </div>

        {/* Badge de Stock */}
        <div className="absolute top-3.5 right-3.5">
          {stock > 0 ? (
            <span className="bg-emerald-950/80 backdrop-blur-md border border-emerald-400/40 text-emerald-200 text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm">
              Stock: {stock} u.
            </span>
          ) : (
            <span className="bg-rose-950/85 backdrop-blur-md border border-rose-500/40 text-rose-200 text-[11px] font-semibold px-3 py-1 rounded-full shadow-sm">
              Agotado
            </span>
          )}
        </div>

        {/* Tag de Precio */}
        <div className="absolute bottom-3.5 right-3.5 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-[#3B111E]/10 shadow-md transform group-hover:scale-105 transition-transform duration-300">
          <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider leading-none">Contado</span>
          <span className="font-serif font-extrabold text-lg text-[#3B111E] leading-tight">
            ${Number(precio_final).toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {/* 2. Cuerpo de la Card con Padding Generoso (p-6) */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div>
          <h3 className="font-serif font-bold text-xl text-[#3B111E] group-hover:text-[#E85D88] transition-colors tracking-wide">
            {nombre}
          </h3>
          <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
            Elaboración artesanal del día con ingredientes de primera calidad y receta gourmet.
          </p>
        </div>

        {/* Información de Cuotas y Garantía (Ley 24.240) */}
        <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#3B111E]/5 space-y-2">
          {/* Cuotas */}
          <div className="flex items-center space-x-2 text-xs text-[#3B111E] font-semibold tracking-wide">
            <CreditCard className="w-4 h-4 text-[#E85D88] shrink-0" />
            <span>
              {cuotas_cantidad === 1
                ? `1 pago de $${Number(cuotas_valor).toLocaleString('es-AR')}`
                : `${cuotas_cantidad} cuotas de $${Number(cuotas_valor).toLocaleString('es-AR')}`}
            </span>
          </div>

          {/* Garantía */}
          <div className="flex items-center space-x-2 text-[11px] text-stone-500 pt-1.5 border-t border-[#3B111E]/5">
            <Shield className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>
              Garantía legal: {garantia_meses} meses (Perecedero artesanal)
            </span>
          </div>
        </div>

        {/* 3. Botón de Compra Redondeado Tipo Píldora (rounded-full) */}
        <button
          onClick={handleAgregarAlCarrito}
          disabled={stock <= 0}
          className={`w-full py-3.5 px-6 rounded-full font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all duration-300 active:scale-95 shadow-md ${
            stock <= 0
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300 shadow-none'
              : agregadoAnim
              ? 'bg-emerald-600 text-white shadow-emerald-500/30'
              : 'bg-[#3B111E] hover:bg-[#E85D88] text-white shadow-[#3B111E]/15 hover:shadow-lg'
          }`}
        >
          {stock <= 0 ? (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>Sin Stock</span>
            </>
          ) : agregadoAnim ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-white animate-bounce" />
              <span>¡Agregado al carrito!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Agregar al carrito</span>
              <Plus className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </>
          )}
        </button>
      </div>

    </motion.div>
  );
}
