from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.security import hash_password, verificar_password, crear_token, decodificar_token
from app.dependencies import get_db, get_current_user
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate, UsuarioOut, Token, RefreshTokenRequest

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post(
    "/register",
    response_model=UsuarioOut,
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo usuario con consentimiento legal (Ley 25.326)"
)
def registrar_usuario(
    datos: UsuarioCreate,
    db: Session = Depends(get_db)
):
    """
    Registra un nuevo usuario en la plataforma Dulce Vicio.
    Requiere consentimiento explícito para el tratamiento de datos personales conforme a la Ley 25.326.
    Almacena fecha y hora exacta del consentimiento y encripta la contraseña con bcrypt.
    """
    # Verificar si el correo ya existe
    usuario_existente = db.query(Usuario).filter(Usuario.email == datos.email.lower().strip()).first()
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ingresado ya se encuentra registrado en Dulce Vicio."
        )

    # Crear usuario con fecha de consentimiento y contraseña hasheada
    nuevo_usuario = Usuario(
        nombre=datos.nombre.strip(),
        email=datos.email.lower().strip(),
        hashed_password=hash_password(datos.password),
        rol="cliente",
        acepto_tratamiento=datos.acepto_tratamiento,
        fecha_consentimiento=datetime.now(timezone.utc)
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


@router.post(
    "/login",
    response_model=Token,
    summary="Iniciar sesión con OAuth2 (x-www-form-urlencoded)"
)
def iniciar_sesion(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Autentica al usuario mediante email y contraseña.
    Responde con tokens JWT de acceso y refresco.
    En caso de error, responde 401 sin revelar si el dato incorrecto fue el email o la contraseña.
    """
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username.lower().strip()).first()
    
    if not usuario or not verificar_password(form_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas. Por favor verifique su correo electrónico y contraseña.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Generar access token y refresh token
    token_payload = {
        "sub": usuario.email,
        "rol": usuario.rol,
        "usuario_id": usuario.id,
    }
    access_token = crear_token(data=token_payload, tipo="access")
    refresh_token = crear_token(data=token_payload, tipo="refresh")

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        usuario=UsuarioOut.model_validate(usuario)
    )


@router.post(
    "/refresh",
    summary="Renovar access token mediante refresh token"
)
def refrescar_token(
    datos: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Valida un refresh token JWT y entrega un nuevo access token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="El token de actualización es inválido o ha expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decodificar_token(datos.refresh_token)
        email: str = payload.get("sub")
        tipo: str = payload.get("tipo")

        if not email or tipo != "refresh":
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        raise credentials_exception

    # Crear nuevo token de acceso
    token_payload = {
        "sub": usuario.email,
        "rol": usuario.rol,
        "usuario_id": usuario.id,
    }
    nuevo_access_token = crear_token(data=token_payload, tipo="access")

    return {
        "access_token": nuevo_access_token,
        "token_type": "bearer"
    }


@router.get(
    "/me",
    response_model=UsuarioOut,
    summary="Obtener perfil del usuario autenticado"
)
def obtener_perfil(
    current_user: Usuario = Depends(get_current_user)
):
    """
    Devuelve los datos del usuario autenticado actualmente.
    """
    return current_user
