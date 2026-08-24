import { useState, useEffect } from "react";
import { getProductos } from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Catalogo() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    getProductos()
      .then((datos) => setProductos(datos))
      .catch((error) => console.error("Error al cargar productos:", error));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Catálogo de Productos</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {productos.map((producto) => (
          <ProductCard key={producto.id} producto={producto} />
        ))}
      </div>
    </div>
  );
}