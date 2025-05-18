"""crear tablas"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f14454f200fa'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'clientes',
        sa.Column('id_cliente', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=150), nullable=False),
        sa.Column('telefono', sa.String(length=20), nullable=True),
        sa.Column('email', sa.String(length=100), nullable=True),
        sa.Column('direccion', sa.String(length=255), nullable=True),
        sa.Column('fecha_registro', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id_cliente')
    )
    op.create_index('ix_clientes_id_cliente', 'clientes', ['id_cliente'])

    op.create_table(
        'productos',
        sa.Column('id_producto', sa.Integer(), nullable=False),
        sa.Column('nombre', sa.String(length=150), nullable=False),
        sa.Column('descripcion', sa.Text(), nullable=True),
        sa.Column('precio_unitario', sa.Numeric(10, 2), nullable=False),
        sa.Column('activo', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id_producto')
    )
    op.create_index('ix_productos_id_producto', 'productos', ['id_producto'])

    op.create_table(
        'ventas',
        sa.Column('id_venta', sa.Integer(), nullable=False),
        sa.Column('id_cliente', sa.Integer(), nullable=False),
        sa.Column('fecha_venta', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('tipo_venta', sa.Enum('contado', 'credito', name='tipo_venta_enum'), nullable=False),
        sa.Column('estado', sa.Enum('pendiente', 'pagada', 'cancelada', name='estado_enum'), nullable=True),
        sa.Column('total', sa.Numeric(10, 2), nullable=False),
        sa.ForeignKeyConstraint(['id_cliente'], ['clientes.id_cliente']),
        sa.PrimaryKeyConstraint('id_venta')
    )
    op.create_index('ix_ventas_id_venta', 'ventas', ['id_venta'])

    op.create_table(
        'detalles_venta',
        sa.Column('id_detalle', sa.Integer(), nullable=False),
        sa.Column('id_venta', sa.Integer(), nullable=False),
        sa.Column('id_producto', sa.Integer(), nullable=False),
        sa.Column('cantidad', sa.Integer(), nullable=False),
        sa.Column('precio_unitario', sa.Numeric(10, 2), nullable=False),
        sa.Column('subtotal', sa.Numeric(10, 2), nullable=False),
        sa.Column('fecha_entrega', sa.Date(), nullable=False),
        sa.ForeignKeyConstraint(['id_venta'], ['ventas.id_venta']),
        sa.ForeignKeyConstraint(['id_producto'], ['productos.id_producto']),
        sa.PrimaryKeyConstraint('id_detalle')
    )
    op.create_index('ix_detalles_venta_id_detalle', 'detalles_venta', ['id_detalle'])

    op.create_table(
        'pagos',
        sa.Column('id_pago', sa.Integer(), nullable=False),
        sa.Column('id_venta', sa.Integer(), nullable=False),
        sa.Column('fecha_pago', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.Column('monto', sa.Numeric(10, 2), nullable=False),
        sa.Column('metodo_pago', sa.String(length=50), nullable=True),
        sa.Column('observaciones', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['id_venta'], ['ventas.id_venta']),
        sa.PrimaryKeyConstraint('id_pago')
    )
    op.create_index('ix_pagos_id_pago', 'pagos', ['id_pago'])


def downgrade():
    op.drop_index('ix_pagos_id_pago', table_name='pagos')
    op.drop_table('pagos')
    op.drop_index('ix_detalles_venta_id_detalle', table_name='detalles_venta')
    op.drop_table('detalles_venta')
    op.drop_index('ix_ventas_id_venta', table_name='ventas')
    op.drop_table('ventas')
    op.drop_index('ix_productos_id_producto', table_name='productos')
    op.drop_table('productos')
    op.drop_index('ix_clientes_id_cliente', table_name='clientes')
    op.drop_table('clientes')
