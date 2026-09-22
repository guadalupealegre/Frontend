"""
Script de Carga de Imágenes Fotorrealistas para Dulce Vicio.
Asigna fotografías profesionales de alta calidad gastronómica a cada producto en la base de datos.
"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.database import SessionLocal, engine, Base
from app.models.producto import Producto

IMAGENES_POSTRES = {
    "Tiramisú": "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=800&q=80",
    "Brownie": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    "Chocotorta": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    "Turrón de Quaker": "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80",
    "Budín de pan": "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80",
    "Flan": "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?auto=format&fit=crop&w=800&q=80",
    "Cookie": "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=80",
}

# Productos adicionales boutique por si no existen
NUEVOS_PRODUCTOS_BOUTIQUE = [
    {
        "nombre": "Macarons de Frambuesa",
        "precio_final": 5000.0,
        "cuotas_cantidad": 1,
        "cuotas_valor": 5000.0,
        "garantia_meses": 0,
        "stock": 25,
        "imagen_url": "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80"
    },
    {
        "nombre": "Medialunas Artesanales",
        "precio_final": 2800.0,
        "cuotas_cantidad": 1,
        "cuotas_valor": 2800.0,
        "garantia_meses": 0,
        "stock": 40,
        "imagen_url": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80"
    },
    {
        "nombre": "Tarta de Frutillas",
        "precio_final": 5500.0,
        "cuotas_cantidad": 1,
        "cuotas_valor": 5500.0,
        "garantia_meses": 0,
        "stock": 15,
        "imagen_url": "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80"
    }
]


def actualizar_imagenes_catalogo():
    print("[Dulce Vicio] Cargando imágenes fotorrealistas de alta calidad...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        productos = db.query(Producto).all()
        for prod in productos:
            if prod.nombre in IMAGENES_POSTRES:
                prod.imagen_url = IMAGENES_POSTRES[prod.nombre]
                print(f"  [OK] Imagen asignada a '{prod.nombre}': {prod.imagen_url}")

        # Insertar productos adicionales si se desea enriquecer el catálogo
        for nuevo in NUEVOS_PRODUCTOS_BOUTIQUE:
            existente = db.query(Producto).filter(Producto.nombre == nuevo["nombre"]).first()
            if not existente:
                nuevo_prod = Producto(**nuevo)
                db.add(nuevo_prod)
                print(f"  [OK] Nuevo producto boutique creado: '{nuevo['nombre']}'")

        db.commit()
        print("\n[Dulce Vicio] ¡Imágenes fotorrealistas cargadas con éxito en la base de datos!")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Error al actualizar imágenes: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    actualizar_imagenes_catalogo()
