# app/crud/cliente_crud.py
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate

def get_cliente(db: Session, cliente_id: int) -> Optional[Cliente]:
    return db.query(Cliente).filter(Cliente.id_cliente == cliente_id).first()

def get_cliente_by_nombre(db: Session, nombre: str) -> Optional[Cliente]:
    return db.query(Cliente).filter(Cliente.nombre.ilike(f"%{nombre}%")).first()

def get_clientes(db: Session, skip: int = 0, limit: int = 100) -> List[Cliente]:
    return db.query(Cliente).offset(skip).limit(limit).all()

def search_clientes(db: Session, nombre: str) -> List[Cliente]:
    return db.query(Cliente).filter(Cliente.nombre.ilike(f"%{nombre}%")).all()

def create_cliente(db: Session, cliente: ClienteCreate) -> Cliente:
    db_cliente = Cliente(**cliente.dict())
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente

def update_cliente(db: Session, cliente_id: int, cliente: ClienteUpdate) -> Optional[Cliente]:
    db_cliente = get_cliente(db, cliente_id)
    if not db_cliente:
        return None
    
    update_data = cliente.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_cliente, field, value)
    
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente

def delete_cliente(db: Session, cliente_id: int) -> bool:
    db_cliente = get_cliente(db, cliente_id)
    if not db_cliente:
        return False
    
    db.delete(db_cliente)
    db.commit()
    return True