"""
Script de Carga Inicial Idempotente (Seed) para Producción en Render / PostgreSQL (Clase 11)
Pobla la base de datos con el usuario Administrador y los productos del catálogo inicial.
"""
import os
import sys

# Agregar la raíz del proyecto al sys.path para permitir ejecución directa (python app/seed.py)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import logging
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, Base, engine

from app.models.usuario import Usuario
from app.models.producto import Producto
from app.core.security import obtener_password_hash

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dulcevicio.seed")

# Credenciales por defecto para el usuario Administrador inicial
SEED_ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@dulcevicio.com")
SEED_ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "Admin123!")
SEED_ADMIN_NOMBRE = os.getenv("SEED_ADMIN_NOMBRE", "Administrador Dulce Vicio")

# Productos iniciales de la boutique con imágenes de demostración
PRODUCTOS_INICIALES = [
    {
        "nombre": "Tarta de Frutillas con Crema",
        "precio_final": 12500.00,
        "cuotas_cantidad": 3,
        "cuotas_valor": 4166.67,
        "garantia_meses": 0,
        "stock": 15,
        "imagen_url": "/demo/tarta-frutilla.svg",
    },
    {
        "nombre": "Chocotorta Tradicional",
        "precio_final": 14000.00,
        "cuotas_cantidad": 3,
        "cuotas_valor": 4666.67,
        "garantia_meses": 0,
        "stock": 20,
        "imagen_url": "/demo/chocotorta.svg",
    },
    {
        "nombre": "Box Macarons Surtidos (12 u.)",
        "precio_final": 9800.00,
        "cuotas_cantidad": 1,
        "cuotas_valor": 9800.00,
        "garantia_meses": 0,
        "stock": 25,
        "imagen_url": "/demo/box-macarons.svg",
    },
    {
        "nombre": "Lemon Pie Gourmet",
        "precio_final": 11200.00,
        "cuotas_cantidad": 2,
        "cuotas_valor": 5600.00,
        "garantia_meses": 0,
        "stock": 12,
        "imagen_url": "/demo/lemon-pie.svg",
    },
    {
        "nombre": "Cheesecake de Frutos Rojos",
        "precio_final": 13500.00,
        "cuotas_cantidad": 3,
        "cuotas_valor": 4500.00,
        "garantia_meses": 0,
        "stock": 18,
        "imagen_url": "/demo/tarta-frutilla.svg",
    },
    {
        "nombre": "Box Alfajores Artesanales (6 u.)",
        "precio_final": 6500.00,
        "cuotas_cantidad": 1,
        "cuotas_valor": 6500.00,
        "garantia_meses": 0,
        "stock": 30,
        "imagen_url": "/demo/box-macarons.svg",
    },
]


def ejecutar_seed():
    """Ejecuta la carga inicial de datos verificando previamente la existencia (idempotencia)."""
    logger.info("Iniciando verificación y carga de datos iniciales en Dulce Vicio...")

    # Asegurar creación de tablas
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # 1. Crear Usuario Admin Idempotente
        admin_existente = db.query(Usuario).filter(Usuario.email == SEED_ADMIN_EMAIL.strip().lower()).first()
        if not admin_existente:
            logger.info(f"Creando usuario Administrador inicial ({SEED_ADMIN_EMAIL})...")
            admin_usuario = Usuario(
                nombre=SEED_ADMIN_NOMBRE,
                email=SEED_ADMIN_EMAIL.strip().lower(),
                hashed_password=obtener_password_hash(SEED_ADMIN_PASSWORD),
                rol="admin",
                activo=True,
                acepto_tratamiento=True,
            )
            db.add(admin_usuario)
            db.commit()
            logger.info("✔ Usuario Administrador creado con éxito.")
        else:
            logger.info(f"✔ Usuario Administrador ({SEED_ADMIN_EMAIL}) ya existe en la base de datos.")

        # 2. Poblar Productos Iniciales Idempotentes
        productos_creados = 0
        for p_data in PRODUCTOS_INICIALES:
            prod_existente = db.query(Producto).filter(Producto.nombre == p_data["nombre"]).first()
            if not prod_existente:
                producto = Producto(**p_data)
                db.add(producto)
                productos_creados += 1

        if productos_creados > 0:
            db.commit()
            logger.info(f"✔ Se insertaron {productos_creados} productos base en el catálogo.")
        else:
            logger.info("✔ Los productos base ya se encuentran cargados en el catálogo.")

        logger.info("¡Seeding de Dulce Vicio finalizado con éxito! 🍰")

    except Exception as exc:
        db.rollback()
        logger.error(f"Error al ejecutar el seeding: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    ejecutar_seed()
