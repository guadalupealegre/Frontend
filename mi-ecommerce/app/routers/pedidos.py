from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user, get_current_admin_user
from app.models.usuario import Usuario
from app.schemas.pedido import (
    PedidoCreate,
    PedidoOut,
    SolicitudRevocacionOut,
    RevocacionPublicaRequest,
    PedidoAdminOut,
    PedidoEstadoUpdate,
)
from app.services import pedido_service

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos & Compras Transaccionales"],
)

admin_pedidos_router = APIRouter(
    prefix="/admin/pedidos",
    tags=["Administración - Pedidos"],
)


@admin_pedidos_router.get(
    "",
    response_model=List[PedidoAdminOut],
    summary="Listar todos los pedidos de clientes (Solo Admin)",
    description="Retorna la lista completa de todos los pedidos realizados por los clientes en la tienda Dulce Vicio, ordenados del más reciente al más antiguo.",
)
def admin_listar_todos_los_pedidos(
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(get_current_admin_user),
):
    """
    Endpoint de administración exclusivo para listar la totalidad de pedidos realizados por los clientes.
    """
    return pedido_service.listar_todos_los_pedidos(db=db)


@admin_pedidos_router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoAdminOut,
    summary="Actualizar estado de un pedido (Solo Admin)",
    description="Permite al administrador modificar el estado de un pedido (ej: 'confirmado', 'en preparación', 'listo para entrega', 'entregado', 'cancelado', 'revocado').",
)
def admin_actualizar_estado_pedido(
    pedido_id: int,
    datos: PedidoEstadoUpdate,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(get_current_admin_user),
):
    """
    Endpoint de administración exclusivo para cambiar el estado transaccional de un pedido.
    """
    return pedido_service.actualizar_estado_pedido(
        db=db,
        pedido_id=pedido_id,
        nuevo_estado=datos.estado,
    )



@router.post(
    "/revocacion-publica",
    response_model=SolicitudRevocacionOut,
    status_code=status.HTTP_201_CREATED,
    summary="Revocación pública sin token (Disp. 954/2025)",
    description="Permite revocar un pedido públicamente mediante ID de pedido y e-mail sin requerir header Authorization."
)
def revocar_pedido_publico(
    datos: RevocacionPublicaRequest,
    db: Session = Depends(get_db),
):
    """
    Endpoint público de revocación de compra sin token.
    """
    return pedido_service.revocar_publico(db=db, pedido_id=datos.pedido_id, email=datos.email)



@router.post(
    "/",
    response_model=PedidoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo pedido transaccional (Clase 8)",
    description="Crea un pedido validando existencia y stock en base de datos. Descuenta el stock y congela el precio unitario.",
)
def crear_nuevo_pedido(
    datos: PedidoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Endpoint protegido para la creación transaccional de pedidos.
    Solo requiere lista de ítems con producto_id y cantidad.
    """
    return pedido_service.crear_pedido(db=db, usuario=current_user, datos=datos)


@router.get(
    "/mios",
    response_model=List[PedidoOut],
    summary="Listar pedidos del usuario autenticado",
    description="Retorna el historial de compras del usuario actual ordenado del más nuevo al más viejo. Declarado antes de /{pedido_id}.",
)
def listar_mis_pedidos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Retorna todos los pedidos pertenecientes al usuario en sesión.
    """
    return pedido_service.listar_pedidos_usuario(db=db, usuario_id=current_user.id)


@router.post(
    "/{pedido_id}/revocacion",
    response_model=SolicitudRevocacionOut,
    status_code=status.HTTP_201_CREATED,
    summary="Ejercer derecho de arrepentimiento / revocar compra (Ley 24.240 Art. 34 / Disp. 954/2025)",
    description="Revoca una compra dentro del plazo legal de 10 días corridos. Reincorpora el stock y genera el código ARR-YYYYMMDD-XXXXXX.",
)
def revocar_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Endpoint de revocación transaccional con generación de comprobante legal oficial.
    """
    return pedido_service.revocar(db=db, usuario=current_user, pedido_id=pedido_id)


@router.get(
    "/{pedido_id}",
    response_model=PedidoOut,
    summary="Obtener detalle de un pedido específico",
    description="Retorna el detalle completo de un pedido si pertenece al usuario autenticado. Lanza 404 si no existe.",
)
def obtener_mi_pedido(
    pedido_id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Retorna un pedido específico del usuario.
    """
    pedido = pedido_service.obtener_pedido_usuario(
        db=db,
        pedido_id=pedido_id,
        usuario_id=current_user.id,
    )
    if not pedido:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pedido con ID {pedido_id} no encontrado o no pertenece a su cuenta.",
        )
    return pedido
