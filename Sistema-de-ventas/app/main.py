from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import cliente_routes, producto_routes, venta_routes, pago_routes, reporte_routes
from app.core.config import settings
from app.db.session import engine
from app.db.base import Base

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API para Sistema de Gestión de Ventas a Contado y Crédito",
    version="1.0.0",
)

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Asegúrate que es 5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rutas
app.include_router(cliente_routes.router, prefix="/api/clientes", tags=["clientes"])
app.include_router(producto_routes.router, prefix="/api/productos", tags=["productos"])
app.include_router(venta_routes.router, prefix="/api/ventas", tags=["ventas"])
app.include_router(pago_routes.router, prefix="/api/pagos", tags=["pagos"])
app.include_router(reporte_routes.router, prefix="/api/reportes", tags=["reportes"])

@app.on_event("startup")
async def startup():
    # Crear tablas si no existen
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return {"message": "Sistema de Gestión de Ventas"}