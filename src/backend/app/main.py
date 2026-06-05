from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine

# Modelos
from app.models.usuario import Usuario
from app.models.equipo import EquipoTrabajo
from app.models.miembro_equipo import miembros_equipo
from app.models.orden import OrdenTrabajo
from app.models.historial import HistorialMantenimiento

# Routers
from app.routers import equipos
from app.routers import auth 
from app.routers import ordenes
from app.routers import historial

app = FastAPI(
    title="Gestor CMMS API",
    description="Backend para el Sistema de Gestión de Mantenimiento Industrial",
    version="1.0.0"
)

# 2. Configuración de CORS para permitir que el Frontend se conecte sin bloqueos
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción se cambian los corchetes por la URL real del frontend
    allow_credentials=True,
    allow_methods=["*"], # Permite GET, POST, PUT, DELETE, PATCH, etc.
    allow_headers=["*"], # Permite todos los encabezados (como las cabeceras de autenticación JWT)
)

# Incluimos los routers
app.include_router(equipos.router)
app.include_router(auth.router) 
app.include_router(ordenes.router)
app.include_router(historial.router)

try:
    with engine.connect() as connection:
        print("====== 🚀 CONEXIÓN EXITOSA A POSTGRESQL ======")
except Exception as e:
    print("====== ❌ ERROR DE CONEXIÓN A LA BASE DE DATOS ======")
    print(e)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Servidor corriendo con routers activos"}