# app/services/reporte_service.py
from io import BytesIO
from typing import Tuple, Optional, List, Dict, Any
from sqlalchemy.orm import Session
from datetime import date, datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from app.crud import cliente_crud, venta_crud
from app.models.venta import Venta, TipoVenta, EstadoVenta
from app.models.cliente import Cliente
from app.models.pago import Pago
from app.models.detalle_venta import DetalleVenta
from app.schemas.reporte import ReporteSaldoOut

def obtener_saldos(db: Session) -> List[ReporteSaldoOut]:
    """
    Consulta la vista 'vista_saldos' directamente desde la base de datos
    """
    query = """
        SELECT 
            id_venta,
            id_cliente,
            nombre_cliente,
            fecha_venta,
            tipo_venta,
            total_venta,
            total_pagado,
            saldo_pendiente,
            estado_pago
        FROM vista_saldos
    """
    result = db.execute(query)
    rows = result.fetchall()
    return [ReporteSaldoOut(**dict(row._mapping)) for row in rows]


def generar_reporte_cliente(db: Session, cliente_id: int, formato: str = "pdf") -> Tuple[bytes, str]:
    """
    Genera un reporte de facturación para un cliente específico
    
    Args:
        db: Sesión de base de datos
        cliente_id: ID del cliente
        formato: Formato del reporte (pdf, csv, etc.)
        
    Returns:
        Tupla con (bytes del reporte, tipo de contenido)
    """
    # Obtener el resumen del cliente
    resumen = cliente_crud.get_resumen_cliente(db, cliente_id)
    if not resumen:
        raise ValueError(f"Cliente con ID {cliente_id} no encontrado")
    
    if formato.lower() == "pdf":
        return generar_pdf_cliente(resumen), "application/pdf"
    else:
        raise ValueError(f"Formato {formato} no soportado")

def generar_pdf_cliente(resumen: Dict[str, Any]) -> bytes:
    """
    Genera un PDF con el resumen de facturación de un cliente
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    
    # Estilos personalizados
    title_style = styles["Heading1"]
    subtitle_style = styles["Heading2"]
    normal_style = styles["Normal"]
    
    # Título
    elements.append(Paragraph("Resumen de Facturación", title_style))
    elements.append(Spacer(1, 12))
    
    # Información del cliente
    cliente = resumen["cliente"]
    elements.append(Paragraph(f"Cliente: {cliente.nombre}", subtitle_style))
    elements.append(Paragraph(f"ID: {cliente.id_cliente}", normal_style))
    if cliente.telefono:
        elements.append(Paragraph(f"Teléfono: {cliente.telefono}", normal_style))
    if cliente.email:
        elements.append(Paragraph(f"Email: {cliente.email}", normal_style))
    if cliente.direccion:
        elements.append(Paragraph(f"Dirección: {cliente.direccion}", normal_style))
    elements.append(Spacer(1, 12))
    
    # Resumen de totales
    elements.append(Paragraph("Resumen de Compras", subtitle_style))
    elements.append(Paragraph(f"Total en Compras: ${resumen['total_compras']:.2f}", normal_style))
    elements.append(Paragraph(f"Total Pagado: ${resumen['total_pagado']:.2f}", normal_style))
    elements.append(Paragraph(f"Saldo Pendiente: ${resumen['saldo_total']:.2f}", normal_style))
    elements.append(Spacer(1, 12))
    
    # Detalle de ventas
    elements.append(Paragraph("Detalle de Ventas", subtitle_style))
    
    if not resumen["ventas_con_saldo"]:
        elements.append(Paragraph("No hay ventas registradas para este cliente.", normal_style))
    else:
        # Encabezados de la tabla
        data = [["ID", "Fecha", "Tipo", "Total", "Pagado", "Saldo", "Estado"]]
        
        # Datos de ventas
        for item in resumen["ventas_con_saldo"]:
            venta = item["venta"]
            data.append([
                str(venta.id_venta),
                venta.fecha_venta.strftime("%d/%m/%Y"),
                venta.tipo_venta.value,
                f"${venta.total:.2f}",
                f"${item['total_pagado']:.2f}",
                f"${item['saldo_pendiente']:.2f}",
                item["estado_pago"]
            ])
        
        # Crear tabla
        table = Table(data, colWidths=[30, 70, 60, 60, 60, 60, 60])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
    
    # Agregar fecha de generación del reporte
    elements.append(Spacer(1, 30))
    elements.append(Paragraph(f"Reporte generado el {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", normal_style))
    
    # Generar PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

def generar_reporte_ventas(
    db: Session, 
    fecha_inicio: date, 
    fecha_fin: date, 
    tipo_venta: Optional[str] = None, 
    estado: Optional[str] = None, 
    formato: str = "pdf"
) -> Tuple[bytes, str]:
    """
    Genera un reporte de ventas según los filtros especificados
    
    Args:
        db: Sesión de base de datos
        fecha_inicio: Fecha de inicio del reporte
        fecha_fin: Fecha de fin del reporte
        tipo_venta: Filtro por tipo de venta (contado/crédito)
        estado: Filtro por estado de la venta
        formato: Formato del reporte (pdf, csv, etc.)
        
    Returns:
        Tupla con (bytes del reporte, tipo de contenido)
    """
    # Consultar ventas según los filtros
    query = db.query(
        Venta, 
        Cliente.nombre.label("nombre_cliente")
    ).join(Cliente, Venta.id_cliente == Cliente.id_cliente)
    
    # Filtrar por fechas
    query = query.filter(Venta.fecha_venta >= fecha_inicio, Venta.fecha_venta <= fecha_fin)
    
    # Filtrar por tipo de venta si se especifica
    if tipo_venta:
        query = query.filter(Venta.tipo_venta == tipo_venta)
    
    # Filtrar por estado si se especifica
    if estado:
        query = query.filter(Venta.estado == estado)
    
    # Ejecutar consulta
    ventas = query.all()
    
    if formato.lower() == "pdf":
        return generar_pdf_ventas(ventas, fecha_inicio, fecha_fin, tipo_venta, estado), "application/pdf"
    else:
        raise ValueError(f"Formato {formato} no soportado")

def generar_pdf_ventas(
    ventas: List[Tuple[Venta, str]], 
    fecha_inicio: date, 
    fecha_fin: date, 
    tipo_venta: Optional[str] = None, 
    estado: Optional[str] = None
) -> bytes:
    """
    Genera un PDF con el reporte de ventas
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    
    # Estilos personalizados
    title_style = styles["Heading1"]
    subtitle_style = styles["Heading2"]
    normal_style = styles["Normal"]
    
    # Título
    elements.append(Paragraph("Reporte de Ventas", title_style))
    elements.append(Spacer(1, 12))
    
    # Filtros aplicados
    elements.append(Paragraph("Filtros aplicados:", subtitle_style))
    elements.append(Paragraph(f"Período: {fecha_inicio.strftime('%d/%m/%Y')} - {fecha_fin.strftime('%d/%m/%Y')}", normal_style))
    if tipo_venta:
        elements.append(Paragraph(f"Tipo de venta: {tipo_venta}", normal_style))
    if estado:
        elements.append(Paragraph(f"Estado: {estado}", normal_style))
    elements.append(Spacer(1, 12))
    
    # Resumen de ventas
    total_ventas = sum(venta.total for venta, _ in ventas)
    total_contado = sum(venta.total for venta, _ in ventas if venta.tipo_venta == TipoVenta.contado)
    total_credito = sum(venta.total for venta, _ in ventas if venta.tipo_venta == TipoVenta.credito)
    
    elements.append(Paragraph("Resumen:", subtitle_style))
    elements.append(Paragraph(f"Total de ventas: {len(ventas)}", normal_style))
    elements.append(Paragraph(f"Monto total: ${total_ventas:.2f}", normal_style))
    elements.append(Paragraph(f"Monto en ventas de contado: ${total_contado:.2f}", normal_style))
    elements.append(Paragraph(f"Monto en ventas a crédito: ${total_credito:.2f}", normal_style))
    elements.append(Spacer(1, 12))
    
    # Detalle de ventas
    elements.append(Paragraph("Detalle de Ventas", subtitle_style))
    
    if not ventas:
        elements.append(Paragraph("No se encontraron ventas con los filtros especificados.", normal_style))
    else:
        # Encabezados de la tabla
        data = [["ID", "Fecha", "Cliente", "Tipo", "Estado", "Total"]]
        
        # Datos de ventas
        for venta, nombre_cliente in ventas:
            data.append([
                str(venta.id_venta),
                venta.fecha_venta.strftime("%d/%m/%Y"),
                nombre_cliente,
                venta.tipo_venta.value,
                venta.estado.value,
                f"${venta.total:.2f}"
            ])
        
        # Crear tabla
        table = Table(data, colWidths=[30, 70, 120, 60, 60, 60])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(table)
    
    # Agregar fecha de generación del reporte
    elements.append(Spacer(1, 30))
    elements.append(Paragraph(f"Reporte generado el {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}", normal_style))
    
    # Generar PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
