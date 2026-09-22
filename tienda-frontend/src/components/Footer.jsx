import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ShieldCheck, Scale, FileText, Heart, Cake, ExternalLink, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#3B111E] text-[#FAF8F5] border-t border-rose-950 mt-16 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner destacado: Botón de Arrepentimiento según Res. 424/2020 & Ley 24.240 */}
        <div className="bg-[#4A1525] border border-[#E85D88]/40 rounded-3xl p-6 sm:p-8 mb-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4 text-center md:text-left">
            <div className="p-4 bg-[#E85D88]/20 text-[#E85D88] rounded-2xl border border-[#E85D88]/40 shrink-0">
              <RotateCcw className="w-8 h-8 text-[#E85D88]" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-lg sm:text-xl text-white">
                Botón de Arrepentimiento (Resolución 424/2020 & Disp. 954/2025)
              </h4>
              <p className="text-xs sm:text-sm text-rose-200/90 max-w-2xl leading-relaxed">
                Si realizaste una compra online, tenés derecho a revocarla dentro de los diez (10) días corridos contados a partir de la entrega del producto o de la celebración del contrato, sin cargo ni penalidad alguna.
              </p>
            </div>
          </div>
          <Link
            to="/arrepentimiento"
            className="px-6 py-3.5 bg-[#E85D88] hover:bg-[#D81B60] text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl shadow-lg shadow-[#E85D88]/30 transition-all hover:scale-105 shrink-0"
          >
            Ejercer Arrepentimiento
          </Link>
        </div>

        {/* Columnas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-rose-900/40 text-sm">
          
          {/* Marca e Información de la Pastelería */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#E85D88] flex items-center justify-center shadow-md">
                <Cake className="w-5 h-5 text-white" />
              </div>
              <span className="font-serif font-bold text-2xl text-white">Dulce Vicio</span>
            </div>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Pastelería boutique y repostería artesanal. Elaboración diaria con ingredientes finos de máxima calidad para deleitar tu paladar.
            </p>
            <div className="space-y-1.5 text-xs text-rose-200/80 pt-1">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#E85D88]" />
                <span>Av. Fray A. Alcalde 10, Buenos Aires</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-[#E85D88]" />
                <span>Lun - Vie: 9:00 - 18:00 | Sáb: 10:00 - 14:00</span>
              </div>
            </div>
          </div>

          {/* Defensa del Consumidor - Ley 24.240 */}
          <div className="space-y-3">
            <h5 className="font-serif font-bold text-white flex items-center space-x-2 text-base">
              <Scale className="w-4 h-4 text-[#E85D88]" />
              <span>Defensa del Consumidor</span>
            </h5>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Cumplimiento riguroso de la <strong className="text-white">Ley N° 24.240</strong>. Precios transparentes de contado, financiamiento claro y garantía legal.
            </p>
            <a
              href="https://www.argentina.gob.ar/produccion/defensadelconsumidor"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-[#E85D88] hover:text-rose-300 underline underline-offset-2 font-medium"
            >
              <span>Defensa del Consumidor Nacional</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Protección de Datos - Ley 25.326 */}
          <div className="space-y-3">
            <h5 className="font-serif font-bold text-white flex items-center space-x-2 text-base">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Protección de Datos</span>
            </h5>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Bajo la <strong className="text-white">Ley N° 25.326</strong>, tus datos son tratados con consentimiento explícito. Podés consultar, descargar o dar de baja tus registros.
            </p>
            <a
              href="https://www.argentina.gob.ar/aaip/datospersonales"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-[#E85D88] hover:text-rose-300 underline underline-offset-2 font-medium"
            >
              <span>Agencia de Acceso a la Información (AAIP)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Accesos Rápidos del Sistema */}
          <div className="space-y-3">
            <h5 className="font-serif font-bold text-white flex items-center space-x-2 text-base">
              <FileText className="w-4 h-4 text-[#E85D88]" />
              <span>Enlaces del Sistema</span>
            </h5>
            <ul className="space-y-2 text-xs text-rose-200/80">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Catálogo de Productos
                </Link>
              </li>
              <li>
                <Link to="/arrepentimiento" className="hover:text-[#E85D88] transition-colors font-semibold">
                  Botón de Arrepentimiento
                </Link>
              </li>
              <li>
                <Link to="/mis-datos" className="hover:text-[#E85D88] transition-colors font-semibold">
                  Mis Datos & Portabilidad (Ley 25.326)
                </Link>
              </li>
              <li>
                <Link to="/mis-pedidos" className="hover:text-white transition-colors">
                  Historial de Mis Pedidos
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Acceso a mi Cuenta
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-rose-200/60 gap-3">
          <div>
            © {new Date().getFullYear()} Dulce Vicio. Todos los derechos reservados.
          </div>
          <div className="flex items-center space-x-1">
            <span>Repostería Fina Artesanal</span>
            <Heart className="w-3.5 h-3.5 text-[#E85D88] fill-[#E85D88] inline ml-1" />
          </div>
        </div>

      </div>
    </footer>
  );
}
