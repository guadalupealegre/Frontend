/**
 * Servicio de comunicación con la API Backend de Dulce Vicio
 * Maneja llamadas HTTP, conversión de parámetros, headers JWT y traducción de errores a español.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Traduce respuestas de error HTTP a mensajes claros en español.
 */
async function parseErrorResponse(response) {
  try {
    const data = await response.json();
    
    // Manejo de errores de validación de FastAPI (422 Pydantic)
    if (response.status === 422 && Array.isArray(data.detail)) {
      const mensajes = data.detail.map((err) => {
        const campo = err.loc ? err.loc[err.loc.length - 1] : 'campo';
        // Si el validador personalizado de acepto_tratamiento u otro lanzó un mensaje claro
        if (err.msg && !err.msg.includes('Value error,')) {
          return `${campo}: ${err.msg}`;
        }
        return err.msg.replace('Value error, ', '');
      });
      return mensajes.join('. ');
    }

    // Manejo de error de detalle como string simple (HTTPException)
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
        return 'Credenciales inválidas o sesión expirada.';
      case 403:
        return 'Acceso denegado: no tiene permisos para realizar esta acción.';
      case 404:
        return 'El recurso solicitado no fue encontrado.';
      case 500:
        return 'Error interno en el servidor. Por favor, intente nuevamente más tarde.';
      default:
        return `Error del servidor (${response.status}).`;
    }
  } catch {
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
  // OAuth2PasswordRequestForm requiere body codificado como x-www-form-urlencoded
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
