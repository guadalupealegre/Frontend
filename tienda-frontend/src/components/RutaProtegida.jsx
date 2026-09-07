import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cake, Loader2 } from 'lucide-react';

export default function RutaProtegida({ children, soloAdmin = false }) {
  const { usuario, cargando } = useAuth();
  const location = useLocation();

  // 1. Estado cargando: Evita expulsar al usuario durante la recarga de página (F5)
  if (cargando) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center animate-pulse">
            <Cake className="w-8 h-8 text-amber-600 animate-bounce" />
          </div>
          <Loader2 className="w-6 h-6 text-orange-500 animate-spin absolute -top-1 -right-1" />
        </div>
        <div className="text-center">
          <p className="font-display font-semibold text-stone-800 text-base">
            Verificando sesión segura...
          </p>
          <p className="text-xs text-stone-500">Dulce Vicio</p>
        </div>
      </div>
    );
  }

  // 2. Si no está autenticado, redirigir a Login guardando la ubicación original
  if (!usuario) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Si la ruta es exclusiva para Administradores y el usuario no lo es
  if (soloAdmin && usuario.rol !== 'admin') {
    return <Navigate to="/mi-cuenta" replace />;
  }

  // 4. Usuario autorizado: renderizar contenido
  return children;
}
