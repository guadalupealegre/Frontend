import React, { useState } from 'react';
import { useCarrito } from '../context/CarritoContext';
import { ShoppingBag, CreditCard, Shield, CheckCircle2, Sparkles, AlertCircle, Plus } from 'lucide-react';

// Temas y badges para los postres emblemáticos de Dulce Vicio
const ICONOS_POSTRES = {
  'Tiramisú': { emoji: '☕🍰', badge: 'Especialidad Italiana', color: 'from-amber-700 via-amber-800 to-yellow-950' },
  'Brownie': { emoji: '🍫✨', badge: 'Chocolate Puro Intenso', color: 'from-stone-900 via-amber-950 to-stone-950' },
  'Chocotorta': { emoji: '🍪🎂', badge: 'Clásico Argentino', color: 'from-amber-900 via-orange-950 to-amber-950' },
  'Turrón de Quaker': { emoji: '🌾🍫', badge: 'Avena & Cacao Fino', color: 'from-amber-800 via-yellow-900 to-amber-950' },
  'Budín de pan': { emoji: '🍮🍯', badge: 'Receta Tradicional', color: 'from-amber-600 via-orange-800 to-yellow-900' },
  'Flan': { emoji: '🍮✨', badge: 'Caramelo Artesanal', color: 'from-yellow-600 via-amber-700 to-orange-900' },
  'Cookie': { emoji: '🍪🍪', badge: 'Chips Artesanales', color: 'from-orange-700 via-amber-800 to-stone-900' },
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
    color: 'from-amber-700 via-orange-800 to-stone-900',
  };

  const handleAgregarAlCarrito = () => {
    if (stock <= 0) return;
    agregar(producto, 1);
    setAgregadoAnim(true);
    setTimeout(() => setAgregadoAnim(false), 1800);
  };

  return (
    <div className="card-gourmet bg-white rounded-3xl border border-amber-100/90 shadow-lg hover:shadow-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 transform hover:-translate-y-1.5">
      
      {/* Cabecera / Ilustración con Zoom Fluido */}
      <div className={`relative h-48 bg-gradient-to-br ${infoVisual.color} flex items-center justify-center overflow-hidden`}>
        {/* Patrón de puntos decorativos */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        {/* Badge superior de especialidad */}
        <div className="absolute top-3.5 left-3.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-amber-200 border border-white/10 flex items-center space-x-1.5 shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{infoVisual.badge}</span>
        </div>

        {/* Badge de Stock con Glassmorphism */}
        <div className="absolute top-3.5 right-3.5">
          {stock > 0 ? (
            <span className="bg-emerald-950/75 backdrop-blur-md border border-emerald-400/40 text-emerald-200 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
              Stock: {stock} u.
            </span>
          ) : (
            <span className="bg-rose-950/85 backdrop-blur-md border border-rose-500/40 text-rose-200 text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-sm">
              Agotado
            </span>
          )}
        </div>

        {/* Píldora Flotante de Precio con Animación */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-1 rounded-2xl border border-amber-200/80 shadow-md transform group-hover:scale-105 transition-transform duration-300">
          <span className="text-[10px] text-stone-500 block uppercase font-bold tracking-wider leading-none">Contado</span>
          <span className="font-display font-extrabold text-lg text-amber-950 leading-tight">
            ${precio_final.toLocaleString('es-AR')}
          </span>
        </div>

        {/* Emoji Central con Zoom Fluido (duration-500) */}
        <div className="text-6xl sm:text-7xl group-hover:scale-110 duration-500 transition-transform drop-shadow-lg select-none">
          {infoVisual.emoji}
        </div>
      </div>

      {/* Cuerpo de la Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-display font-bold text-xl text-stone-900 group-hover:text-amber-800 transition-colors">
            {nombre}
          </h3>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            Elaboración del día con ingredientes seleccionados y receta de alta pastelería.
          </p>
        </div>

        {/* Cuadro de Precios y Financiación (Ley 24.240) */}
        <div className="bg-amber-50/70 rounded-2xl p-3.5 border border-amber-200/70 space-y-2">
          {/* Información de Cuotas */}
          <div className="flex items-center space-x-1.5 text-xs text-amber-900 font-medium">
            <CreditCard className="w-4 h-4 text-orange-600 shrink-0" />
            <span>
              {cuotas_cantidad === 1
                ? `1 pago de $${cuotas_valor.toLocaleString('es-AR')}`
                : `${cuotas_cantidad} cuotas de $${cuotas_valor.toLocaleString('es-AR')}`}
            </span>
          </div>

          {/* Información Legal de Garantía */}
          <div className="flex items-center space-x-1.5 text-[11px] text-stone-500 pt-1 border-t border-amber-200/50">
            <Shield className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>
              Garantía: {garantia_meses} meses (Consumo directo perecedero)
            </span>
          </div>
        </div>

        {/* Botón de Acción Interactivo */}
        <button
          onClick={handleAgregarAlCarrito}
          disabled={stock <= 0}
          className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition-all duration-300 active:scale-95 shadow-md ${
            stock <= 0
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300 shadow-none'
              : agregadoAnim
              ? 'bg-emerald-600 text-white shadow-emerald-500/30'
              : 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/25 hover:shadow-lg'
          }`}
        >
          {stock <= 0 ? (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>Sin Stock</span>
            </>
          ) : agregadoAnim ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-100 animate-bounce" />
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

    </div>
  );
}
