from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class SolicitudRevocacion(Base):
    """
    Modelo para el registro legal de solicitudes de revocación de compra
    conforme al Art. 34 de la Ley N° 24.240 y la Disp. 954/2025.
    Almacena el código único de identificación de trámite (ARR-YYYYMMDD-XXXXXX).
    """
    __tablename__ = "solicitudes_revocacion"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, index=True, nullable=False)
    pedido_id = Column(Integer, ForeignKey("pedidos.id", ondelete="CASCADE"), nullable=False, unique=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    creada_en = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relaciones
    pedido = relationship("Pedido", back_populates="solicitud_revocacion")
    usuario = relationship("Usuario", back_populates="solicitudes_revocacion")

    def __repr__(self) -> str:
        return f"<SolicitudRevocacion(id={self.id}, codigo='{self.codigo}', pedido_id={self.pedido_id}, usuario_id={self.usuario_id})>"
