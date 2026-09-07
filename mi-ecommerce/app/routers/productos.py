from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_admin
from app.models.usuario import Usuario
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoOut, PaginatedProductos
from app.services import productos as productos_service

router = APIRouter(prefix="/productos", tags=["Productos y Catálogo"])


@router.get(
    "/",
    response_model=PaginatedProductos,
    summary="Listar catálogo de postres con filtros y paginación (Público)"
)
def listar_catalogo(
    skip: int = Query(0, ge=0, description="Cantidad de registros a omitir para paginación"),
    limit: int = Query(10, ge=1, le=100, description="Cantidad de registros por página"),
    nombre: Optional[str] = Query(None, description="Filtro de búsqueda por nombre de postre"),
    precio_max: Optional[float] = Query(None, gt=0, description="Filtro de precio máximo"),
    db: Session = Depends(get_db)
):
    """
    Retorna el catálogo público de repostería de Dulce Vicio,
    cumpliendo con la Ley 24.240 de información clara sobre precios, cuotas y garantías.
    """
    items, total = productos_service.listar_productos(
        db=db,
        skip=skip,
        limit=limit,
        nombre=nombre,
        precio_max=precio_max
    )
    return PaginatedProductos(
        total=total,
        skip=skip,
        limit=limit,
        items=[ProductoOut.model_validate(p) for p in items]
    )


@router.get(
    "/{producto_id}",
    response_model=ProductoOut,
    summary="Obtener detalle de un postre por ID (Público)"
)
def obtener_detalle_producto(
    producto_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene la información completa de un postre específico.
    """
    producto = productos_service.obtener_producto(db=db, producto_id=producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El producto con ID {producto_id} no fue encontrado en el catálogo de Dulce Vicio."
        )
    return producto


@router.post(
    "/",
    response_model=ProductoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo postre en el catálogo (Solo Administrador)"
)
def crear_nuevo_producto(
    datos: ProductoCreate,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """
    Crea un nuevo postre en el catálogo. Requiere permisos de Administrador.
    """
    nuevo_producto = productos_service.crear_producto(db=db, datos=datos)
    return nuevo_producto


@router.put(
    "/{producto_id}",
    response_model=ProductoOut,
    summary="Actualizar información de un postre (Solo Administrador)"
)
def actualizar_datos_producto(
    producto_id: int,
    datos: ProductoUpdate,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """
    Actualiza el precio, cuotas, stock o garantía de un postre. Requiere permisos de Administrador.
    """
    producto_actualizado = productos_service.actualizar_producto(
        db=db,
        producto_id=producto_id,
        datos=datos
    )
    if not producto_actualizado:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se pudo actualizar: el producto con ID {producto_id} no existe."
        )
    return producto_actualizado


@router.delete(
    "/{producto_id}",
    summary="Eliminar un postre del catálogo (Solo Administrador)"
)
def eliminar_producto_catalogo(
    producto_id: int,
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """
    Elimina un postre del catálogo. Requiere permisos de Administrador.
    """
    exito = productos_service.eliminar_producto(db=db, producto_id=producto_id)
    if not exito:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se pudo eliminar: el producto con ID {producto_id} no existe."
        )
    return {"mensaje": f"El producto con ID {producto_id} ha sido eliminado correctamente del catálogo."}
