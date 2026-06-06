# GESTOR CMMS
Sistema integral para la gestión de activos, órdenes de trabajo (OT) y trazabilidad histórica de mantenimiento en planta.

# Requisitos del Sistema
   - Node.js: v18 o superior
   -Python: v3.10 o superior
   -PostgreSQL: v14 o superior

# Backend (FastAPI)
   -Navega a la carpeta: cd backend
   -Crea y activa el entorno virtual: (copiar tal cual en el cmd los siguientes comandos uno por uno)
      python -m venv .venv
      .venv\Scripts\activate

# Instala las dependencias: 
      pip install -r requirements.txt

# Configuración de la Base de Datos
   -Crea una base de datos nueva llamada gestorCMMS en tu gestor de preferencia (pgAdmin).
   -Ejecuta el script database.sql incluido en el repositorio para crear las tablas.

# Configuración de Variables de Entorno:
   -En la carpeta backend/, crea un nuevo archivo llamado .env.
   -Copia el contenido de .env.example dentro del nuevo archivo .env y ajusta los valores:
   -Fragmento de código
      DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/gestorCMMS
      JWT_SECRET=DinoCode_12_12_75_@503SV
      (Nota: Asegúrate de reemplazar usuario y contraseña por tus credenciales reales de PostgreSQL).

# Creacion de primer usuario administrador
   -Ejecuta una ves init_db.py dentro de la ruta backend
   python init_db.py

 # Credenciales iniciales:
   -Usuario: admin
   -Contraseña: AdminPlanta2026!
   -Rol: Administrador

# Ejecuta: 
uvicorn app.main:app --reload

# Frontend (React + Vite)
   -Navega a la carpeta: cd frontend

# Instala dependencias: 
   npm install

# Ejecuta el servidor de desarrollo: 
   npm run dev
