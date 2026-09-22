import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { urlImagen } from '../utils/imagenes';
import {
  getProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  subirImagenProducto,
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
  Upload,
  Image as ImageIcon,
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

  // Estados de Modal de Subida de Imagen (Clase 10)
  const [modalImagenProducto, setModalImagenProducto] = useState(null);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [vistaPrevia, setVistaPrevia] = useState(null);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorImagen, setErrorImagen] = useState(null);

  // Ref obligatorio para el input de archivo (sin atributo value)
  const archivoInputRef = useRef(null);

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

  // Limpieza de memoria para URL.revokeObjectURL de vista previa
  useEffect(() => {
    if (!vistaPrevia) return;

    return () => {
      URL.revokeObjectURL(vistaPrevia);
    };
  }, [vistaPrevia]);

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

  // ==========================================
  // MANEJO DE SUBIDA DE IMAGEN (CLASE 10)
  // ==========================================
  const abrirModalSubidaImagen = (prod) => {
    setModalImagenProducto(prod);
    setArchivoSeleccionado(null);
    setVistaPrevia(null);
    setErrorImagen(null);
    if (archivoInputRef.current) {
      archivoInputRef.current.value = '';
    }
  };

  const cerrarModalSubidaImagen = () => {
    setModalImagenProducto(null);
    setArchivoSeleccionado(null);
    setVistaPrevia(null);
    setErrorImagen(null);
    if (archivoInputRef.current) {
      archivoInputRef.current.value = '';
    }
  };

  const handleSeleccionArchivo = (e) => {
    setErrorImagen(null);
    const file = e.target.files[0];
    if (!file) return;

    // Validación previa 1: Extensión en cliente
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    const extensionesPermitidas = ['.jpg', '.jpeg', '.png', '.webp'];

    if (!extensionesPermitidas.includes(extension)) {
      setErrorImagen('Formato no válido. Debe seleccionar una imagen .jpg, .jpeg, .png o .webp');
      if (archivoInputRef.current) archivoInputRef.current.value = '';
      return;
    }

    // Validación previa 2: Tamaño en cliente <= 2 MB
    if (file.size > 2 * 1024 * 1024) {
      setErrorImagen('Imagen muy grande. El tamaño máximo permitido es 2 MB.');
      if (archivoInputRef.current) archivoInputRef.current.value = '';
      return;
    }

    setArchivoSeleccionado(file);
    const objectUrl = URL.createObjectURL(file);
    setVistaPrevia(objectUrl);
  };

  const handleSubirImagen = async (e) => {
    e.preventDefault();
    if (!modalImagenProducto || !archivoSeleccionado || subiendoImagen) return;

    setSubiendoImagen(true);
    setErrorImagen(null);

    try {
      await subirImagenProducto(modalImagenProducto.id, archivoSeleccionado, token);
      setMensajeExito(`¡Imagen de "${modalImagenProducto.nombre}" actualizada con éxito! 📷`);
      cerrarModalSubidaImagen();
      await cargarLista();
    } catch (err) {
      console.error('Error al subir imagen:', err);
      setErrorImagen(err.message || 'Error al subir la imagen.');
    } finally {
      setSubiendoImagen(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto py-8 px-4 space-y-8"
    >
      {/* Cabecera del Panel Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#3B111E] p-8 rounded-3xl text-[#FAF8F5] shadow-xl border border-rose-900/40">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 text-[#E85D88] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#E85D88]" />
            <span>Administración Oficial</span>
          </div>
          <h1 className="font-serif font-bold text-3xl text-white">
            Gestión del Catálogo de Dulce Vicio
          </h1>
          <p className="text-xs sm:text-sm text-rose-100/80">
            Administrá precios finales, cuotas, stock y fotos oficiales con cumplimiento legal (Ley 24.240).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={cargarLista}
            className="p-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors"
            title="Recargar catálogo"
          >
            <RefreshCw className={`w-5 h-5 ${cargando ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={abrirModalCrear}
            className="px-6 py-3.5 bg-[#E85D88] hover:bg-[#D81B60] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-[#E85D88]/30 flex items-center space-x-2 transition-transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Postre</span>
          </button>
        </div>
      </div>

      {/* Alertas */}
      {mensajeExito && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold">
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
        <div className="bg-rose-50 border border-rose-200 text-rose-900 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-[#E85D88]" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-700 hover:text-rose-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabla de Productos */}
      <div className="bg-white rounded-3xl border border-rose-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-700">
            <thead className="bg-[#FAF8F5] border-b border-rose-200/80 text-[#3B111E] text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Foto</th>
                <th className="py-4 px-6">Postre</th>
                <th className="py-4 px-6">Precio Final</th>
                <th className="py-4 px-6">Cuotas</th>
                <th className="py-4 px-6">Garantía</th>
                <th className="py-4 px-6">Stock</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100">
              {cargando ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-stone-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#E85D88] mb-2" />
                    Cargando catálogo para administración...
                  </td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-stone-500">
                    No hay postres en el catálogo actualmente.
                  </td>
                </tr>
              ) : (
                productos.map((prod) => {
                  const imgUrl = urlImagen(prod);
                  return (
                    <tr key={prod.id} className="hover:bg-[#FFF1F5]/40 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-stone-400">
                        #{prod.id}
                      </td>

                      {/* Miniatura de Imagen (Clase 10) */}
                      <td className="py-4 px-6">
                        <div className="w-12 h-12 rounded-xl border border-rose-200 bg-[#FAF8F5] overflow-hidden flex items-center justify-center relative">
                          {imgUrl ? (
                            <img src={imgUrl} alt={prod.nombre} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-stone-400" />
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 font-serif font-bold text-[#3B111E]">
                        {prod.nombre}
                      </td>
                      <td className="py-4 px-6 font-bold text-[#E85D88]">
                        ${Number(prod.precio_final).toLocaleString('es-AR')}
                      </td>
                      <td className="py-4 px-6 text-xs text-stone-600">
                        {prod.cuotas_cantidad} cuota(s) de ${Number(prod.cuotas_valor).toLocaleString('es-AR')}
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
                      <td className="py-4 px-6 text-right space-x-1">
                        {/* Botón Subir Foto */}
                        <button
                          onClick={() => abrirModalSubidaImagen(prod)}
                          className="p-2 text-stone-600 hover:text-[#E85D88] hover:bg-rose-50 rounded-xl transition-colors"
                          title="Subir o cambiar foto oficial"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirModalEditar(prod)}
                          className="p-2 text-stone-600 hover:text-[#3B111E] hover:bg-rose-50 rounded-xl transition-colors"
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Creación / Edición de Producto */}
      <AnimatePresence>
        {modalAbierto && (
          <div className="fixed inset-0 z-50 bg-[#3B111E]/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-lg w-full p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF1F5] text-[#E85D88] flex items-center justify-center border border-rose-200">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#3B111E]">
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
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]"
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
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]"
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
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]"
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
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]"
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
                      className="w-full px-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Garantía en Meses (0 para consumo directo)
                  </label>
                  <input
                    type="number"
                    name="garantia_meses"
                    required
                    min="0"
                    value={formulario.garantia_meses}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-rose-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85D88]"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="px-5 py-3 rounded-xl border border-stone-300 text-xs font-bold text-stone-600 hover:bg-stone-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardando}
                    className="px-6 py-3 rounded-xl bg-[#E85D88] hover:bg-[#D81B60] text-white text-xs font-bold shadow-md flex items-center space-x-1.5"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Subida de Imagen de Producto (Clase 10) */}
      <AnimatePresence>
        {modalImagenProducto && (
          <div className="fixed inset-0 z-50 bg-[#3B111E]/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-rose-200 shadow-2xl max-w-md w-full p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-rose-100 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-[#FFF1F5] text-[#E85D88] flex items-center justify-center border border-rose-200">
                    <Upload className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#3B111E]">
                    Subir Imagen del Producto
                  </h3>
                </div>
                <button
                  onClick={cerrarModalSubidaImagen}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubirImagen} className="space-y-4">
                <p className="text-xs text-stone-600">
                  Seleccioná la imagen oficial para <strong>"{modalImagenProducto.nombre}"</strong> (Máximo 2 MB, formatos .jpg, .png, .webp).
                </p>

                {errorImagen && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-2xl flex items-center space-x-2 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 text-[#E85D88] shrink-0" />
                    <span>{errorImagen}</span>
                  </div>
                )}

                {/* Input de Archivo (ref obligatorio, sin value) */}
                <div>
                  <input
                    ref={archivoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSeleccionArchivo}
                    className="w-full text-xs text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FFF1F5] file:text-[#E85D88] hover:file:bg-rose-100 cursor-pointer"
                  />
                </div>

                {/* Previsualización de Imagen (<img src={preview} /> con revokeObjectURL) */}
                {vistaPrevia && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-stone-400 uppercase font-bold block">Vista Previa:</span>
                    <div className="w-full h-48 rounded-2xl border border-rose-200 bg-[#FAF8F5] overflow-hidden flex items-center justify-center">
                      <img src={vistaPrevia} alt="Previsualización" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}

                <div className="pt-4 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={cerrarModalSubidaImagen}
                    disabled={subiendoImagen}
                    className="px-5 py-3 rounded-xl border border-stone-300 text-xs font-bold text-stone-600 hover:bg-stone-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!archivoSeleccionado || subiendoImagen}
                    className="px-6 py-3 rounded-xl bg-[#E85D88] hover:bg-[#D81B60] text-white text-xs font-bold shadow-md flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {subiendoImagen ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Subir Imagen</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
