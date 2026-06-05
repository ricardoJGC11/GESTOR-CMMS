from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base

class EquipoTrabajo(Base):
    __tablename__ = "equipos_trabajo"

    id = Column(Integer, primary_key=True, index=True)
    codigo_equipo = Column(String(20), unique=True, index=True, nullable=False)
    nombre_equipo = Column(String(100), nullable=False)
    area_asignada = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)