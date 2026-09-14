from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.producto import ProductoOut


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
