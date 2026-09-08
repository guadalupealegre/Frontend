import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

# Agregar la ruta raíz de la aplicación a sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Importar configuración y modelos de la aplicación Dulce Vicio
from app.core.config import settings
from app.db.database import Base
# Importación explícita de todos los modelos para asegurar que Base.metadata los registre
import app.models.producto
import app.models.usuario
import app.models.pedido
import app.models.item_pedido

# Alembic Config object
config = context.config

# Interpretar archivo de configuración para logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Asignar metadata de los modelos para autogenerate
target_metadata = Base.metadata

# Sobrescribir sqlalchemy.url con el valor dinámico de settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)


def run_migrations_offline() -> None:
    """Ejecutar migraciones en modo 'offline'."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        render_as_batch=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Ejecutar migraciones en modo 'online'."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            render_as_batch=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
