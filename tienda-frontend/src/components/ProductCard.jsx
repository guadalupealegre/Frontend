export default function ProductCard({ producto }) {
    return (
        <div className="rounded-lg shadow p-4 border">
            <h3 className="font-bold text-lg">{producto.nombre}</h3>
            <p className="text-xl font-semibold">${producto.precio_final}</p>
            <p className="text-gray-600">{producto.cuotas_cantidad}x de ${producto.cuotas_valor}</p>
            <p className="text-sm text-gray-500">Garantía: {producto.garantia_meses} meses</p>
            <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded">
                Agregar al carrito
            </button>
        </div>
    );
}