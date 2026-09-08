import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const CarritoContext = createContext(null);

const STORAGE_KEY = 'dulce_vicio_carrito';

export const CarritoProvider = ({ children }) => {
  // Inicialización segura desde localStorage con try/catch
  const [items, setItems] = useState(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY);
      return guardado ? JSON.parse(guardado) : [];
    } catch (error) {
      console.error('Error al leer el carrito desde localStorage:', error);
      return [];
    }
  });

  // Estado para el Slide-over Drawer lateral
  const [drawerAbierto, setDrawerAbierto] = useState(false);

  // Estado para sistema de notificaciones Toast animadas
  const [toasts, setToasts] = useState([]);

  // Guardar en localStorage cada vez que cambia el carrito
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error al guardar el carrito en localStorage:', error);
    }
  }, [items]);

  // Manejo de Toasts con autocierre
  const removerToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const agregarToast = useCallback((mensaje, tipo = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, mensaje, tipo }]);

    setTimeout(() => {
      removerToast(id);
    }, 3500);
  }, [removerToast]);

  // Funciones de control del Drawer lateral
  const abrirDrawer = useCallback(() => setDrawerAbierto(true), []);
  const cerrarDrawer = useCallback(() => setDrawerAbierto(false), []);
  const toggleDrawer = useCallback(() => setDrawerAbierto((prev) => !prev), []);

  /**
   * Agrega un producto al carrito respetando el stock disponible.
   * Si ya existe, suma la cantidad solicitada.
   */
  const agregar = useCallback((producto, cantidad = 1) => {
    if (!producto || producto.stock <= 0) {
      agregarToast(`Lo sentimos, no hay stock de "${producto?.nombre || 'este postre'}".`, 'warning');
      return;
    }

    setItems((prevItems) => {
      const index = prevItems.findIndex((item) => item.producto.id === producto.id);

      if (index > -1) {
        // El producto ya está en el carrito: verificar límite de stock
        const itemActual = prevItems[index];
        const cantidadDeseada = itemActual.cantidad + cantidad;

        if (cantidadDeseada > producto.stock) {
          agregarToast(
            `Alcanzaste el stock disponible para ${producto.nombre} (${producto.stock} u.).`,
            'warning'
          );
          const actualizados = [...prevItems];
          actualizados[index] = {
            ...itemActual,
            cantidad: producto.stock,
            producto, // Refresca datos
          };
          return actualizados;
        }

        const actualizados = [...prevItems];
        actualizados[index] = {
          ...itemActual,
          cantidad: cantidadDeseada,
          producto,
        };
        agregarToast(`¡Sumaste +${cantidad} "${producto.nombre}" al carrito! 🍰`, 'success');
        return actualizados;
      } else {
        // Producto nuevo en el carrito
        const cantidadValida = Math.min(cantidad, producto.stock);
        agregarToast(`¡"${producto.nombre}" agregado al carrito! 🧁`, 'success');
        return [...prevItems, { producto, cantidad: cantidadValida }];
      }
    });
  }, [agregarToast]);

  /**
   * Quita un producto específico del carrito.
   */
  const quitar = useCallback((producto_id) => {
    setItems((prevItems) => {
      const item = prevItems.find((i) => i.producto.id === producto_id);
      if (item) {
        agregarToast(`"${item.producto.nombre}" eliminado del carrito.`, 'info');
      }
      return prevItems.filter((i) => i.producto.id !== producto_id);
    });
  }, [agregarToast]);

  /**
   * Actualiza la cantidad exacta de un producto (con validación de mínimo 1 y máximo stock).
   */
  const actualizarCantidad = useCallback((producto_id, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      quitar(producto_id);
      return;
    }

    setItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.producto.id === producto_id) {
          const maxStock = item.producto.stock || 1;
          if (nuevaCantidad > maxStock) {
            agregarToast(
              `Solo disponemos de ${maxStock} unidades de "${item.producto.nombre}".`,
              'warning'
            );
            return { ...item, cantidad: maxStock };
          }
          return { ...item, cantidad: nuevaCantidad };
        }
        return item;
      });
    });
  }, [quitar, agregarToast]);

  /**
   * Vacía por completo el carrito de compras.
   */
  const vaciar = useCallback(() => {
    setItems([]);
  }, []);

  // Total monetario calculado con reduce
  const total = useMemo(() => {
    return items.reduce((acc, item) => {
      const precio = Number(item.producto.precio_final) || 0;
      return acc + precio * item.cantidad;
    }, 0);
  }, [items]);

  // Cantidad total de unidades de productos en el carrito
  const cantidadTotal = useMemo(() => {
    return items.reduce((acc, item) => acc + item.cantidad, 0);
  }, [items]);

  const valor = {
    items,
    total,
    cantidadTotal,
    agregar,
    quitar,
    actualizarCantidad,
    vaciar,
    drawerAbierto,
    abrirDrawer,
    cerrarDrawer,
    toggleDrawer,
    toasts,
    agregarToast,
    removerToast,
  };

  return (
    <CarritoContext.Provider value={valor}>
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe ser utilizado dentro de un CarritoProvider');
  }
  return context;
};
