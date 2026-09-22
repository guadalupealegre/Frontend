import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.core.config import settings
from app.db.database import Base, engine
# Importar todos los modelos para asegurar su registro en Base.metadata
import app.models.producto
import app.models.usuario
import app.models.pedido
import app.models.item_pedido
import app.models.solicitud_revocacion
from app.routers import auth_router, productos_router, pedidos_router, usuarios_router

# Garantizar creación del directorio de subidas de archivos
os.makedirs("uploads/productos", exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Creación automática de todas las tablas en la base de datos al iniciar la app
    Base.metadata.create_all(bind=engine)

    # Migración defensiva en SQLite para agregar la columna imagen_url si la tabla ya existía
    try:
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE productos ADD COLUMN imagen_url VARCHAR(255);"))
            conn.commit()
    except Exception:
        pass  # La columna ya existe

    yield


# Inicialización de la aplicación FastAPI para "Dulce Vicio"
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API E-Commerce de alta gama para Dulce Vicio - Repostería y Postres Artesanales. Cumple con la normativa comercial y de protección de datos de la República Argentina.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Garantizar creación de tablas a nivel de módulo
Base.metadata.create_all(bind=engine)
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE productos ADD COLUMN imagen_url VARCHAR(255);"))
        conn.commit()
except Exception:
    pass

# Configuración de Middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar servidor de archivos estáticos para la carpeta uploads con el prefijo /static
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# Inclusión de Routers
app.include_router(auth_router)
app.include_router(productos_router)
app.include_router(pedidos_router)
app.include_router(usuarios_router)


@app.get(
    "/",
    tags=["Información Legal & Estado"],
    summary="Mensaje institucional y declaración de cumplimiento legal (Ley 24.240, Res. 424/2020 y Ley 25.326)"
)
def read_root():
    """
    Punto de entrada raíz de la API de Dulce Vicio.
    Expone explícitamente el cumplimiento del marco legal argentino vigente para e-commerce.
    """
    return {
        "tienda": "Dulce Vicio - Repostería y Postres Artesanales",
        "mensaje": "Bienvenido a la API oficial de Dulce Vicio.",
        "estado": "operativo",
        "version": "1.0.0",
        "marco_legal_argentino": {
            "defensa_del_consumidor": {
                "norma": "Ley N° 24.240 de Defensa del Consumidor",
                "descripcion": "Garantía de información clara, veraz y detallada sobre precios finales de contado, esquemas de cuotas y condiciones de garantía de productos."
            },
            "boton_de_arrepentimiento": {
                "norma": "Resolución N° 424/2020 de la Secretaría de Comercio Interior",
                "descripcion": "Disponibilidad del Botón de Arrepentimiento en la plataforma para la revocación de la compra dentro del plazo legal de diez (10) días corridos a partir de la entrega del producto o celebración del contrato."
            },
            "proteccion_datos_personales": {
                "norma": "Ley N° 25.326 de Protección de los Datos Personales",
                "descripcion": "Tratamiento de datos personales bajo consentimiento previo, expreso e informado. Registro de consentimiento de usuarios y ejercicio de derechos de acceso, rectificación y supresión."
            }
        }
    }


@app.get(
    "/health",
    tags=["Información Legal & Estado"],
    summary="Health check del servicio"
)
def health_check():
    """Verificación de estado de salud del servidor."""
    return {"status": "healthy", "service": "Dulce Vicio API"}
