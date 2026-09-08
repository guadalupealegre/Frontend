from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.usuario import Usuario
from app.schemas.pedido import PedidoCreate, PedidoOut
from app.services import pedido_service

router = APIRouter(
    prefix="/pedidos",
    tags=["Pedidos & Compras Transaccionales"],
)


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
