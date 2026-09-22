import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, require_admin
from app.models.usuario import Usuario
from app.schemas.producto import ProductoCreate, ProductoUpdate, ProductoOut, PaginatedProductos
from app.services import productos as productos_service
from app.utils.archivos import parece_imagen, generar_nombre_seguro

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


@router.post(
    "/{producto_id}/imagen",
    response_model=ProductoOut,
    summary="Subir imagen oficial de un producto (Solo Administrador)"
)
async def subir_imagen_producto(
    producto_id: int,
    archivo: UploadFile = File(..., description="Archivo de imagen (FormData key: 'archivo')"),
    db: Session = Depends(get_db),
    admin_user: Usuario = Depends(require_admin)
):
    """
    Sube y asocia una imagen a un producto existente del catálogo.
    Aplica 3 validaciones estrictas en orden de costo:
    1. Extensión permitida (.jpg, .jpeg, .png, .webp) -> HTTP 415 si falla
    2. Tamaño menor a 2 MB -> HTTP 413 si falla
    3. Validación de Magic Numbers mediante parece_imagen() -> HTTP 415 si el contenido no es imagen real
    
    El archivo se almacena con un nombre seguro generado aleatoriamente.
    """
    # 0. Verificar si el producto existe
    producto = productos_service.obtener_producto(db=db, producto_id=producto_id)
    if not producto:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"El producto con ID {producto_id} no fue encontrado en el catálogo de Dulce Vicio."
        )

    # 1. Validación 1: Extensión del archivo
    nombre_original = archivo.filename or ""
    extension = os.path.splitext(nombre_original)[1].lower()
    extensiones_permitidas = {".jpg", ".jpeg", ".png", ".webp"}

    if extension not in extensiones_permitidas:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Formato no válido. La extensión '{extension}' no está permitida. Formatos válidos: .jpg, .jpeg, .png, .webp"
        )

    # 2. Leer contenido en memoria para validar tamaño y Magic Numbers
    contenido = await archivo.read()
    TAMANO_MAXIMO = 2 * 1024 * 1024  # 2 MB

    # Validación 2: Tamaño del archivo
    if len(contenido) > TAMANO_MAXIMO:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Imagen muy grande. El tamaño del archivo supera el máximo permitido de 2 MB."
        )

    # Validación 3: Verificación de Magic Numbers (Firma real)
    if not parece_imagen(contenido):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Formato no válido. La firma interna del archivo no corresponde a una imagen real JPG, PNG o WEBP."
        )

    # Guardar en disco con nombre seguro
    directorio_destino = os.path.join("uploads", "productos")
    os.makedirs(directorio_destino, exist_ok=True)

    nombre_seguro = generar_nombre_seguro(producto_id, extension)
    ruta_fisica = os.path.join(directorio_destino, nombre_seguro)

    with open(ruta_fisica, "wb") as f:
        f.write(contenido)

    # Actualizar URL relativa en la base de datos
    ruta_relativa = f"/static/productos/{nombre_seguro}"
    producto.imagen_url = ruta_relativa
    db.commit()
    db.refresh(producto)

    return producto
