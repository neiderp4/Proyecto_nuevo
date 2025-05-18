# app/models/producto.py
from sqlalchemy import Column, Integer, String, Float, Boolean, Text 
from app.db.base_class import Base

class Producto(Base):
    __tablename__ = "productos"

    id_producto = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text, nullable=True)
    precio_unitario = Column(Float, nullable=False)
    activo = Column(Boolean, default=True)