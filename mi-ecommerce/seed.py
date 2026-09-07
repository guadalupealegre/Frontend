"""
Script de siembra (Seed) para inicializar la base de datos de Dulce Vicio.
Puebla los 7 productos iniciales de repostería y los usuarios de prueba (Admin y Cliente).
"""
import os
import sys
from datetime import datetime, timezone

# Asegurar codificación UTF-8 en consola de Windows
if sys.platform == "win32":
    try:
        import io
        if hasattr(sys.stdout, "buffer"):
            sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
        if hasattr(sys.stderr, "buffer"):
            sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")
    except Exception:
        pass

# Añadir ruta del backend al path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.database import SessionLocal, engine, Base
from app.models.producto import Producto
from app.models.usuario import Usuario
from app.models.pedido import Pedido
from app.models.item_pedido import ItemPedido
from app.core.security import hash_password


# Catálogo oficial de Dulce Vicio (7 postres)
PRODUCTOS_DULCE_VICIO = [
    {
        "nombre": "Tiramisú",
        "precio_final": 4500.0,
        "cuotas_cantidad": 1,
        "cuotas_valor": 4500.0,
        "garantia_meses": 0,
        "stock": 20,
    },
    {
        "nombre": "Brownie",
        "precio_final": 3000.0,
        "cuotas_cantidad": 1,
        "cuotas_valor": 3000.0,
        "garantia_meses": 0,
        "stock": 25,
    },
    {
        "nombre": "Chocotorta",
        "precio_final": 4000.0,
        "cuotas_cantidad": 1,
        "cuotas_valor": 4000.0,
        "garantia_meses": 0,
        "stock": 15,
    },
    {
        "nombre": "Turrón de Quaker",
        "precio_final": 4500.0,
        "cuotas_cantidad": 1,
        "cuotas_valor": 4500.0,
        "garantia_meses": 0,
        "stock": 30,
    },
    {
        "nombre": "Budín de pan",
        "precio_final": 2500.0,
        "cuotas_cantidad": 1,
        "cuotas_valor": 2500.0,
        "garantia_meses": 0,
        "stock": 10,
    },
    {
        "nombre": "Flan",
        "precio_final": 3000.0,
        "cuotas_cantidad": 1,
        "cuotas_valor": 3000.0,
        "garantia_meses": 0,
        "stock": 12,
    },
    {
        "nombre": "Cookie",
        "precio_final": 2000.0,
        "cuotas_cantidad": 1,
        "cuotas_valor": 2000.0,
        "garantia_meses": 0,
        "stock": 50,
    },
]

USUARIOS_INICIALES = [
    {
        "nombre": "Administrador Dulce Vicio",
        "email": "admin@dulcevicio.com",
        "password": "Admin123!",
        "rol": "admin",
        "acepto_tratamiento": True,
    },
    {
        "nombre": "Cliente Ejemplo",
        "email": "cliente@dulcevicio.com",
        "password": "Cliente123!",
        "rol": "cliente",
        "acepto_tratamiento": True,
    }
]


def poblar_base_de_datos():
    print("[Dulce Vicio] Creando tablas si no existen...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("\n[Dulce Vicio] Insertando catalogo de postres...")
        for item in PRODUCTOS_DULCE_VICIO:
            existente = db.query(Producto).filter(Producto.nombre == item["nombre"]).first()
            if not existente:
                prod = Producto(**item)
                db.add(prod)
                print(f"  [OK] Creado: {item['nombre']} - ${item['precio_final']} (Stock: {item['stock']})")
            else:
                # Actualizar datos si ya existe
                for k, v in item.items():
                    setattr(existente, k, v)
                print(f"  [UPDATE] Actualizado: {item['nombre']}")

        print("\n[Dulce Vicio] Creando usuarios base...")
        for usr in USUARIOS_INICIALES:
            existente = db.query(Usuario).filter(Usuario.email == usr["email"]).first()
            if not existente:
                nuevo_usr = Usuario(
                    nombre=usr["nombre"],
                    email=usr["email"],
                    hashed_password=hash_password(usr["password"]),
                    rol=usr["rol"],
                    acepto_tratamiento=usr["acepto_tratamiento"],
                    fecha_consentimiento=datetime.now(timezone.utc)
                )
                db.add(nuevo_usr)
                print(f"  [OK] Usuario creado: {usr['email']} (Rol: {usr['rol']}) [Clave: {usr['password']}]")
            else:
                print(f"  [INFO] Usuario existente: {usr['email']}")

        db.commit()
        print("\n[Dulce Vicio] Base de datos poblada y lista con exito!")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Error al poblar base de datos: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    poblar_base_de_datos()
