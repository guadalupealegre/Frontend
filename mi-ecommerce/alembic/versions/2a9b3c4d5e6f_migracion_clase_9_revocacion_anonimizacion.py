"""migracion_clase_9_revocacion_anonimizacion

Revision ID: 2a9b3c4d5e6f
Revises: 14fae19ef41f
Create Date: 2026-09-14 08:30:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2a9b3c4d5e6f'
down_revision: Union[str, None] = '14fae19ef41f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Agregar columnas activo y fecha_baja a usuarios si no existen
    with op.batch_alter_table('usuarios', schema=None) as batch_op:
        batch_op.add_column(sa.Column('activo', sa.Boolean(), server_default='1', nullable=False))
        batch_op.add_column(sa.Column('fecha_baja', sa.DateTime(timezone=True), nullable=True))

    # 2. Crear tabla solicitudes_revocacion si no existe
    op.create_table(
        'solicitudes_revocacion',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('codigo', sa.String(length=50), nullable=False),
        sa.Column('pedido_id', sa.Integer(), sa.ForeignKey('pedidos.id', ondelete='CASCADE'), nullable=False),
        sa.Column('usuario_id', sa.Integer(), sa.ForeignKey('usuarios.id', ondelete='CASCADE'), nullable=False),
        sa.Column('creada_en', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('codigo'),
        sa.UniqueConstraint('pedido_id')
    )
    op.create_index(op.f('ix_solicitudes_revocacion_codigo'), 'solicitudes_revocacion', ['codigo'], unique=True)
    op.create_index(op.f('ix_solicitudes_revocacion_id'), 'solicitudes_revocacion', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_solicitudes_revocacion_id'), table_name='solicitudes_revocacion')
    op.drop_index(op.f('ix_solicitudes_revocacion_codigo'), table_name='solicitudes_revocacion')
    op.drop_table('solicitudes_revocacion')

    with op.batch_alter_table('usuarios', schema=None) as batch_op:
        batch_op.drop_column('fecha_baja')
        batch_op.drop_column('activo')
