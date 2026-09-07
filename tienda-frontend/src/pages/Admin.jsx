import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} from '../services/api';
import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
  Loader2,
  Package,
  CreditCard,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function Admin() {
  const { token } = useAuth();

  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mensajeExito, setMensajeExito] = useState(null);

  // Estados de Modal de Crear / Editar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEdicion, setIdEdicion] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const [formulario, setFormulario] = useState({
    nombre: '',
    precio_final: '',
    cuotas_cantidad: 1,
    cuotas_valor: '',
    garantia_meses: 0,
    stock: '',
  });

  const cargarLista = async () => {
    setCargando(true);
    setError(null);
    try {
      const res = await getProductos({ skip: 0, limit: 100 });
      setProductos(res.items || []);
    } catch (err) {
      setError(err.message || 'Error al cargar los productos');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarLista();
  }, []);

  const abrirModalCrear = () => {
    setModoEdicion(false);
    setIdEdicion(null);
    setFormulario({
      nombre: '',
      precio_final: '',
      cuotas_cantidad: 1,
      cuotas_valor: '',
      garantia_meses: 0,
      stock: 10,
    });
    setModalAbierto(true);
  };

  const abrirModalEditar = (prod) => {
    setModoEdicion(true);
    setIdEdicion(prod.id);
    setFormulario({
      nombre: prod.nombre,
      precio_final: prod.precio_final,
      cuotas_cantidad: prod.cuotas_cantidad,
      cuotas_valor: prod.cuotas_valor,
      garantia_meses: prod.garantia_meses,
      stock: prod.stock,
    });
    setModalAbierto(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormulario((prev) => {
      const nuevo = { ...prev, [name]: value };
      // Si cambia el precio final y cuotas es 1, calculamos automáticamente el valor de la cuota
      if (name === 'precio_final' && Number(nuevo.cuotas_cantidad) === 1) {
        nuevo.cuotas_valor = value;
      }
      return nuevo;
    });
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    setMensajeExito(null);

    const payload = {
      nombre: formulario.nombre.trim(),
      precio_final: parseFloat(formulario.precio_final),
      cuotas_cantidad: parseInt(formulario.cuotas_cantidad, 10),
      cuotas_valor: parseFloat(formulario.cuotas_valor),
      garantia_meses: parseInt(formulario.garantia_meses, 10) || 0,
      stock: parseInt(formulario.stock, 10),
    };

    try {
      if (modoEdicion) {
        await actualizarProducto(idEdicion, payload, token);
        setMensajeExito(`El postre "${payload.nombre}" fue actualizado correctamente.`);
      } else {
        await crearProducto(payload, token);
        setMensajeExito(`El postre "${payload.nombre}" fue creado e incorporado al catálogo.`);
      }

      setModalAbierto(false);
      cargarLista();
    } catch (err) {
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar "${nombre}" del catálogo de Dulce Vicio?`)) {
      return;
    }

    try {
      await eliminarProducto(id, token);
      setMensajeExito(`Se eliminó "${nombre}" del catálogo.`);
      cargarLista();
    } catch (err) {
      setError(err.message || 'Error al eliminar producto');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
      
      {/* Cabecera del Panel Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-amber-950 to-stone-900 p-6 sm:p-8 rounded-3xl text-amber-50 shadow-warm border border-amber-800/40">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Administración Oficial</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Gestión del Catálogo de Dulce Vicio
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/80">
            Administrá precios finales, cuotas y stock con cumplimiento legal de la Ley 24.240.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={cargarLista}
            className="p-3 bg-white/10 hover:bg-white/20 text-amber-100 rounded-2xl transition-colors"
            title="Recargar catálogo"
          >
            <RefreshCw className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={abrirModalCrear}
            className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-orange-500/25 flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Postre</span>
          </button>
        </div>
      </div>

      {/* Alertas */}
      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between text-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>{mensajeExito}</span>
          </div>
          <button onClick={() => setMensajeExito(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between text-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabla de Productos */}
      <div className="bg-white rounded-3xl border border-amber-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-900 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Postre</th>
                <th className="py-4 px-6">Precio Final</th>
                <th className="py-4 px-6">Cuotas</th>
                <th className="py-4 px-6">Garantía</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {cargando ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500 mb-2" />
                    Cargando catálogo para administración...
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-stone-500">
                    No hay postres en el catálogo actualmente.
                  </td>
                </tr>
              ) : (
                productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs text-stone-400">
                      #{prod.id}
                    </td>
                    <td className="py-4 px-6 font-semibold text-stone-900">
                      {prod.nombre}
                    </td>
                    <td className="py-4 px-6 font-bold text-amber-900">
                      ${prod.precio_final.toLocaleString('es-AR')}
                    </td>
                    <td className="py-4 px-6 text-xs text-stone-600">
                      {prod.cuotas_cantidad} cuota(s) de ${prod.cuotas_valor.toLocaleString('es-AR')}
                    </td>
                    <td className="py-4 px-6 text-xs text-stone-500">
                      {prod.garantia_meses} meses
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          prod.stock > 10
                            ? 'bg-emerald-100 text-emerald-800'
                            : prod.stock > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {prod.stock} unidades
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => abrirModalEditar(prod)}
                        className="p-2 text-stone-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                        title="Editar postre"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEliminar(prod.id, prod.nombre)}
                        className="p-2 text-stone-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Eliminar postre"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Creación / Edición */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-amber-100 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-display font-bold text-lg text-stone-900">
                  {modoEdicion ? 'Editar Postre' : 'Nuevo Postre en Catálogo'}
                </h3>
              </div>
              <button
                onClick={() => setModalAbierto(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarProducto} className="space-y-4">
              
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nombre del Postre
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Ej: Chocotorta Tradicional"
                  value={formulario.nombre}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Precio Final ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="precio_final"
                    required
                    min="1"
                    placeholder="4000"
                    value={formulario.precio_final}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Stock Disponible
                  </label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    placeholder="15"
                    value={formulario.stock}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Cantidad de Cuotas
                  </label>
                  <input
                    type="number"
                    name="cuotas_cantidad"
                    required
                    min="1"
                    value={formulario.cuotas_cantidad}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Valor por Cuota ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="cuotas_valor"
                    required
                    min="1"
                    placeholder="4000"
                    value={formulario.cuotas_valor}
                    onChange={handleFormChange}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Garantía en Meses (0 para consumo inmediato)
                </label>
                <input
                  type="number"
                  name="garantia_meses"
                  required
                  min="0"
                  value={formulario.garantia_meses}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                />
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 hover:from-orange-600 flex items-center space-x-1.5"
                >
                  {guardando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{modoEdicion ? 'Actualizar Postre' : 'Crear Postre'}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
