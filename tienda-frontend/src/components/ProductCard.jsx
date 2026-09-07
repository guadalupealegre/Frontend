import React, { useState } from 'react';
import { ShoppingBag, CreditCard, Shield, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react';

// Colores y emojis temáticos para cada postre de Dulce Vicio
const ICONOS_POSTRES = {
  'Tiramisú': { emoji: '☕🍰', badge: 'Especialidad Italiana', color: 'from-amber-700 to-yellow-900' },
  'Brownie': { emoji: '🍫✨', badge: 'Chocolate Puro', color: 'from-stone-800 to-amber-950' },
  'Chocotorta': { emoji: '🍪🎂', badge: 'Clásico Argentino', color: 'from-amber-900 to-orange-950' },
  'Turrón de Quaker': { emoji: '🌾🍫', badge: 'Avena & Cacao', color: 'from-amber-800 to-yellow-950' },
  'Budín de pan': { emoji: '🍮🍯', badge: 'Receta Tradicional', color: 'from-amber-600 to-orange-800' },
  'Flan': { emoji: '🍮✨', badge: 'Con Caramelo', color: 'from-yellow-600 to-amber-700' },
  'Cookie': { emoji: '🍪🍪', badge: 'Chips Artesanales', color: 'from-orange-700 to-amber-800' },
};

export default function ProductCard({ producto }) {
  const [agregado, setAgregado] = useState(false);

  const {
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
    color: 'from-amber-700 to-orange-900',
  };

  const handleComprar = () => {
    if (stock <= 0) return;
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  return (
    <div className="card-gourmet bg-white rounded-3xl border border-amber-100/80 shadow-md hover:shadow-warm-hover overflow-hidden flex flex-col justify-between group transition-all duration-300">
      
      {/* Cabecera / Ilustración del Postre */}
      <div className={`relative h-44 bg-gradient-to-br ${infoVisual.color} flex items-center justify-center overflow-hidden`}>
        {/* Efecto decorativo de fondo */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Badge superior */}
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-medium text-amber-200 border border-white/10 flex items-center space-x-1">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{infoVisual.badge}</span>
        </div>

        {/* Badge de Stock */}
        <div className="absolute top-3 right-3">
          {stock > 0 ? (
            <span className="bg-emerald-950/70 backdrop-blur-md border border-emerald-500/40 text-emerald-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
              Stock: {stock} u.
            </span>
          ) : (
            <span className="bg-rose-950/80 backdrop-blur-md border border-rose-500/40 text-rose-200 text-[11px] font-semibold px-2.5 py-1 rounded-full">
              Agotado
            </span>
          )}
        </div>

        {/* Emoji Central Grande */}
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300 drop-shadow-md select-none">
          {infoVisual.emoji}
        </div>
      </div>

      {/* Cuerpo de la Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-display font-bold text-xl text-stone-900 group-hover:text-amber-700 transition-colors">
            {nombre}
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Elaboración del día con materia prima seleccionada de primera calidad.
          </p>
        </div>

        {/* Cuadro de Precios y Financiación (Ley 24.240) */}
        <div className="bg-amber-50/60 rounded-2xl p-3.5 border border-amber-200/60 space-y-2">
          {/* Precio Final de Contado */}
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-stone-600 font-medium">Precio Final:</span>
            <span className="font-display font-extrabold text-2xl text-amber-900 tracking-tight">
              ${precio_final.toLocaleString('es-AR')}
            </span>
          </div>

          {/* Información de Cuotas */}
          <div className="flex items-center space-x-1.5 text-xs text-amber-800/90 pt-1 border-t border-amber-200/50">
            <CreditCard className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span className="font-medium">
              {cuotas_cantidad === 1
                ? `1 pago de $${cuotas_valor.toLocaleString('es-AR')}`
                : `${cuotas_cantidad} cuotas de $${cuotas_valor.toLocaleString('es-AR')}`}
            </span>
          </div>

          {/* Información Legal de Garantía (Ley 24.240) */}
          <div className="flex items-center space-x-1.5 text-[11px] text-stone-500">
            <Shield className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>
              Garantía: {garantia_meses} meses (Consumo directo perecedero)
            </span>
          </div>
        </div>

        {/* Botón de Acción */}
        <button
          onClick={handleComprar}
          disabled={stock <= 0}
          className={`w-full py-3 px-4 rounded-2xl font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-200 shadow-sm ${
            stock <= 0
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
              : agregado
              ? 'bg-emerald-600 text-white shadow-emerald-500/20'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-orange-500/20 hover:shadow-md'
          }`}
        >
          {stock <= 0 ? (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>Sin Stock</span>
            </>
          ) : agregado ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-100" />
              <span>¡Agregado al pedido!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Pedir Ahora</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
