import json
import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.dependencies import get_db, get_current_user
from app.models.usuario import Usuario
from app.models.pedido import Pedido
from app.models.solicitud_revocacion import SolicitudRevocacion
from app.schemas.usuario import DatosUsuarioCompleto, UsuarioOut, SolicitudRevocacionSimple
from app.schemas.pedido import PedidoOut

router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios & Protección de Datos (Ley 25.326)"],
)


@router.get(
    "/me/datos",
    response_model=DatosUsuarioCompleto,
    summary="Consultar todos los datos personales y registros de compras (Ley 25.326 Art. 14)",
    description="Ejerce el derecho de acceso retornando el perfil del usuario, consentimiento informado, pedidos y solicitudes de revocación registradas.",
)
def obtener_mis_datos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Retorna el informe consolidado de datos almacenados del usuario autenticado.
    """
    pedidos = (
        db.query(Pedido)
        .filter(Pedido.usuario_id == current_user.id)
        .order_by(Pedido.fecha_creacion.desc())
        .all()
    )

    solicitudes = (
        db.query(SolicitudRevocacion)
        .filter(SolicitudRevocacion.usuario_id == current_user.id)
        .order_by(SolicitudRevocacion.creada_en.desc())
        .all()
    )

    pedidos_out = [PedidoOut.model_validate(p) for p in pedidos]
    solicitudes_out = [SolicitudRevocacionSimple.model_validate(s) for s in solicitudes]

    return DatosUsuarioCompleto(
        usuario=UsuarioOut.model_validate(current_user),
        pedidos=pedidos_out,
        solicitudes_revocacion=solicitudes_out,
    )


@router.get(
    "/me/exportar",
    summary="Exportar y descargar datos personales en archivo JSON (Portabilidad Ley 25.326)",
    description="Genera y descarga un archivo JSON estructurado con todos los datos del titular.",
)
def exportar_mis_datos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Descarga directa de archivo mis_datos.json con codificación UTF-8 y serialización segura.
    """
    pedidos = (
        db.query(Pedido)
        .filter(Pedido.usuario_id == current_user.id)
        .order_by(Pedido.fecha_creacion.desc())
        .all()
    )

    solicitudes = (
        db.query(SolicitudRevocacion)
        .filter(SolicitudRevocacion.usuario_id == current_user.id)
        .order_by(SolicitudRevocacion.creada_en.desc())
        .all()
    )

    datos_a_exportar = {
        "exportado_el": datetime.now(timezone.utc).isoformat(),
        "marco_legal": {
            "norma": "Ley N° 25.326 de Protección de los Datos Personales",
            "titular_derecho": current_user.nombre,
            "entidad_emisora": "Dulce Vicio - Repostería y Postres Artesanales",
        },
        "usuario": {
            "id": current_user.id,
            "nombre": current_user.nombre,
            "email": current_user.email,
            "rol": current_user.rol,
            "activo": current_user.activo,
            "acepto_tratamiento": current_user.acepto_tratamiento,
            "fecha_consentimiento": current_user.fecha_consentimiento.isoformat() if current_user.fecha_consentimiento else None,
            "fecha_baja": current_user.fecha_baja.isoformat() if current_user.fecha_baja else None,
        },
        "pedidos": [
            {
                "id": p.id,
                "estado": p.estado,
                "total": float(p.total),
                "fecha_creacion": p.fecha_creacion.isoformat() if p.fecha_creacion else None,
                "items": [
                    {
                        "id": it.id,
                        "producto_id": it.producto_id,
                        "producto_nombre": it.producto.nombre if it.producto else None,
                        "cantidad": it.cantidad,
                        "precio_unitario": float(it.precio_unitario),
                    }
                    for it in p.items
                ],
            }
            for p in pedidos
        ],
        "solicitudes_revocacion": [
            {
                "id": s.id,
                "codigo": s.codigo,
                "pedido_id": s.pedido_id,
                "creada_en": s.creada_en.isoformat() if s.creada_en else None,
            }
            for s in solicitudes
        ],
    }

    contenido_json = json.dumps(datos_a_exportar, default=str, indent=2, ensure_ascii=False)

    return Response(
        content=contenido_json,
        media_type="application/json; charset=utf-8",
        headers={
            "Content-Disposition": 'attachment; filename="mis_datos.json"',
        },
    )


@router.delete(
    "/me",
    summary="Baja de cuenta y anonimización de datos personales (Ley 25.326 Art. 16)",
    description="Ejerce el derecho de supresión/cancelación. Anonimiza datos personales manteniendo registros transaccionales por obligación contable.",
)
def dar_de_baja_cuenta(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """
    Anonimiza nombre, correo y contraseña del usuario.
    Marca activo=False y asigna fecha_baja.
    """
    usuario_id = current_user.id

    # Anonimizar datos identificatorios
    current_user.nombre = f"Usuario Anonimizado {usuario_id}"
    current_user.email = f"usuario_baja_{usuario_id}@anonimo.com"
    # Reemplazar contraseña con hash aleatorio imposible de autenticar
    current_user.hashed_password = hash_password(secrets.token_hex(20))
    current_user.activo = False
    current_user.fecha_baja = datetime.now(timezone.utc)

    db.commit()

    return {
        "mensaje": "Su cuenta ha sido dada de baja y sus datos personales han sido anonimizados conforme a la Ley N° 25.326.",
        "usuario_id": usuario_id,
        "activo": False,
        "fecha_baja": current_user.fecha_baja,
    }
