import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Cargamos las variables desde el archivo .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# El "Engine" es el motor encargado de gestionar las conexiones físicas a PostgreSQL
engine = create_engine(DATABASE_URL)

# "SessionLocal" será la fábrica que nos dará una sesión limpia cada vez que queramos meter o sacar datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# "Base" es la clase de la que heredarán nuestros futuros modelos (tablas de Python)
Base = declarative_base()

# Esta función (Generador) abrirá la base de datos al recibir una petición web y la cerrará al terminar
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()