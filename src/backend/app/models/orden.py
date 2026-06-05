from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, text
from app.core.database import Base

class OrdenTrabajo(Base):
    __tablename__ = "ordenes_trabajo"

    id = Column(Integer, primary_key=True, index=True)
    codigo_ot = Column(String(20), unique=True, index=True, nullable=False)
    componente_intervenido = Column(String(120), nullable=False)
    prioridad = Column(String(20), nullable=False) # Alta, Media, Baja
    estado = Column(String(30), server_default="Pendiente", nullable=False) # Pendiente, En Proceso, Terminada
    fecha_creacion = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"), nullable=False)
    
    # Llave foránea hacia la cuadrilla asignada
    equipo_trabajo_id = Column(Integer, ForeignKey("equipos_trabajo.id", ondelete="RESTRICT"), nullable=False)