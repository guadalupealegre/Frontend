from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class Pedido(Base):
    __tablename__ = "pedidos"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    estado = Column(String(50), default="pendiente", nullable=False)  # pendiente, pagado, entregado, cancelado
    total = Column(Float, nullable=False, default=0.0)
    fecha_creacion = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relaciones
    usuario = relationship("Usuario", back_populates="pedidos")
    items = relationship("ItemPedido", back_populates="pedido", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Pedido(id={self.id}, usuario_id={self.usuario_id}, estado='{self.estado}', total={self.total})>"
