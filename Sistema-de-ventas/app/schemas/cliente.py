# app/schemas/cliente.py
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr

class ClienteBase(BaseModel):
    nombre: str
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(ClienteBase):
    pass

class ClienteInDB(ClienteBase):
    id_cliente: int
    fecha_registro: datetime
    
    class Config:
        from_attributes = True

class Cliente(ClienteInDB):
    pass