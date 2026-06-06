from app.core.database import engine, Base
from app.core.database import SessionLocal
from app.models.usuario import Usuario
from passlib.context import CryptContext

# 1. Crear las tablas (por si acaso no existen)
Base.metadata.create_all(bind=engine)

# 2. Preparar el hash con la misma configuración de tu app
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
db = SessionLocal()

# 3. Crear el objeto Usuario usando tu modelo
admin = Usuario(
    username="admin",
    password_hash=pwd_context.hash("AdminPlanta2026!"),
    nombre_completo="Administrador Principal",
    rol="Administrador",
    intentos_fallidos=0
)

# 4. Guardar usando SQLAlchemy
try:
    db.add(admin)
    db.commit()
    print("¡Usuario admin creado correctamente a través del modelo!")
except Exception as e:
    db.rollback()
    print(f"El usuario ya existe o hubo un error: {e}")
finally:
    db.close()