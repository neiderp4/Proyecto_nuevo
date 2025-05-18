import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

from app.db.base import Base  # importa todos los modelos registrados en base.py
from app.core.config import settings  # trae la URI de conexión desde config.py

# Configuración del archivo alembic.ini
config = context.config
fileConfig(config.config_file_name)

# Sobrescribe la URL desde config.py
config.set_main_option("sqlalchemy.url", settings.SQLALCHEMY_DATABASE_URI)

# Vincula metadatos de los modelos
target_metadata = Base.metadata

def run_migrations_offline():
    context.configure(
        url=settings.SQLALCHEMY_DATABASE_URI,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

