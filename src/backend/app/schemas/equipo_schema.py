from pydantic import BaseModel, Field, field_validator
from typing import Optional

# Esquema base para cuando entra la información del formulario web
class EquipoTrabajoCrear(BaseModel):
    codigo_equipo: str = Field(..., min_length=2, max_length=20)
    nombre_equipo: str = Field(..., min_length=3, max_length=100)
    area_asignada: str = Field(..., min_length=3, max_length=100)
    descripcion: Optional[str] = None # Este campo sí permitimos que sea opcional

    @field_validator('codigo_equipo', 'nombre_equipo', 'area_asignada')
    @classmethod
    def validar_campos_obligatorios(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Este campo es obligatorio y no puede quedar vacío")
        return v.strip()

# Esquema que usará la API para responderle a la web (ya incluye el ID de la base de datos)
class EquipoTrabajoResponse(BaseModel):
    id: int
    codigo_equipo: str
    nombre_equipo: str
    area_asignada: str
    descripcion: Optional[str]

    class Config:
        from_attributes = True # Le permite a Pydantic leer modelos de SQLAlchemy