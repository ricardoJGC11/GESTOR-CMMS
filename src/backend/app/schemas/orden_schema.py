from pydantic import BaseModel, Field, field_validator
from datetime import datetime

class OrdenTrabajoCrear(BaseModel):
    codigo_ot: str = Field(..., min_length=2, max_length=20)
    componente_intervenido: str = Field(..., min_length=3, max_length=120)
    prioridad: str = Field(..., min_length=4, max_length=20) # Alta, Media, Baja
    equipo_trabajo_id: int = Field(..., gt=0, description="ID válido de la cuadrilla")

    @field_validator('codigo_ot', 'componente_intervenido', 'prioridad')
    @classmethod
    def no_vacios(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("El campo no puede estar vacío")
        return v.strip()

class OrdenTrabajoResponse(BaseModel):
    id: int
    codigo_ot: str
    componente_intervenido: str
    prioridad: str
    estado: str
    fecha_creacion: datetime
    equipo_trabajo_id: int

    class Config:
        from_attributes = True
        