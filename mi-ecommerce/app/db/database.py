import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

logger = logging.getLogger("dulcevicio.database")


def crear_engine_seguro():
    """
    Crea el motor de base de datos SQLAlchemy con manejo robusto de errores.
    Soporta SQLite con 'check_same_thread: False'.
    Si se especifica PostgreSQL u otro motor pero ocurre un error de codificación
    (como UnicodeDecodeError en Windows con psycopg2) o falla de conexión,
    conmuta automáticamente a SQLite local seguro (sqlite:///./dulce_vicio.db).
    """
    db_url = getattr(settings, "DATABASE_URL", "sqlite:///./dulce_vicio.db")

    if not db_url or db_url.startswith("sqlite"):
        return create_engine(
            db_url or "sqlite:///./dulce_vicio.db",
            connect_args={"check_same_thread": False},
        )

    try:
        eng = create_engine(db_url, pool_pre_ping=True)
        # Probar conexión real de forma segura
        with eng.connect():
            pass
        return eng
    except (Exception, UnicodeDecodeError) as exc:
        logger.warning(
            f"Fallo de conexión o codificación con '{db_url}' ({exc}). "
            f"Conmutando automáticamente a SQLite (sqlite:///./dulce_vicio.db)"
        )
        return create_engine(
            "sqlite:///./dulce_vicio.db",
            connect_args={"check_same_thread": False},
        )


engine = crear_engine_seguro()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
