from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    rol = Column(String(20), default="cliente", nullable=False)  # 'cliente' o 'admin'
    acepto_tratamiento = Column(Boolean, default=False, nullable=False)
    fecha_consentimiento = Column(DateTime(timezone=True), nullable=True)

    # Relación con pedidos
    pedidos = relationship("Pedido", back_populates="usuario", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Usuario(id={self.id}, email='{self.email}', rol='{self.rol}', acepto_tratamiento={self.acepto_tratamiento})>"
