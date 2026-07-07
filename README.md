# Gestor CMMS

**Gestor CMMS** es un sistema de gestión de mantenimiento computarizado (CMMS) desarrollado para administrar activos, órdenes de trabajo y el historial de mantenimiento de una planta. El proyecto integra un **backend con FastAPI**, un **frontend desarrollado con React + Vite** y una base de datos **PostgreSQL**, ofreciendo una solución moderna para la gestión del mantenimiento industrial.

---

## Tecnologías utilizadas

### Backend
- Python 3.10+
- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT Authentication
- Uvicorn

### Frontend
- React
- Vite
- JavaScript
- HTML5
- CSS3

---

## Arquitectura del proyecto

El proyecto está organizado de la siguiente manera:

```text
GestorCMMS/
├── backend/
│   ├── app/               # API REST y lógica del sistema
│   ├── init_db.py         # Inicialización de la base de datos
│   ├── requirements.txt   # Dependencias de Python
│   ├── .env.example       # Variables de entorno de ejemplo
│   └── .env               # Variables de entorno (no incluir en Git)
│
├── frontend/
│   ├── src/               # Componentes y lógica de React
│   ├── package.json
│   └── vite.config.js
│
├── database.sql           # Script de creación de la base de datos
└── README.md
```

### Descripción de cada componente

- **backend:** contiene la API REST desarrollada con FastAPI, la lógica de negocio y la autenticación mediante JWT.
- **frontend:** implementa la interfaz de usuario utilizando React y Vite.
- **database.sql:** script encargado de crear la estructura de la base de datos.
- **init_db.py:** inicializa la base de datos y crea el primer usuario administrador.

---

## Funcionalidades

El sistema permite:

- Gestión de activos.
- Administración de órdenes de trabajo (OT).
- Historial y trazabilidad de mantenimiento.
- Gestión de usuarios y roles.
- Autenticación mediante JWT.
- Administración centralizada del mantenimiento de planta.

---

## Requisitos

Antes de ejecutar el proyecto asegúrate de tener instalado:

- Node.js 18 o superior
- Python 3.10 o superior
- PostgreSQL 14 o superior
- Git (opcional para clonar el repositorio)

---

## Configuración de la base de datos

1. Crear una base de datos llamada:

```text
gestorCMMS
```

2. Ejecutar el archivo `database.sql` incluido en el proyecto para crear todas las tablas necesarias.

---

## Instalación

### Backend

### 1. Acceder a la carpeta

```bash
cd backend
```

### 2. Crear un entorno virtual

```bash
python -m venv .venv
```

### 3. Activar el entorno virtual

**Windows**

```bash
.venv\Scripts\activate
```

**Linux / macOS**

```bash
source .venv/bin/activate
```

---

### 4. Instalar las dependencias

```bash
pip install -r requirements.txt
```

---

## Variables de entorno

Crear un archivo `.env` dentro de la carpeta **backend/** utilizando como referencia el archivo `.env.example`.

Ejemplo:

```env
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/gestorCMMS
JWT_SECRET=TU_CLAVE_SECRETA
```

> **Importante:** Reemplaza el usuario y la contraseña por tus credenciales de PostgreSQL y nunca subas el archivo `.env` al repositorio.

---

## Inicializar la base de datos

Ejecuta el siguiente comando para crear el primer usuario administrador:

```bash
python init_db.py
```

### Credenciales iniciales

| Campo | Valor |
|--------|-------|
| Usuario | admin |
| Contraseña | AdminPlanta2026! |
| Rol | Administrador |

> Se recomienda cambiar estas credenciales después del primer inicio de sesión.

---

## Ejecutar el Backend

```bash
uvicorn app.main:app --reload
```

---

## Frontend

### 1. Acceder a la carpeta

```bash
cd frontend
```

### 2. Instalar las dependencias

```bash
npm install
```

### 3. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

---

## Características

- Gestión de activos industriales.
- Administración de órdenes de trabajo (OT).
- Historial completo de mantenimiento.
- Arquitectura cliente-servidor.
- API REST desarrollada con FastAPI.
- Frontend moderno con React y Vite.
- Autenticación segura mediante JWT.
- Base de datos PostgreSQL.
- Arquitectura modular y escalable.

---

## Autor

**Ricardo JGC**

GitHub: https://github.com/ricardoJGC11
