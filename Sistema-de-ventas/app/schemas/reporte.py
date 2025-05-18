from pydantic import BaseModel
from datetime import datetime
from typing import Literal


class ReporteSaldoOut(BaseModel):
    id_venta: int
    id_cliente: int
    nombre_cliente: str
    fecha_venta: datetime
    tipo_venta: Literal["contado", "credito"]
    total_venta: float
    total_pagado: float
    saldo_pendiente: float
    estado_pago: Literal["Pagado", "Pendiente"]

    class Config:
        from_attributes = True
