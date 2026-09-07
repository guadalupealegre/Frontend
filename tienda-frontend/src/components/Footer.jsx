import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ShieldCheck, Scale, FileText, Heart, Cake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#24140d] text-amber-100/80 border-t border-amber-900/40 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner destacado: Botón de Arrepentimiento según Res. 424/2020 */}
        <div className="bg-gradient-to-r from-rose-950/80 to-amber-950/80 border border-rose-500/30 rounded-2xl p-5 mb-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-center md:text-left">
            <div className="p-3 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-500/30 shrink-0">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-rose-100">
                Botón de Arrepentimiento (Resolución 424/2020 - Secretaría de Comercio Interior)
              </h4>
              <p className="text-xs text-rose-200/80 max-w-2xl mt-0.5">
                Si realizaste una compra online, tenés derecho a revocarla dentro de los diez (10) días corridos contados a partir de la fecha en que se entregue el producto o se celebre el contrato, sin costo alguno.
              </p>
            </div>
          </div>
          <Link
            to="/arrepentimiento"
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-rose-600/30 transition-all hover:scale-105 shrink-0"
          >
            Ejercer Arrepentimiento
          </Link>
        </div>

        {/* Columnas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-amber-900/30 text-sm">
          
          {/* Marca e Información */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
                <Cake className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-amber-100">Dulce Vicio</span>
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
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Defensa del Consumidor</span>
            </h5>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Cumplimiento riguroso de la <strong className="text-amber-100">Ley N° 24.240</strong>. Precios finales exhibidos de contado, detalle exacto de cuotas y condiciones de garantía de alimentos frescos.
            </p>
            <a
              href="https://www.argentina.gob.ar/produccion/defensadelconsumidor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-orange-400 hover:text-orange-300 underline underline-offset-2"
            >
              Dirección Nacional de Defensa del Consumidor ↗
            </a>
          </div>

          {/* Protección de Datos - Ley 25.326 */}
          <div className="space-y-2.5">
            <h5 className="font-semibold text-amber-200 flex items-center space-x-1.5 text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Protección de Datos</span>
            </h5>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              En cumplimiento con la <strong className="text-amber-100">Ley N° 25.326</strong>, sus datos personales son tratados con consentimiento libre e informado. Podés ejercer tus derechos de acceso, rectificación y supresión.
            </p>
            <a
              href="https://www.argentina.gob.ar/aaip/datospersonales"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-orange-400 hover:text-orange-300 underline underline-offset-2"
            >
              Agencia de Acceso a la Información Pública (AAIP) ↗
            </a>
          </div>

          {/* Accesos Rápidos */}
          <div className="space-y-2.5">
            <h5 className="font-semibold text-amber-200 flex items-center space-x-1.5 text-xs uppercase tracking-wider">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Enlaces del Sistema</span>
            </h5>
            <ul className="space-y-1.5 text-xs text-amber-200/80">
              <li>
                <Link to="/" className="hover:text-amber-100 transition-colors">
                  Catálogo de Productos
                </Link>
              </li>
              <li>
                <Link to="/arrepentimiento" className="hover:text-amber-100 transition-colors">
                  Formulario de Arrepentimiento
                </Link>
              </li>
              <li>
                <Link to="/mi-cuenta" className="hover:text-amber-100 transition-colors">
                  Mi Perfil y Consentimiento Legal
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
            <span>Hecho con dedicación y marco legal argentino</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline ml-1" />
          </div>
        </div>

      </div>
    </footer>
  );
}
