from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.models.pago import Pago
from app.models.venta import Venta
from app.schemas.pago import PagoCreate, PagoUpdate

def get_pago(db: Session, pago_id: int) -> Optional[Pago]:
    return (
        db.query(Pago)
        .options(joinedload(Pago.venta).joinedload(Venta.cliente))
        .filter(Pago.id_pago == pago_id)
        .first()
    )

def get_pagos(db: Session, skip: int = 0, limit: int = 100) -> List[Pago]:
    return (
        db.query(Pago)
        .options(joinedload(Pago.venta).joinedload(Venta.cliente))
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_pagos_venta(db: Session, venta_id: int) -> List[Pago]:
    return (
        db.query(Pago)
        .options(joinedload(Pago.venta).joinedload(Venta.cliente))
        .filter(Pago.id_venta == venta_id)
        .all()
    )

def create_pago(db: Session, pago: PagoCreate) -> Pago:
    db_pago = Pago(**pago.dict())
    db.add(db_pago)
    
    # Verificar si la venta está completamente pagada después de este abono
    total_venta = db.query(Venta.total).filter(Venta.id_venta == pago.id_venta).scalar()
    total_pagado = (
        db.query(func.sum(Pago.monto))
        .filter(Pago.id_venta == pago.id_venta)
        .scalar() or 0
    ) + pago.monto
    
    # Si está completamente pagada, actualizar el estado de la venta
    if total_pagado >= total_venta:
        db_venta = db.query(Venta).filter(Venta.id_venta == pago.id_venta).first()
        db_venta.estado = "pagada"
        db.add(db_venta)
    
    db.commit()
    db.refresh(db_pago)
    return db_pago

def update_pago(db: Session, pago_id: int, pago: PagoUpdate) -> Optional[Pago]:
    db_pago = get_pago(db, pago_id)
    if not db_pago:
        return None
    
    # Actualizar los campos del pago
    update_data = pago.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_pago, field, value)
    
    db.add(db_pago)
    
    # Si se actualizó el monto, verificar el estado de la venta
    if "monto" in update_data:
        venta_id = db_pago.id_venta
        total_venta = db.query(Venta.total).filter(Venta.id_venta == venta_id).scalar()
        total_pagado = db.query(func.sum(Pago.monto)).filter(Pago.id_venta == venta_id).scalar() or 0
        
        db_venta = db.query(Venta).filter(Venta.id_venta == venta_id).first()
        if total_pagado >= total_venta:
            db_venta.estado = "pagada"
        else:
            db_venta.estado = "pendiente"
        
        db.add(db_venta)
    
    db.commit()
    db.refresh(db_pago)
    return db_pago

def delete_pago(db: Session, pago_id: int) -> bool:
    db_pago = get_pago(db, pago_id)
    if not db_pago:
        return False
    
    venta_id = db_pago.id_venta
    
    db.delete(db_pago)
    db.commit()
    
    # Recalcular el estado de la venta después de eliminar el pago
    total_venta = db.query(Venta.total).filter(Venta.id_venta == venta_id).scalar()
    total_pagado = db.query(func.sum(Pago.monto)).filter(Pago.id_venta == venta_id).scalar() or 0
    
    db_venta = db.query(Venta).filter(Venta.id_venta == venta_id).first()
    if db_venta:
        db_venta.estado = "pagada" if total_pagado >= total_venta else "pendiente"
        db.add(db_venta)
        db.commit()
    
    return True
