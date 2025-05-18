# app/api/venta_routes.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.crud import venta_crud
from app.schemas.venta import Venta, VentaCreate, VentaUpdate, VentaConSaldo
from app.schemas.resumen import ResumenVenta

router = APIRouter()

@router.get("/", response_model=List[Venta])
def read_ventas(
    skip: int = 0, 
    limit: int = 100, 
    cliente_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    if cliente_id:
        ventas = venta_crud.get_ventas_cliente(db, cliente_id=cliente_id)
    else:
        ventas = venta_crud.get_ventas(db, skip=skip, limit=limit)
    return ventas

@router.post("/", response_model=Venta)
def create_venta(venta: VentaCreate, db: Session = Depends(get_db)):
    return venta_crud.create_venta(db=db, venta=venta)

@router.get("/{venta_id}", response_model=Venta)
def read_venta(venta_id: int, db: Session = Depends(get_db)):
    db_venta = venta_crud.get_venta(db, venta_id=venta_id)
    if db_venta is None:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return db_venta

@router.put("/{venta_id}", response_model=Venta)
def update_venta(venta_id: int, venta: VentaUpdate, db: Session = Depends(get_db)):
    db_venta = venta_crud.update_venta(db, venta_id=venta_id, venta=venta)
    if db_venta is None:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return db_venta

@router.get("/{venta_id}/saldo", response_model=VentaConSaldo)
def get_venta_con_saldo(venta_id: int, db: Session = Depends(get_db)):
    resultado = venta_crud.get_venta_con_saldo(db, venta_id=venta_id)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return resultado

@router.get("/con-saldo/", response_model=List[VentaConSaldo])
def get_ventas_con_saldo(
    cliente_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    return venta_crud.get_ventas_con_saldo(db, cliente_id=cliente_id)

@router.get("/{venta_id}/resumen", response_model=ResumenVenta)
def get_resumen_venta(venta_id: int, db: Session = Depends(get_db)):
    from app.crud import pago_crud
    
    # Obtener la venta con saldo
    venta_con_saldo = venta_crud.get_venta_con_saldo(db, venta_id=venta_id)
    if venta_con_saldo is None:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    
    # Obtener los detalles de la venta
    venta = venta_con_saldo["venta"]
    detalles = venta.detalles
    
    # Obtener los pagos de la venta
    pagos = pago_crud.get_pagos_venta(db, venta_id=venta_id)
    
    return {
        "venta": venta_con_saldo,
        "detalles": detalles,
        "pagos": pagos
    }