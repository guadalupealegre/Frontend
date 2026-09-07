"""
Módulo de compatibilidad para importar Base, SessionLocal y engine directamente desde app.database.
"""
from app.db.database import Base, SessionLocal, engine, crear_engine_seguro

__all__ = ["Base", "SessionLocal", "engine", "crear_engine_seguro"]
