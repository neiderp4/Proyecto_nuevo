# app/api/cliente_routes.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.crud import cliente_crud
from app.schemas.cliente import Cliente, ClienteCreate, ClienteUpdate
from app.schemas.resumen import ResumenCliente

router = APIRouter()

@router.get("/", response_model=List[Cliente])
def read_clientes(
    skip: int = 0, 
    limit: int = 100, 
    nombre: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if nombre:
        clientes = cliente_crud.search_clientes(db, nombre=nombre)
    else:
        clientes = cliente_crud.get_clientes(db, skip=skip, limit=limit)
    return clientes

@router.post("/", response_model=Cliente)
def create_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    return cliente_crud.create_cliente(db=db, cliente=cliente)

@router.get("/{cliente_id}", response_model=Cliente)
def read_cliente(cliente_id: int, db: Session = Depends(get_db)):
    db_cliente = cliente_crud.get_cliente(db, cliente_id=cliente_id)
    if db_cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return db_cliente

@router.put("/{cliente_id}", response_model=Cliente)
def update_cliente(cliente_id: int, cliente: ClienteUpdate, db: Session = Depends(get_db)):
    db_cliente = cliente_crud.update_cliente(db, cliente_id=cliente_id, cliente=cliente)
    if db_cliente is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return db_cliente

@router.delete("/{cliente_id}")
def delete_cliente(cliente_id: int, db: Session = Depends(get_db)):
    result = cliente_crud.delete_cliente(db, cliente_id=cliente_id)
    if not result:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"message": "Cliente eliminado correctamente"}

@router.get("/{cliente_id}/resumen", response_model=ResumenCliente)
def get_resumen_cliente(cliente_id: int, db: Session = Depends(get_db)):
    resumen = cliente_crud.get_resumen_cliente(db, cliente_id=cliente_id)
    if resumen is None:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return resumen

