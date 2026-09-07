from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from jose import jwt, JWTError
from passlib.context import CryptContext

from app.core.config import settings

# Configuración del contexto de contraseñas con Bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Genera un hash seguro para la contraseña del usuario usando bcrypt."""
    return pwd_context.hash(password)


def verificar_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña ingresada coincide con el hash almacenado."""
    return pwd_context.verify(plain_password, hashed_password)


def crear_token(
    data: Dict[str, Any],
    expires_delta: Optional[timedelta] = None,
    tipo: str = "access"
) -> str:
    """
    Crea un token JWT firmado.
    Incluye 'sub', 'rol', 'tipo' (access/refresh), 'exp' e 'iat'.
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)

    if expires_delta:
        expire = now + expires_delta
    else:
        if tipo == "access":
            expire = now + timedelta(minutes=settings.ACCESS_MIN)
        else:
            expire = now + timedelta(minutes=settings.REFRESH_MIN)

    to_encode.update({
        "exp": expire,
        "iat": now,
        "tipo": tipo,
    })

    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decodificar_token(token: str) -> Dict[str, Any]:
    """Decodifica y valida un token JWT con la clave secreta y algoritmo."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as exc:
        raise exc
