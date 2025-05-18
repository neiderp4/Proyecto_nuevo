# app/schemas/venta.py
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

from app.schemas.cliente import Cliente
from app.schemas.detalle_venta import DetalleVentaCreate, DetalleVenta

class TipoVenta(str, Enum):
    contado = "contado"
    credito = "credito"

class EstadoVenta(str, Enum):
    pendiente = "pendiente"
    pagada = "pagada"
    cancelada = "cancelada"

class VentaBase(BaseModel):
    id_cliente: int
    tipo_venta: TipoVenta
    estado: Optional[EstadoVenta] = EstadoVenta.pendiente
    total: float

class VentaCreate(VentaBase):
    detalles: List[DetalleVentaCreate]

class VentaUpdate(BaseModel):
    estado: Optional[EstadoVenta] = None

class VentaInDB(VentaBase):
    id_venta: int
    fecha_venta: datetime
    
    class Config:
        from_attributes = True

class Venta(VentaInDB):
    cliente: Optional[Cliente] = None
    detalles: List[DetalleVenta] = []

class VentaConSaldo(Venta):
    total_pagado: float
    saldo_pendiente: float
    estado_pago: str