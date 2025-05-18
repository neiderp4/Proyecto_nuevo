# app/schemas/resumen.py
from typing import List
from datetime import datetime
from pydantic import BaseModel
from app.schemas.venta import VentaConSaldo
from app.schemas.pago import Pago
from app.schemas.detalle_venta import DetalleVenta

class ResumenCliente(BaseModel):
    id_cliente: int
    nombre: str
    ventas: List[VentaConSaldo]
    total_compras: float
    total_pagado: float
    saldo_total: float

class ResumenVenta(BaseModel):
    venta: VentaConSaldo
    detalles: List[DetalleVenta]
    pagos: List[Pago]