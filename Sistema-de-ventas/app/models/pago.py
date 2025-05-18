# app/models/pago.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base

class Pago(Base):
    __tablename__ = "pagos"

    id_pago = Column(Integer, primary_key=True, index=True)
    id_venta = Column(Integer, ForeignKey("ventas.id_venta"), nullable=False)
    fecha_pago = Column(DateTime(timezone=True), server_default=func.now())
    monto = Column(Float, nullable=False)
    metodo_pago = Column(String(50), nullable=True)
    observaciones = Column(Text, nullable=True)
    
    # Relaciones
    venta = relationship("Venta", back_populates="pagos")