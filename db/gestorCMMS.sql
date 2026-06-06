-- 1. Crear la base de datos (Ejecutar por separado si es necesario)
-- CREATE DATABASE "gestorCMMS";

-- 2. Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(100) NOT NULL,
    rol VARCHAR(50) NOT NULL,
    intentos_fallidos INTEGER DEFAULT 0 NOT NULL
);

-- 3. Tabla de Equipos de Trabajo (Cuadrillas)
CREATE TABLE equipos_trabajo (
    id SERIAL PRIMARY KEY,
    codigo_equipo VARCHAR(20) UNIQUE NOT NULL,
    nombre_equipo VARCHAR(100) NOT NULL,
    area_asignada VARCHAR(100) NOT NULL,
    descripcion TEXT
);

-- 4. Tabla Intermedia: Miembros del Equipo (Muchos a Muchos)
CREATE TABLE miembros_equipo (
    equipo_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    PRIMARY KEY (equipo_id, usuario_id),
    FOREIGN KEY (equipo_id) REFERENCES equipos_trabajo(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- 5. Tabla de Órdenes de Trabajo
CREATE TABLE ordenes_trabajo (
    id SERIAL PRIMARY KEY,
    codigo_ot VARCHAR(20) UNIQUE NOT NULL,
    componente_intervenido VARCHAR(120) NOT NULL,
    prioridad VARCHAR(20) NOT NULL,
    estado VARCHAR(30) DEFAULT 'Pendiente' NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    equipo_trabajo_id INTEGER NOT NULL,
    FOREIGN KEY (equipo_trabajo_id) REFERENCES equipos_trabajo(id) ON DELETE RESTRICT
);

-- 6. Tabla de Historial de Mantenimiento (Registros cerrados)
CREATE TABLE historial_mantenimiento (
    id SERIAL PRIMARY KEY,
    orden_origen_id INTEGER,
    equipo_trabajo_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    tipo VARCHAR(30) NOT NULL,
    descripcion_actividad TEXT NOT NULL,
    tecnico_responsable_id INTEGER NOT NULL,
    costo_repuestos NUMERIC(10,2) DEFAULT 0.00 NOT NULL,
    FOREIGN KEY (orden_origen_id) REFERENCES ordenes_trabajo(id) ON DELETE SET NULL,
    FOREIGN KEY (equipo_trabajo_id) REFERENCES equipos_trabajo(id) ON DELETE RESTRICT,
    FOREIGN KEY (tecnico_responsable_id) REFERENCES usuarios(id) ON DELETE RESTRICT
);

