import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe, refreshToken as apiRefreshToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('dulce_vicio_access_token'));
  const [refreshTokenVal, setRefreshTokenVal] = useState(() => localStorage.getItem('dulce_vicio_refresh_token'));
  const [cargando, setCargando] = useState(true);

  // Verificar sesión persistente al cargar la app
  useEffect(() => {
    let montado = true;

    async function verificarSesion() {
      const storedToken = localStorage.getItem('dulce_vicio_access_token');
      const storedRefresh = localStorage.getItem('dulce_vicio_refresh_token');

      if (!storedToken) {
        if (montado) {
          setUsuario(null);
          setToken(null);
          setCargando(false);
        }
        return;
      }

      try {
        // Intentar validar token existente
        const perfil = await getMe(storedToken);
        if (montado) {
          setUsuario(perfil);
          setToken(storedToken);
        }
      } catch (err) {
        // Si el access token expiró pero hay refresh token, intentamos renovar
        if (storedRefresh) {
          try {
            const dataRefresh = await apiRefreshToken(storedRefresh);
            const nuevoToken = dataRefresh.access_token;
            localStorage.setItem('dulce_vicio_access_token', nuevoToken);
            
            const perfilRenovado = await getMe(nuevoToken);
            if (montado) {
              setToken(nuevoToken);
              setUsuario(perfilRenovado);
            }
          } catch (refreshErr) {
            // El refresh token también expiró o es inválido
            cerrarSesion();
          }
        } else {
          cerrarSesion();
        }
      } finally {
        if (montado) {
          setCargando(false);
        }
      }
    }

    verificarSesion();

    return () => {
      montado = false;
    };
  }, []);

  const iniciarSesion = (authData) => {
    const { access_token, refresh_token, usuario: datosUsuario } = authData;
    
    setToken(access_token);
    setRefreshTokenVal(refresh_token);
    setUsuario(datosUsuario);

    localStorage.setItem('dulce_vicio_access_token', access_token);
    if (refresh_token) {
      localStorage.setItem('dulce_vicio_refresh_token', refresh_token);
    }
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setToken(null);
    setRefreshTokenVal(null);
    localStorage.removeItem('dulce_vicio_access_token');
    localStorage.removeItem('dulce_vicio_refresh_token');
  };

  const valor = {
    usuario,
    token,
    refreshToken: refreshTokenVal,
    cargando,
    iniciarSesion,
    cerrarSesion,
    esAdmin: usuario?.rol === 'admin',
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
