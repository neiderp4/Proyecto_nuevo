from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.schemas.venta import Venta

class PagoBase(BaseModel):
    id_venta: int
    monto: float
    metodo_pago: Optional[str] = None
    observaciones: Optional[str] = None

class PagoCreate(PagoBase):
    pass

class PagoUpdate(BaseModel):
    monto: Optional[float] = None
    metodo_pago: Optional[str] = None
    observaciones: Optional[str] = None

class PagoInDB(PagoBase):
    id_pago: int
    fecha_pago: datetime

    class Config:
        from_attributes = True

class Pago(PagoInDB):
    venta: Optional[Venta] = None  # ✅ Relación con Venta (que puede tener Cliente)
