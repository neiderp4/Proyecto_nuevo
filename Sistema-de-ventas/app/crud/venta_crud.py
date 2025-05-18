# app/crud/venta_crud.py
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.venta import Venta, TipoVenta, EstadoVenta
from app.models.detalle_venta import DetalleVenta
from app.models.pago import Pago
from app.models.cliente import Cliente
from app.schemas.venta import VentaCreate, VentaUpdate

def get_venta(db: Session, venta_id: int) -> Optional[Venta]:
    return db.query(Venta).filter(Venta.id_venta == venta_id).first()

def get_ventas(db: Session, skip: int = 0, limit: int = 100) -> List[Venta]:
    return db.query(Venta).offset(skip).limit(limit).all()

def get_ventas_cliente(db: Session, cliente_id: int) -> List[Venta]:
    return db.query(Venta).filter(Venta.id_cliente == cliente_id).all()

def create_venta(db: Session, venta: VentaCreate) -> Venta:
    # Crear la venta
    db_venta = Venta(
        id_cliente=venta.id_cliente,
        tipo_venta=venta.tipo_venta,
        estado=venta.estado,
        total=venta.total
    )
    db.add(db_venta)
    db.flush()  # Para obtener el ID antes de hacer commit
    
    # Crear los detalles de la venta
    for detalle in venta.detalles:
        db_detalle = DetalleVenta(
            id_venta=db_venta.id_venta,
            id_producto=detalle.id_producto,
            cantidad=detalle.cantidad,
            precio_unitario=detalle.precio_unitario,
            subtotal=detalle.subtotal,
            fecha_entrega=detalle.fecha_entrega
        )
        db.add(db_detalle)
    
    db.commit()
    db.refresh(db_venta)
    return db_venta

def update_venta(db: Session, venta_id: int, venta: VentaUpdate) -> Optional[Venta]:
    db_venta = get_venta(db, venta_id)
    if not db_venta:
        return None
    
    update_data = venta.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_venta, field, value)
    
    db.add(db_venta)
    db.commit()
    db.refresh(db_venta)
    return db_venta

def get_venta_con_saldo(db: Session, venta_id: int) -> Optional[Dict]:
    # Obtener la venta
    venta = db.query(Venta).filter(Venta.id_venta == venta_id).first()
    if not venta:
        return None
    
    # Obtener el total pagado
    total_pagado = db.query(func.sum(Pago.monto)).filter(Pago.id_venta == venta_id).scalar() or 0
    
    # Calcular el saldo pendiente
    saldo_pendiente = venta.total - total_pagado
    
    # Determinar el estado de pago
    estado_pago = "Pagado" if saldo_pendiente <= 0 else "Pendiente"
    
    return {
        "venta": venta,
        "total_pagado": total_pagado,
        "saldo_pendiente": saldo_pendiente,
        "estado_pago": estado_pago
    }

def get_ventas_con_saldo(db: Session, cliente_id: Optional[int] = None) -> List[Dict]:
    # Base query
    query = db.query(
        Venta,
        Cliente.nombre.label("nombre_cliente"),
        func.coalesce(func.sum(Pago.monto), 0).label("total_pagado")
    ).join(Cliente, Venta.id_cliente == Cliente.id_cliente) \
     .outerjoin(Pago, Venta.id_venta == Pago.id_venta)
    
    # Filtrar por cliente si se proporciona el ID
    if cliente_id:
        query = query.filter(Venta.id_cliente == cliente_id)
    
    # Agrupar por venta
    query = query.group_by(Venta.id_venta, Cliente.nombre)
    
    # Ejecutar consulta
    ventas = query.all()
    
    # Formatear resultados
    resultados = []
    for venta, nombre_cliente, total_pagado in ventas:
        saldo_pendiente = venta.total - total_pagado
        estado_pago = "Pagado" if saldo_pendiente <= 0 else "Pendiente"
        
        resultados.append({
            "venta": venta,
            "nombre_cliente": nombre_cliente,
            "total_pagado": total_pagado,
            "saldo_pendiente": saldo_pendiente,
            "estado_pago": estado_pago
        })
    
    return resultados

def get_resumen_cliente(db: Session, cliente_id: int) -> Optional[Dict]:
    # Verificar que el cliente existe
    cliente = db.query(Cliente).filter(Cliente.id_cliente == cliente_id).first()
    if not cliente:
        return None
    
    # Obtener ventas con saldo del cliente
    ventas_con_saldo = get_ventas_con_saldo(db, cliente_id)
    
    # Calcular totales
    total_compras = sum(item["venta"].total for item in ventas_con_saldo)
    total_pagado = sum(item["total_pagado"] for item in ventas_con_saldo)
    saldo_total = sum(item["saldo_pendiente"] for item in ventas_con_saldo)
    
    return {
        "cliente": cliente,
        "ventas_con_saldo": ventas_con_saldo,
        "total_compras": total_compras,
        "total_pagado": total_pagado,
        "saldo_total": saldo_total
    }
