from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate


def crear_producto(db: Session, datos: ProductoCreate) -> Producto:
    """Crea un nuevo producto en el catálogo de Dulce Vicio."""
    producto = Producto(
        nombre=datos.nombre.strip(),
        precio_final=datos.precio_final,
        cuotas_cantidad=datos.cuotas_cantidad,
        cuotas_valor=datos.cuotas_valor,
        garantia_meses=datos.garantia_meses,
        stock=datos.stock,
    )
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


def listar_productos(
    db: Session,
    skip: int = 0,
    limit: int = 10,
    nombre: Optional[str] = None,
    precio_max: Optional[float] = None,
) -> Tuple[List[Producto], int]:
    """
    Lista productos con soporte para paginación (skip, limit),
    filtro por nombre y filtro por precio máximo.
    Retorna una tupla (lista_productos, total_registros).
    """
    query = db.query(Producto)

    if nombre:
        patron = f"%{nombre.strip()}%"
        query = query.filter(Producto.nombre.ilike(patron))

    if precio_max is not None and precio_max > 0:
        query = query.filter(Producto.precio_final <= precio_max)

    total = query.count()
    items = query.order_by(Producto.id.asc()).offset(skip).limit(limit).all()
    return items, total


def obtener_producto(db: Session, producto_id: int) -> Optional[Producto]:
    """Obtiene un producto específico por su ID."""
    return db.query(Producto).filter(Producto.id == producto_id).first()


def actualizar_producto(
    db: Session,
    producto_id: int,
    datos: ProductoUpdate
) -> Optional[Producto]:
    """Actualiza los datos de un producto existente."""
    producto = obtener_producto(db, producto_id)
    if not producto:
        return None

    update_data = datos.model_dump(exclude_unset=True)
    for campo, valor in update_data.items():
        if campo == "nombre" and valor is not None:
            valor = valor.strip()
        setattr(producto, campo, valor)

    db.commit()
    db.refresh(producto)
    return producto


def eliminar_producto(db: Session, producto_id: int) -> bool:
    """Elimina un producto del catálogo."""
    producto = obtener_producto(db, producto_id)
    if not producto:
        return False

    db.delete(producto)
    db.commit()
    return True
