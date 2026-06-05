import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from dotenv import load_dotenv
from passlib.context import CryptContext
import jwt

load_dotenv()

# Configuramos Passlib para que use 'bcrypt' como motor de hashing para las contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Recuperamos la configuración del .env
JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256" # Algoritmo estándar para firmar tokens JWT
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # El token del usuario vencerá en 1 hora

# 1. Función para transformar una contraseña limpia en un Hash indescifrable
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

# 2. Función para verificar si la contraseña que escribió el usuario coincide con el hash guardado
def verificar_password(password_plana: str, password_hasheada: str) -> bool:
    return pwd_context.verify(password_plana, password_hasheada)

# 3. Función para fabricar el Token JWT (El pase de abordar del usuario)
def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Añadimos la fecha de expiración dentro de los datos del token
    to_encode.update({"exp": expire})
    
    # Firmamos el token usando tu clave secreta DinoCode
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt