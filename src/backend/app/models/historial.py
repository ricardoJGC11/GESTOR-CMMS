from sqlalchemy import Column, Integer, String, Date, Text, Numeric, ForeignKey
from app.core.database import Base

class HistorialMantenimiento(Base):
    __tablename__ = "historial_mantenimiento"

    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(Date, nullable=False)
    tipo = Column(String(30), nullable=False) # Correctivo, Preventivo, Predictivo
    descripcion_actividad = Column(Text, nullable=False)
    costo_repuestos = Column(Numeric(10, 2), default=0.00, nullable=False)

    # Llaves Foráneas
    orden_origen_id = Column(Integer, ForeignKey("ordenes_trabajo.id", ondelete="SET NULL"), nullable=True)
    equipo_trabajo_id = Column(Integer, ForeignKey("equipos_trabajo.id", ondelete="RESTRICT"), nullable=False)
    tecnico_responsable_id = Column(Integer, ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False)