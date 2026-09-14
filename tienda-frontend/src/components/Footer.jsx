import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ShieldCheck, Scale, FileText, Heart, Cake, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1c0c06] text-amber-100/80 border-t border-amber-950 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner destacado: Botón de Arrepentimiento según Res. 424/2020 & Ley 24.240 */}
        <div className="bg-gradient-to-r from-rose-950/90 via-stone-900 to-amber-950/90 border border-rose-500/40 rounded-3xl p-6 mb-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center space-x-4 text-center md:text-left">
            <div className="p-3.5 bg-rose-600/30 text-rose-300 rounded-2xl border border-rose-500/40 shrink-0">
              <RotateCcw className="w-7 h-7 text-rose-300" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base sm:text-lg text-rose-100">
                Botón de Arrepentimiento (Resolución 424/2020 & Ley N° 24.240 Art. 34)
              </h4>
              <p className="text-xs text-rose-200/80 max-w-2xl mt-1 leading-relaxed">
                Si realizaste una compra online, tenés derecho a revocarla dentro de los diez (10) días corridos contados a partir de la entrega del producto o de la celebración del contrato, sin cargo ni penalidad alguna.
              </p>
            </div>
          </div>
          <Link
            to="/arrepentimiento"
            className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-600/30 transition-all hover:scale-105 shrink-0"
          >
            Ejercer Arrepentimiento
          </Link>
        </div>

        {/* Columnas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-stone-800/80 text-sm">
          
          {/* Marca e Información */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-md">
                <Cake className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-2xl text-amber-100">Dulce Vicio</span>
            </div>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Elaboración artesanal de postres de repostería fina. Calidad garantizada e ingredientes de primera línea en cada porción.
            </p>
            <div className="text-[11px] text-amber-300/60 pt-1">
              Buenos Aires, República Argentina
            </div>
          </div>

          {/* Defensa del Consumidor - Ley 24.240 */}
          <div className="space-y-2.5">
            <h5 className="font-semibold text-amber-200 flex items-center space-x-1.5 text-xs uppercase tracking-wider">
              <Scale className="w-4 h-4 text-rose-400" />
              <span>Defensa del Consumidor</span>
            </h5>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Cumplimiento riguroso de la <strong className="text-amber-100">Ley N° 24.240</strong>. Precios finales de contado, esquemas transparentes de cuotas y garantía legal.
            </p>
            <a
              href="https://www.argentina.gob.ar/produccion/defensadelconsumidor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 underline underline-offset-2"
            >
              <span>Defensa del Consumidor Nacional</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Protección de Datos - Ley 25.326 */}
          <div className="space-y-2.5">
            <h5 className="font-semibold text-amber-200 flex items-center space-x-1.5 text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protección de Datos</span>
            </h5>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Bajo la <strong className="text-amber-100">Ley N° 25.326</strong>, tus datos son tratados con consentimiento expreso. Podés acceder a tu información, exportarla o solicitar la baja.
            </p>
            <a
              href="https://www.argentina.gob.ar/aaip/datospersonales"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 underline underline-offset-2"
            >
              <span>Agencia de Acceso a la Información (AAIP)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Accesos Rápidos Legales */}
          <div className="space-y-2.5">
            <h5 className="font-semibold text-amber-200 flex items-center space-x-1.5 text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Enlaces del Sistema</span>
            </h5>
            <ul className="space-y-2 text-xs text-amber-200/80">
              <li>
                <Link to="/" className="hover:text-amber-100 transition-colors">
                  Catálogo de Productos
                </Link>
              </li>
              <li>
                <Link to="/arrepentimiento" className="hover:text-rose-300 transition-colors font-medium">
                  Botón de Arrepentimiento
                </Link>
              </li>
              <li>
                <Link to="/mis-datos" className="hover:text-rose-300 transition-colors font-medium">
                  Mis Datos & Portabilidad (Ley 25.326)
                </Link>
              </li>
              <li>
                <Link to="/mis-pedidos" className="hover:text-amber-100 transition-colors">
                  Historial de Mis Pedidos
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-100 transition-colors">
                  Acceso de Usuarios
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Pie de Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-amber-300/50 gap-3">
          <div>
            © {new Date().getFullYear()} Dulce Vicio. Todos los derechos reservados.
          </div>
          <div className="flex items-center space-x-1">
            <span>Hecho con dedicación y marco normativo argentino</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline ml-1" />
          </div>
        </div>

      </div>
    </footer>
  );
}
