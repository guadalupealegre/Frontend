/**
 * Servicio de comunicación con la API Backend de Dulce Vicio
 * Maneja llamadas HTTP, conversión de parámetros, headers JWT, pedidos transaccionales y traducción de errores.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Traduce respuestas de error HTTP a mensajes claros en español.
 */
export async function parseErrorResponse(response) {
  try {
    const data = await response.json();
    
    // Manejo de errores de validación de FastAPI (422 Pydantic)
    if (response.status === 422 && Array.isArray(data.detail)) {
      const mensajes = data.detail.map((err) => {
        const campo = err.loc ? err.loc[err.loc.length - 1] : 'campo';
        if (err.msg && !err.msg.includes('Value error,')) {
          return `${campo}: ${err.msg}`;
        }
        return err.msg.replace('Value error, ', '');
      });
      return mensajes.join('. ');
    }

    // Manejo de error de detalle como string simple (HTTPException / 409 Conflict)
    if (data.detail && typeof data.detail === 'string') {
      return data.detail;
    }

    if (data.message && typeof data.message === 'string') {
      return data.message;
    }

    // Mensajes estándar por código de estado
    switch (response.status) {
      case 400:
        return 'Solicitud inválida. Verifique los datos ingresados.';
      case 401:
        return 'Tu sesión venció. Por favor, iniciá sesión nuevamente.';
      case 403:
        return 'Acceso denegado: no tiene permisos para realizar esta acción.';
      case 404:
        return 'El recurso solicitado no fue encontrado.';
      case 409:
        return 'Conflicto con el stock o los datos solicitados.';
      case 500:
        return 'Error interno en el servidor. Por favor, intente nuevamente más tarde.';
      default:
        return `Error del servidor (${response.status}).`;
    }
  } catch {
    if (response.status === 401) {
      return 'Tu sesión venció. Por favor, iniciá sesión nuevamente.';
    }
    return `Error en la conexión con el servidor (${response.status}).`;
  }
}

/**
 * Genera headers de autorización JWT si existe token.
 */
export function authHeaders(token) {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Función genérica para peticiones fetch con manejo de excepciones.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorMsg = await parseErrorResponse(response);
      const error = new Error(errorMsg);
      error.status = response.status;
      throw error;
    }

    // Si la respuesta no tiene contenido (204)
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor de Dulce Vicio. Verifique que el Backend esté en ejecución.');
    }
    throw err;
  }
}

// ==========================================
// SERVICIOS DE AUTENTICACIÓN
// ==========================================

export async function registrar({ nombre, email, password, acepto_tratamiento }) {
  return await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre,
      email,
      password,
      acepto_tratamiento,
    }),
  });
}

export async function login({ username, password }) {
  const formParams = new URLSearchParams();
  formParams.append('username', username);
  formParams.append('password', password);

  return await request('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formParams.toString(),
  });
}

export async function refreshToken(refresh_token) {
  return await request('/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token }),
  });
}

export async function getMe(token) {
  return await request('/auth/me', {
    method: 'GET',
    headers: authHeaders(token),
  });
}

// ==========================================
// SERVICIOS DE PRODUCTOS Y CATÁLOGO
// ==========================================

export async function getProductos({ skip = 0, limit = 10, nombre = '', precio_max = null } = {}) {
  const params = new URLSearchParams();
  params.append('skip', skip.toString());
  params.append('limit', limit.toString());
  
  if (nombre && nombre.trim() !== '') {
    params.append('nombre', nombre.trim());
  }
  if (precio_max !== null && precio_max !== undefined && precio_max !== '' && Number(precio_max) > 0) {
    params.append('precio_max', Number(precio_max).toString());
  }

  return await request(`/productos/?${params.toString()}`, {
    method: 'GET',
  });
}

export async function getProducto(id) {
  return await request(`/productos/${id}`, {
    method: 'GET',
  });
}

export async function crearProducto(datos, token) {
  return await request('/productos/', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(datos),
  });
}

export async function actualizarProducto(id, datos, token) {
  return await request(`/productos/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(datos),
  });
}

export async function eliminarProducto(id, token) {
  return await request(`/productos/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}

/**
 * Suba la imagen oficial de un producto enviando FormData con la key 'archivo'.
 * JAMÁS especifica el header Content-Type para permitir la generación automática de boundary.
 */
export async function subirImagenProducto(id, file, token) {
  const url = `${API_BASE_URL}/productos/${id}/imagen`;
  const formData = new FormData();
  formData.append('archivo', file);

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 413) {
        throw new Error('Imagen muy grande');
      }
      if (response.status === 415) {
        throw new Error('Formato no válido');
      }
      if (response.status === 403) {
        throw new Error('Sin permisos');
      }
      if (response.status === 404) {
        throw new Error('Producto no encontrado');
      }

      const errorMsg = await parseErrorResponse(response);
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor para subir la imagen.');
    }
    throw err;
  }
}

// ==========================================
// SERVICIOS DE PEDIDOS Y COMPRAS (CLASE 8)
// ==========================================

/**
 * Crea un pedido transaccional enviando exclusivamente producto_id y cantidad de cada ítem.
 * @param {Array<{producto: {id: number}, cantidad: number}> | Array<{producto_id: number, cantidad: number}>} items
 * @param {string} token
 */
export async function crearPedido(items, token) {
  // Normalizar estructura para enviar únicamente [{"producto_id": X, "cantidad": Y}]
  const itemsPayload = items.map((item) => ({
    producto_id: item.producto ? item.producto.id : item.producto_id,
    cantidad: item.cantidad,
  }));

  return await request('/pedidos/', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      items: itemsPayload,
    }),
  });
}

/**
 * Obtiene el historial de pedidos del usuario autenticado.
 * @param {string} token
 */
export async function getMisPedidos(token) {
  return await request('/pedidos/mios', {
    method: 'GET',
    headers: authHeaders(token),
  });
}

/**
 * Obtiene un pedido específico del usuario por ID.
 * @param {number} id
 * @param {string} token
 */
export async function getPedido(id, token) {
  return await request(`/pedidos/${id}`, {
    method: 'GET',
    headers: authHeaders(token),
  });
}

/**
 * Revoca un pedido ejerciendo el derecho legal de arrepentimiento (Clase 9).
 * @param {number} pedidoId
 * @param {string} token
 */
export async function revocarPedido(pedidoId, token) {
  return await request(`/pedidos/${pedidoId}/revocacion`, {
    method: 'POST',
    headers: authHeaders(token),
  });
}

// ==========================================
// SERVICIOS DE USUARIOS Y PROTECCIÓN DE DATOS (CLASE 9)
// ==========================================

/**
 * Obtiene el informe completo de datos personales, consentimiento, pedidos y revocaciones (Ley 25.326).
 * @param {string} token
 */
export async function getMisDatos(token) {
  return await request('/usuarios/me/datos', {
    method: 'GET',
    headers: authHeaders(token),
  });
}

/**
 * Descarga el archivo mis_datos.json directamente en el navegador del usuario.
 * @param {string} token
 */
export async function exportarMisDatos(token) {
  const url = `${API_BASE_URL}/usuarios/me/exportar`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: authHeaders(token),
    });

    if (!response.ok) {
      const errorMsg = await parseErrorResponse(response);
      throw new Error(errorMsg);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'mis_datos.json');
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('No se pudo descargar el archivo. Verifique la conexión con el servidor.');
    }
    throw err;
  }
}

/**
 * Da de baja la cuenta y anonimiza los datos personales (Ley 25.326 Art. 16).
 * @param {string} token
 */
export async function eliminarMiCuenta(token) {
  return await request('/usuarios/me', {
    method: 'DELETE',
    headers: authHeaders(token),
  });
}
