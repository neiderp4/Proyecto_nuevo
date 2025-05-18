# app/api/reporte_routes.py
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from datetime import datetime, date, timedelta

from app.db.session import get_db
from app.services.reporte_service import generar_reporte_cliente, generar_reporte_ventas

router = APIRouter()

@router.get("/cliente/{cliente_id}")
def get_reporte_cliente(
    cliente_id: int, 
    formato: str = "pdf",
    db: Session = Depends(get_db)
):
    """
    Genera un reporte de facturación para un cliente específico
    """
    try:
        reporte_bytes, content_type = generar_reporte_cliente(db, cliente_id, formato)
        
        # Configurar la respuesta con el archivo de reporte
        filename = f"reporte_cliente_{cliente_id}_{datetime.now().strftime('%Y%m%d')}.{formato}"
        return Response(
            content=reporte_bytes,
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/ventas")
def get_reporte_ventas(
    fecha_inicio: Optional[date] = None,
    fecha_fin: Optional[date] = None,
    tipo_venta: Optional[str] = None,
    estado: Optional[str] = None,
    formato: str = "pdf",
    db: Session = Depends(get_db)
):
    """
    Genera un reporte de ventas según los filtros especificados
    """
    # Si no se especifica fecha_fin, usar la fecha actual
    if fecha_fin is None:
        fecha_fin = date.today()
    
    # Si no se especifica fecha_inicio, usar 30 días antes de fecha_fin
    if fecha_inicio is None:
        fecha_inicio = fecha_fin - timedelta(days=30)
    
    try:
        reporte_bytes, content_type = generar_reporte_ventas(
            db, 
            fecha_inicio, 
            fecha_fin, 
            tipo_venta, 
            estado, 
            formato
        )
        
        # Configurar la respuesta con el archivo de reporte
        filename = f"reporte_ventas_{fecha_inicio.strftime('%Y%m%d')}_{fecha_fin.strftime('%Y%m%d')}.{formato}"
        return Response(
            content=reporte_bytes,
            media_type=content_type,
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))