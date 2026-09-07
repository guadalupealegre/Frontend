import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  RotateCcw,
  Scale,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Send,
  HelpCircle,
} from 'lucide-react';

export default function Arrepentimiento() {
  const [form, setForm] = useState({
    numeroPedido: '',
    email: '',
    motivo: '',
    telefono: '',
  });

  const [codigoTramite, setCodigoTramite] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setEnviando(true);

    // Simulación del procesamiento inmediato y generación de código legal único
    setTimeout(() => {
      const codigo = `REV-${Math.floor(100000 + Math.random() * 900000)}`;
      setCodigoTramite(codigo);
      setEnviando(false);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
      
      {/* Banner Legal */}
      <div className="bg-rose-50 border border-rose-200/80 rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center space-x-3 text-rose-800">
          <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-sm">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-rose-950">
              Botón de Arrepentimiento
            </h1>
            <p className="text-xs text-rose-800/80 font-medium">
              Resolución 424/2020 - Secretaría de Comercio Interior & Ley N° 24.240
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-rose-900/90 leading-relaxed pt-2">
          De acuerdo con la legislación argentina, en las compras celebradas fuera de los establecimientos comerciales o a distancia (comercio electrónico), tenés derecho a revocar la aceptación dentro del plazo de <strong className="text-rose-950 font-bold">diez (10) días corridos</strong> contados a partir de la entrega del producto o de la celebración del contrato, sin cargo ni costo alguno.
        </p>
      </div>

      {/* Resultado de Código de Trámite */}
      {codigoTramite ? (
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-warm space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-stone-900">
              Solicitud de Revocación Registrada
            </h2>
            <p className="text-xs text-stone-600 max-w-md mx-auto">
              Hemos generado el comprobante de revocación de compra conforme a la Resolución 424/2020.
            </p>
          </div>

          <div className="p-5 bg-stone-50 rounded-2xl border border-dashed border-stone-300 max-w-md mx-auto space-y-2">
            <span className="text-xs text-stone-500 uppercase tracking-wider font-semibold block">
              Código de Identificación de Trámite:
            </span>
            <span className="font-mono font-extrabold text-2xl text-orange-600 tracking-wider block">
              {codigoTramite}
            </span>
            <p className="text-[11px] text-stone-500">
              Guardá este código como constancia legal de tu solicitud.
            </p>
          </div>

          <div className="text-xs text-stone-600 max-w-lg mx-auto leading-relaxed text-left bg-amber-50 p-4 rounded-2xl border border-amber-200">
            <p className="font-semibold text-amber-900 mb-1">Próximos pasos:</p>
            <ul className="list-disc list-inside space-y-1 text-stone-700">
              <li>Nos comunicaremos al correo <strong>{form.email}</strong> dentro de las 24 horas hábiles.</li>
              <li>Si el postre no fue despachado, el reembolso se procesará de forma inmediata por el mismo medio de pago.</li>
            </ul>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-stone-900 text-white text-xs font-semibold rounded-2xl hover:bg-stone-800 transition-colors"
            >
              Volver a la Tienda
            </Link>
          </div>
        </div>
      ) : (
        /* Formulario de Solicitud */
        <div className="bg-white rounded-3xl border border-amber-100 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="font-display font-bold text-lg text-stone-900">
              Completá los datos para solicitar la revocación
            </h2>
            <p className="text-xs text-stone-500">
              Se generará un número de identificación de trámite de forma automática e inmediata.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="numeroPedido">
                  Número de Pedido o Factura *
                </label>
                <input
                  id="numeroPedido"
                  type="text"
                  name="numeroPedido"
                  required
                  placeholder="Ej: PED-1024 o N° 0001-000123"
                  value={form.numeroPedido}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="email">
                  Correo Electrónico de la Compra *
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  placeholder="correo@ejemplo.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="telefono">
                Teléfono de Contacto (Opcional)
              </label>
              <input
                id="telefono"
                type="tel"
                name="telefono"
                placeholder="Ej: 11 2345 6789"
                value={form.telefono}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1" htmlFor="motivo">
                Motivo o Detalle de la Revocación (Opcional)
              </label>
              <textarea
                id="motivo"
                name="motivo"
                rows="3"
                placeholder="Describí brevemente el motivo del arrepentimiento..."
                value={form.motivo}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400/40 resize-none"
              ></textarea>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={enviando}
                className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm shadow-md shadow-rose-600/25 flex items-center justify-center space-x-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{enviando ? 'Generando trámite...' : 'Enviar Solicitud de Arrepentimiento'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
