from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.schemas.producto import ProductoOut


class RevocacionPublicaRequest(BaseModel):
    pedido_id: int = Field(..., description="ID del pedido a revocar")
    email: EmailStr = Field(..., description="Correo electrónico asociado al pedido")


class ItemIn(BaseModel):
    producto_id: int = Field(..., description="ID del postre/producto a comprar")
    cantidad: int = Field(..., gt=0, description="Cantidad de unidades requeridas (debe ser mayor a 0)")



class PedidoCreate(BaseModel):
    items: List[ItemIn] = Field(..., min_length=1, description="Lista de ítems del pedido (no puede estar vacía)")


class ItemOut(BaseModel):
    id: int
    producto_id: int
    cantidad: int
    precio_unitario: float
    producto: Optional[ProductoOut] = None

    model_config = ConfigDict(from_attributes=True)


class SolicitudRevocacionOut(BaseModel):
    id: int
    codigo: str
    pedido_id: int
    usuario_id: int
    creada_en: datetime

    model_config = ConfigDict(from_attributes=True)


class PedidoOut(BaseModel):
    id: int
    usuario_id: int
    estado: str
    total: float
    fecha_creacion: datetime
    items: List[ItemOut]
    solicitud_revocacion: Optional[SolicitudRevocacionOut] = None

    model_config = ConfigDict(from_attributes=True)


class UsuarioClienteOut(BaseModel):
    id: int
    nombre: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class DetallePedidoOut(BaseModel):
    id: int
    producto_id: int
    producto_nombre: str
    cantidad: int
    precio_unitario: float

    model_config = ConfigDict(from_attributes=True)


class PedidoAdminOut(BaseModel):
    id: int
    fecha: datetime
    fecha_creacion: datetime
    estado: str
    monto_total: float
    total: float
    usuario: UsuarioClienteOut
    detalles: List[DetallePedidoOut]

    model_config = ConfigDict(from_attributes=True)


class PedidoEstadoUpdate(BaseModel):
    estado: str = Field(..., description="Nuevo estado del pedido (ej. 'confirmado', 'en preparación', 'listo para entrega', 'entregado', 'cancelado', 'revocado')")

