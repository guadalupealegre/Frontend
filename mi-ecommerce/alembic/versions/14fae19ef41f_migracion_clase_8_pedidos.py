"""migracion_clase_8_pedidos

Revision ID: 14fae19ef41f
Revises: 
Create Date: 2026-09-07 13:09:20.671739

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '14fae19ef41f'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('items_pedido', schema=None) as batch_op:
        batch_op.alter_column('precio_unitario',
                   existing_type=sa.FLOAT(),
                   type_=sa.Numeric(precision=12, scale=2),
                   existing_nullable=False)

    with op.batch_alter_table('pedidos', schema=None) as batch_op:
        batch_op.alter_column('total',
                   existing_type=sa.FLOAT(),
                   type_=sa.Numeric(precision=12, scale=2),
                   existing_nullable=False)


def downgrade() -> None:
    with op.batch_alter_table('pedidos', schema=None) as batch_op:
        batch_op.alter_column('total',
                   existing_type=sa.Numeric(precision=12, scale=2),
                   type_=sa.FLOAT(),
                   existing_nullable=False)

    with op.batch_alter_table('items_pedido', schema=None) as batch_op:
        batch_op.alter_column('precio_unitario',
                   existing_type=sa.Numeric(precision=12, scale=2),
                   type_=sa.FLOAT(),
                   existing_nullable=False)
