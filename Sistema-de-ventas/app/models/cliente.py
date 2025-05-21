# app/models/cliente.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.base_class import Base
from sqlalchemy.orm import relationship

class Cliente(Base):
    __tablename__ = "clientes"

    id_cliente = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    telefono = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True, unique=True)
    direccion = Column(String(255), nullable=True)
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())

    ventas = relationship("Venta", back_populates="cliente")





