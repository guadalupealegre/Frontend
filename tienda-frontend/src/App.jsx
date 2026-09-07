import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RutaProtegida from './components/RutaProtegida';
import Catalogo from './pages/Catalogo';
import Login from './pages/Login';
import Registro from './pages/Registro';
import MiCuenta from './pages/MiCuenta';
import Admin from './pages/Admin';
import Arrepentimiento from './pages/Arrepentimiento';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#faf7f2] text-[#2c1810]">
      {/* Barra de Navegación Global */}
      <Navbar />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<Catalogo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/arrepentimiento" element={<Arrepentimiento />} />

          {/* Rutas Protegidas de Usuario */}
          <Route
            path="/mi-cuenta"
            element={
              <RutaProtegida>
                <MiCuenta />
              </RutaProtegida>
            }
          />

          {/* Rutas Protegidas de Administrador */}
          <Route
            path="/admin"
            element={
              <RutaProtegida soloAdmin={true}>
                <Admin />
              </RutaProtegida>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Pie de Página con Marco Legal Argentino */}
      <Footer />
    </div>
  );
}
