from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UsuarioBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100, description="Nombre completo o razón social")
    email: EmailStr = Field(..., description="Correo electrónico válido")


class UsuarioCreate(UsuarioBase):
    password: str = Field(..., min_length=6, description="Contraseña de al menos 6 caracteres")
    acepto_tratamiento: bool = Field(
        ...,
        description="Consentimiento expreso e informado de tratamiento de datos personales conforme a la Ley 25.326"
    )

    @field_validator("acepto_tratamiento")
    @classmethod
    def validar_consentimiento(cls, v: bool) -> bool:
        if v is not True:
            raise ValueError(
                "Debe aceptar el tratamiento de datos personales conforme a la Ley 25.326 para registrarse en Dulce Vicio."
            )
        return v


class UsuarioOut(UsuarioBase):
    id: int
    rol: str
    acepto_tratamiento: bool
    fecha_consentimiento: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut


class TokenData(BaseModel):
    sub: Optional[str] = None
    rol: Optional[str] = None
    tipo: Optional[str] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str
