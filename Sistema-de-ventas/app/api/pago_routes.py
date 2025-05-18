# app/api/pago_routes.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.crud import pago_crud
from app.schemas.pago import Pago, PagoCreate, PagoUpdate

router = APIRouter()

@router.get("/", response_model=List[Pago])
def read_pagos(
    skip: int = 0, 
    limit: int = 100, 
    venta_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    if venta_id:
        pagos = pago_crud.get_pagos_venta(db, venta_id=venta_id)
    else:
        pagos = pago_crud.get_pagos(db, skip=skip, limit=limit)
    return pagos

@router.post("/", response_model=Pago)
def create_pago(pago: PagoCreate, db: Session = Depends(get_db)):
    return pago_crud.create_pago(db=db, pago=pago)

@router.get("/{pago_id}", response_model=Pago)
def read_pago(pago_id: int, db: Session = Depends(get_db)):
    db_pago = pago_crud.get_pago(db, pago_id=pago_id)
    if db_pago is None:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return db_pago

@router.put("/{pago_id}", response_model=Pago)
def update_pago(pago_id: int, pago: PagoUpdate, db: Session = Depends(get_db)):
    db_pago = pago_crud.update_pago(db, pago_id=pago_id, pago=pago)
    if db_pago is None:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return db_pago

@router.delete("/{pago_id}")
def delete_pago(pago_id: int, db: Session = Depends(get_db)):
    result = pago_crud.delete_pago(db, pago_id=pago_id)
    if not result:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return {"message": "Pago eliminado correctamente"}