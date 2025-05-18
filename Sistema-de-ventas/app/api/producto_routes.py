# app/api/producto_routes.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.crud import producto_crud
from app.schemas.producto import Producto, ProductoCreate, ProductoUpdate

router = APIRouter()

@router.get("/", response_model=List[Producto])
def read_productos(
    skip: int = 0, 
    limit: int = 100, 
    activo: Optional[bool] = None,
    nombre: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if nombre:
        productos = producto_crud.search_productos(db, nombre=nombre)
    else:
        productos = producto_crud.get_productos(db, skip=skip, limit=limit, activo=activo)
    return productos

@router.post("/", response_model=Producto)
def create_producto(producto: ProductoCreate, db: Session = Depends(get_db)):
    return producto_crud.create_producto(db=db, producto=producto)

@router.get("/{producto_id}", response_model=Producto)
def read_producto(producto_id: int, db: Session = Depends(get_db)):
    db_producto = producto_crud.get_producto(db, producto_id=producto_id)
    if db_producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return db_producto

@router.put("/{producto_id}", response_model=Producto)
def update_producto(producto_id: int, producto: ProductoUpdate, db: Session = Depends(get_db)):
    db_producto = producto_crud.update_producto(db, producto_id=producto_id, producto=producto)
    if db_producto is None:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return db_producto

@router.delete("/{producto_id}")
def delete_producto(producto_id: int, db: Session = Depends(get_db)):
    result = producto_crud.delete_producto(db, producto_id=producto_id)
    if not result:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {"message": "Producto desactivado correctamente"}