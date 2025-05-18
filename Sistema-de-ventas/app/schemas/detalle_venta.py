# app/schemas/detalle_venta.py
from datetime import date
from pydantic import BaseModel
from typing import Optional
from app.schemas.producto import Producto

class DetalleVentaBase(BaseModel):
    id_producto: int
    cantidad: int
    precio_unitario: float
    subtotal: float
    fecha_entrega: date

class DetalleVentaCreate(DetalleVentaBase):
    pass

class DetalleVentaUpdate(DetalleVentaBase):
    pass

class DetalleVentaInDB(DetalleVentaBase):
    id_detalle: int
    id_venta: int
    
    class Config:
        from_attributes = True

class DetalleVenta(DetalleVentaInDB):
    producto: Optional[Producto] = None

