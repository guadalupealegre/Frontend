import React from 'react';
import { useCarrito } from '../context/CarritoContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removerToast } = useCarrito();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let Icono = CheckCircle2;
        let colorClases = 'bg-[#2c1810] text-amber-50 border-amber-500/40 shadow-warm-hover';
        let iconoClase = 'text-emerald-400';

        if (toast.tipo === 'warning') {
          Icono = AlertTriangle;
          colorClases = 'bg-amber-950 text-amber-100 border-amber-500/60 shadow-warm-hover';
          iconoClase = 'text-amber-400';
        } else if (toast.tipo === 'error') {
          Icono = AlertCircle;
          colorClases = 'bg-rose-950 text-rose-100 border-rose-500/60 shadow-lg';
          iconoClase = 'text-rose-400';
        } else if (toast.tipo === 'info') {
          Icono = Info;
          colorClases = 'bg-stone-900 text-stone-100 border-stone-600/50 shadow-md';
          iconoClase = 'text-sky-400';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 shadow-xl ${colorClases} animate-fade-in`}
          >
            <div className="flex items-center space-x-3 pr-2">
              <Icono className={`w-5 h-5 shrink-0 ${iconoClase}`} />
              <p className="text-xs sm:text-sm font-medium leading-snug">{toast.mensaje}</p>
            </div>
            <button
              onClick={() => removerToast(toast.id)}
              className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
