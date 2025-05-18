# app/schemas/producto.py
from typing import Optional
from pydantic import BaseModel

class ProductoBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio_unitario: float
    activo: Optional[bool] = True

class ProductoCreate(ProductoBase):
    pass

class ProductoUpdate(ProductoBase):
    pass

class ProductoInDB(ProductoBase):
    id_producto: int
    
    class Config:
        from_attributes = True

class Producto(ProductoInDB):
    pass