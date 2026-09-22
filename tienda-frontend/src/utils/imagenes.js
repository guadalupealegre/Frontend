/**
 * Utilidad de Imágenes para Dulce Vicio (Clase 10)
 * Concatena la URL base de la API con la ruta relativa del producto.
 */
export function urlImagen(producto) {
  if (!producto || !producto.imagen_url) {
    return null;
  }

  const url = producto.imagen_url.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
  const pathRelativo = url.startsWith('/') ? url : `/${url}`;

  return `${apiBase}${pathRelativo}`;
}
