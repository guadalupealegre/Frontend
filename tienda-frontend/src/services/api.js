const API_URL = "/api";

export async function getProductos() {
    const respuesta = await fetch(`${API_URL}/productos`);
    return respuesta.json();
}