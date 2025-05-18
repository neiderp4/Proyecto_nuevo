# app/crud/producto_crud.py
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.producto import Producto
from app.schemas.producto import ProductoCreate, ProductoUpdate

def get_producto(db: Session, producto_id: int) -> Optional[Producto]:
    return db.query(Producto).filter(Producto.id_producto == producto_id).first()

def get_productos(db: Session, skip: int = 0, limit: int = 100, activo: Optional[bool] = None) -> List[Producto]:
    query = db.query(Producto)
    if activo is not None:
        query = query.filter(Producto.activo == activo)
    return query.offset(skip).limit(limit).all()

def search_productos(db: Session, nombre: str) -> List[Producto]:
    return db.query(Producto).filter(Producto.nombre.ilike(f"%{nombre}%")).all()

def create_producto(db: Session, producto: ProductoCreate) -> Producto:
    db_producto = Producto(**producto.dict())
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto

def update_producto(db: Session, producto_id: int, producto: ProductoUpdate) -> Optional[Producto]:
    db_producto = get_producto(db, producto_id)
    if not db_producto:
        return None
    
    update_data = producto.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_producto, field, value)
    
    db.add(db_producto)
    db.commit()
    db.refresh(db_producto)
    return db_producto

def delete_producto(db: Session, producto_id: int) -> bool:
    db_producto = get_producto(db, producto_id)
    if not db_producto:
        return False
    
    # En lugar de eliminar físicamente, marcamos como inactivo
    db_producto.activo = False
    db.add(db_producto)
    db.commit()
    return True