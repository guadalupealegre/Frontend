from decimal import Decimal
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.producto import Producto
from app.models.pedido import Pedido
from app.models.item_pedido import ItemPedido
from app.models.usuario import Usuario
from app.schemas.pedido import PedidoCreate


def crear_pedido(db: Session, usuario: Usuario, datos: PedidoCreate) -> Pedido:
    """
    Crea un pedido de forma transaccional:
    1. Valida existencia de cada producto (404 si no existe).
    2. Valida stock suficiente (409 con detalle descriptivo si falta stock).
    3. Descuenta el stock y acumula el total oficial desde la base de datos.
    4. Congela el precio unitario en cada ItemPedido.
    5. Realiza rollback automático en caso de error o conflicto.
    """
    if not datos.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El pedido debe contener al menos un producto.",
        )

    try:
        total_acumulado = Decimal("0.00")
        items_a_guardar: List[ItemPedido] = []

        # Crear la instancia del pedido vinculada al usuario autenticado
        pedido = Pedido(
            usuario_id=usuario.id,
            estado="pendiente",
            total=0.00,
        )
        db.add(pedido)
        db.flush()  # Obtener pedido.id asignado en la sesión activa

        for item_in in datos.items:
            # Buscar el producto en la base de datos
            producto = db.query(Producto).filter(Producto.id == item_in.producto_id).first()
            if not producto:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con ID {item_in.producto_id} no encontrado en el catálogo.",
                )

            # Validar stock disponible
            if producto.stock < item_in.cantidad:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"No hay stock suficiente para {producto.nombre}. Quedan {producto.stock} unidades.",
                )

            # Descontar stock
            producto.stock -= item_in.cantidad

            # Calcular total con precio vigente en la base de datos
            precio_unitario_dec = Decimal(str(producto.precio_final))
            subtotal = precio_unitario_dec * item_in.cantidad
            total_acumulado += subtotal

            # Crear item congelando el precio unitario
            item_pedido = ItemPedido(
                pedido_id=pedido.id,
                producto_id=producto.id,
                cantidad=item_in.cantidad,
                precio_unitario=precio_unitario_dec,
            )
            items_a_guardar.append(item_pedido)
            db.add(item_pedido)

        # Asignar total final al pedido
        pedido.total = total_acumulado

        # Confirmar toda la transacción
        db.commit()
        db.refresh(pedido)
        return pedido

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error transaccional al procesar el pedido: {str(exc)}",
        )


def listar_pedidos_usuario(db: Session, usuario_id: int) -> List[Pedido]:
    """
    Retorna la lista de pedidos de un usuario ordenados del más nuevo al más viejo.
    """
    return (
        db.query(Pedido)
        .filter(Pedido.usuario_id == usuario_id)
        .order_by(Pedido.fecha_creacion.desc(), Pedido.id.desc())
        .all()
    )


def obtener_pedido_usuario(db: Session, pedido_id: int, usuario_id: int) -> Optional[Pedido]:
    """
    Obtiene un pedido específico si pertenece al usuario solicitante.
    """
    return (
        db.query(Pedido)
        .filter(Pedido.id == pedido_id, Pedido.usuario_id == usuario_id)
        .first()
    )
