from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload


from app.models.producto import Producto
from app.models.pedido import Pedido
from app.models.item_pedido import ItemPedido
from app.models.usuario import Usuario
from app.models.solicitud_revocacion import SolicitudRevocacion
from app.schemas.pedido import PedidoCreate


def crear_pedido(db: Session, usuario: Usuario, datos: PedidoCreate) -> Pedido:
    """
    Crea un pedido de forma transaccional:
    1. Valida existencia de cada producto (404 si no existe).
    2. Valida stock suficiente (409 con detalle descriptivo si falta stock).
    3. Descuenta el stock y acumula el total oficial desde la base de datos.
    4. Congela el precio unitario en cada ItemPedido.
    5. Realiza rollback automático inmediato en caso de error o falta de stock.
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
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con ID {item_in.producto_id} no encontrado en el catálogo.",
                )

            # Validar stock disponible
            if producto.stock < item_in.cantidad:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Stock insuficiente para {producto.nombre}. Quedan {producto.stock} unidades",
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


def generar_codigo_revocacion() -> str:
    """
    Genera un código único de revocación conforme a la Disp. 954/2025.
    Formato: ARR-YYYYMMDD-XXXXXX
    """
    import secrets
    fecha_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    sufijo_aleatorio = secrets.token_hex(3).upper()
    return f"ARR-{fecha_str}-{sufijo_aleatorio}"


def revocar(db: Session, usuario: Usuario, pedido_id: int) -> SolicitudRevocacion:
    """
    Servicio de Revocación de Compra conforme a la Ley 24.240 Art. 34 y Disp. 954/2025.
    """
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id, Pedido.usuario_id == usuario.id).first()
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pedido con ID {pedido_id} no encontrado o no pertenece a su cuenta.",
        )

    if pedido.estado.lower() == "cancelado":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El pedido ya se encuentra cancelado o revocado previamente.",
        )

    ahora_utc = datetime.now(timezone.utc)
    fecha_pedido = pedido.fecha_creacion
    if fecha_pedido.tzinfo is None:
        fecha_pedido = fecha_pedido.replace(tzinfo=timezone.utc)

    dias_transcurridos = (ahora_utc - fecha_pedido).total_seconds() / 86400
    if dias_transcurridos > 10:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El plazo legal de 10 días corridos para revocar la compra ha expirado conforme al Art. 34 de la Ley 24.240.",
        )

    try:
        for item in pedido.items:
            producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
            if producto:
                producto.stock += item.cantidad

        pedido.estado = "cancelado"

        codigo_generado = generar_codigo_revocacion()
        while db.query(SolicitudRevocacion).filter(SolicitudRevocacion.codigo == codigo_generado).first():
            codigo_generado = generar_codigo_revocacion()

        solicitud = SolicitudRevocacion(
            codigo=codigo_generado,
            pedido_id=pedido.id,
            usuario_id=usuario.id,
            creada_en=ahora_utc,
        )
        db.add(solicitud)

        db.commit()
        db.refresh(solicitud)
        db.refresh(pedido)
        return solicitud

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error transaccional al procesar la revocación del pedido: {str(exc)}",
        )


def revocar_publico(db: Session, pedido_id: int, email: str) -> SolicitudRevocacion:
    """
    Revocación pública sin token de autenticación (Disp. 954/2025).
    Verifica correo e ID de pedido dentro del plazo legal de 10 días corridos.
    """
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pedido con ID {pedido_id} no fue encontrado.",
        )

    if not pedido.usuario or pedido.usuario.email.lower().strip() != email.lower().strip():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El correo electrónico ingresado no coincide con el registrado en el pedido.",
        )

    if pedido.estado.lower() == "cancelado":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El pedido ya se encuentra cancelado o revocado previamente.",
        )

    ahora_utc = datetime.now(timezone.utc)
    fecha_pedido = pedido.fecha_creacion
    if fecha_pedido.tzinfo is None:
        fecha_pedido = fecha_pedido.replace(tzinfo=timezone.utc)

    dias_transcurridos = (ahora_utc - fecha_pedido).total_seconds() / 86400
    if dias_transcurridos > 10:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El plazo legal de 10 días corridos para revocar la compra ha expirado conforme al Art. 34 de la Ley 24.240.",
        )

    try:
        for item in pedido.items:
            producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
            if producto:
                producto.stock += item.cantidad

        pedido.estado = "cancelado"

        codigo_generado = generar_codigo_revocacion()
        while db.query(SolicitudRevocacion).filter(SolicitudRevocacion.codigo == codigo_generado).first():
            codigo_generado = generar_codigo_revocacion()

        solicitud = SolicitudRevocacion(
            codigo=codigo_generado,
            pedido_id=pedido.id,
            usuario_id=pedido.usuario_id,
            creada_en=ahora_utc,
        )
        db.add(solicitud)

        db.commit()
        db.refresh(solicitud)
        db.refresh(pedido)
        return solicitud

    except HTTPException:
        db.rollback()
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error transaccional al procesar la revocación pública: {str(exc)}",
        )


def listar_todos_los_pedidos(db: Session) -> List[Pedido]:
    """
    Retorna la lista completa de pedidos realizados por los clientes para el Administrador,
    ordenados del más reciente al más antiguo (order_by(Pedido.fecha_creacion.desc())).
    Carga las relaciones usuario e items con sus productos.
    """
    return (
        db.query(Pedido)
        .options(
            joinedload(Pedido.usuario),
            joinedload(Pedido.items).joinedload(ItemPedido.producto),
        )
        .order_by(Pedido.fecha_creacion.desc(), Pedido.id.desc())
        .all()
    )


def actualizar_estado_pedido(db: Session, pedido_id: int, nuevo_estado: str) -> Pedido:
    """
    Permite al administrador actualizar el estado del pedido (ej. 'confirmado', 'en preparación', 'listo para entrega', 'entregado', 'cancelado', 'revocado').
    """
    pedido = (
        db.query(Pedido)
        .options(
            joinedload(Pedido.usuario),
            joinedload(Pedido.items).joinedload(ItemPedido.producto),
        )
        .filter(Pedido.id == pedido_id)
        .first()
    )

    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pedido con ID {pedido_id} no fue encontrado.",
        )

    estado_normalizado = nuevo_estado.strip().lower()

    # Si pasa a cancelado/revocado y antes no lo estaba, reincorporar stock
    if estado_normalizado in ["cancelado", "revocado"] and pedido.estado.lower() not in ["cancelado", "revocado"]:
        for item in pedido.items:
            producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
            if producto:
                producto.stock += item.cantidad

    pedido.estado = estado_normalizado
    db.commit()
    db.refresh(pedido)
    return pedido


