from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.core.security import decodificar_token
from app.models.usuario import Usuario

# Esquema de autenticación OAuth2 apuntando al endpoint de login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_db() -> Generator[Session, None, None]:
    """Generador de sesión de base de datos."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Valida el token de acceso JWT y recupera el usuario actual de la base de datos.
    Verifica que el tipo de token sea 'access'.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales de acceso.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decodificar_token(token)
        email: str = payload.get("sub")
        tipo: str = payload.get("tipo")

        if email is None or tipo != "access":
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if usuario is None:
        raise credentials_exception

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La cuenta del usuario ha sido dada de baja o se encuentra inactiva.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return usuario


def require_admin(
    current_user: Usuario = Depends(get_current_user)
) -> Usuario:
    """
    Verifica que el usuario autenticado tenga el rol de 'admin'.
    Deniega el acceso con código 403 si el rol es 'cliente' u otro.
    """
    if current_user.rol != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso restringido: se requieren permisos de administrador de Dulce Vicio.",
        )
    return current_user
