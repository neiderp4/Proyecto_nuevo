# app/models/venta.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
import enum

class TipoVenta(enum.Enum):
    contado = "contado"
    credito = "credito"

class EstadoVenta(enum.Enum):
    pendiente = "pendiente"
    pagada = "pagada"
    cancelada = "cancelada"

class Venta(Base):
    __tablename__ = "ventas"

    id_venta = Column(Integer, primary_key=True, index=True)
    id_cliente = Column(Integer, ForeignKey("clientes.id_cliente"), nullable=False)
    fecha_venta = Column(DateTime(timezone=True), server_default=func.now())
    tipo_venta = Column(Enum(TipoVenta), nullable=False)
    estado = Column(Enum(EstadoVenta), default=EstadoVenta.pendiente)
    total = Column(Float, nullable=False)
    
    # Relaciones
    cliente = relationship("Cliente", back_populates="ventas")
    detalles = relationship("DetalleVenta", back_populates="venta", cascade="all, delete-orphan")
    pagos = relationship("Pago", back_populates="venta", cascade="all, delete-orphan")