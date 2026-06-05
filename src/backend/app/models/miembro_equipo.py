from sqlalchemy import Table, Column, Integer, ForeignKey
from app.core.database import Base

# Tabla intermedia pura (asociación muchos a muchos)
miembros_equipo = Table(
    "miembros_equipo",
    Base.metadata,
    Column("equipo_id", Integer, ForeignKey("equipos_trabajo.id", ondelete="RESTRICT"), primary_key=True),
    Column("usuario_id", Integer, ForeignKey("usuarios.id", ondelete="RESTRICT"), primary_key=True)
)