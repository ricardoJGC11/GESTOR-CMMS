from pydantic import BaseModel, Field, field_validator

# Esquema para validar los datos cuando alguien intenta loguearse
class UsuarioLogin(BaseModel):
    username: str = Field(..., min_length=1, description="El nombre de usuario es obligatorio")
    password: str = Field(..., min_length=1, description="La contraseña es obligatoria")

    @field_validator('username', 'password')
    @classmethod
    def no_vacios(cls, v: str) -> str:
        # Si el texto está vacío o solo tiene espacios (ej: "   "), lanza un error
        if not v.strip():
            raise ValueError("El campo no puede estar vacío ni contener solo espacios")
        return v.strip()