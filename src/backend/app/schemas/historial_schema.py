from pydantic import BaseModel, Field, field_validator
from datetime import date
from typing import Optional

class HistorialCrear(BaseModel):
    fecha: date
    tipo: str = Field(..., min_length=5, max_length=30) # Preventivo, Correctivo...
    descripcion_actividad: str = Field(..., min_length=10)
    costo_repuestos: float = Field(default=0.0, ge=0.0)
    orden_origen_id: Optional[int] = None
    equipo_trabajo_id: int = Field(..., gt=0)
    tecnico_responsable_id: int = Field(..., gt=0)

    @field_validator('tipo', 'descripcion_actividad')
    @classmethod
    def no_vacios(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("El campo no puede estar vacío")
        return v.strip()

class HistorialResponse(BaseModel):
    id: int
    fecha: date
    tipo: str
    descripcion_actividad: str
    costo_repuestos: float
    orden_origen_id: Optional[int]
    equipo_trabajo_id: int
    tecnico_responsable_id: int

    class Config:
        from_attributes = True