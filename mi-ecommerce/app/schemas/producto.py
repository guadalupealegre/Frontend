from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class ProductoBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100, description="Nombre del postre")
    precio_final: float = Field(..., gt=0, description="Precio final al consumidor (Ley 24.240)")
    cuotas_cantidad: int = Field(default=1, ge=1, description="Cantidad de cuotas disponibles")
    cuotas_valor: float = Field(..., gt=0, description="Monto exacto de cada cuota")
    garantia_meses: int = Field(default=0, ge=0, description="Garantía en meses (0 para productos perecederos)")
    stock: int = Field(default=0, ge=0, description="Stock disponible en unidades")


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    precio_final: Optional[float] = Field(None, gt=0)
    cuotas_cantidad: Optional[int] = Field(None, ge=1)
    cuotas_valor: Optional[float] = Field(None, gt=0)
    garantia_meses: Optional[int] = Field(None, ge=0)
    stock: Optional[int] = Field(None, ge=0)


class ProductoOut(ProductoBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class PaginatedProductos(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[ProductoOut]
