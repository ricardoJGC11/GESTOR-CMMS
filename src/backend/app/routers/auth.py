from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.core.database import get_db
from app.models.usuario import Usuario
from app.schemas.usuario_schema import UsuarioLogin
from app.core.security import hash_password, verificar_password, crear_token_acceso

router = APIRouter(
    prefix="/auth",
    tags=["Autenticación y Usuarios"]
)

# 1. Endpoint para REGISTRAR nuevos usuarios (Técnicos, Admins, etc.)
@router.post("/register", status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario: UsuarioLogin, nombre_completo: str, rol: str, db: Session = Depends(get_db)):
    # Comprobamos si el username ya está tomado
    usuario_existente = db.query(Usuario).filter(Usuario.username == usuario.username).first()
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está registrado"
        )
    
    # Hasheamos la contraseña antes de guardarla
    password_encriptada = hash_password(usuario.password)
    
    nuevo_usuario = Usuario(
        username=usuario.username,
        password_hash=password_encriptada,
        nombre_completo=nombre_completo,
        rol=rol
    )
    
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return {"message": "Usuario registrado exitosamente", "username": nuevo_usuario.username}


# 2. Endpoint para el LOGIN (Genera el Token JWT)
@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Buscamos al usuario por su username
    usuario = db.query(Usuario).filter(Usuario.username == form_data.username).first()
    
    # Si no existe el usuario o la contraseña no coincide con el hash
    if not usuario or not verificar_password(form_data.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Si las credenciales son correctas, guardamos su información esencial en el token
    datos_token = {
        "sub": usuario.username,
        "id": usuario.id,
        "rol": usuario.rol
    }
    
    token = crear_token_acceso(data=datos_token)
    
    # Devolvemos el token en el formato estándar que el frontend y las librerías esperan
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "username": usuario.username,
            "nombre": usuario.nombre_completo,
            "rol": usuario.rol
        }
    }

# 3. Endpoint para LISTAR todos los usuarios (GET) - Necesario para asignaciones en el Frontend
@router.get("/usuarios", status_code=status.HTTP_200_OK)
def listar_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(Usuario).all()
    
    # Mapeamos la respuesta manualmente para omitir hashes de contraseñas de manera segura
    resultado = [
        {
            "id": u.id,
            "username": u.username,
            "nombre_completo": u.nombre_completo,
            "rol": u.rol
        }
        for u in usuarios
    ]
    
    return resultado

from fastapi import Response

# 4. Endpoint para ELIMINAR un usuario por su ID
@router.delete("/usuarios/{usuario_id}", status_code=status.HTTP_200_OK)
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario no existe en el sistema."
        )
    
    try:
        db.delete(usuario)
        db.commit()
        return {"message": "Usuario eliminado correctamente de la base de datos."}
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar el usuario porque tiene historial o dependencias operativas en la planta."
        )