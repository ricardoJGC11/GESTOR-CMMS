from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from app.core.database import get_db
from app.models.equipo import EquipoTrabajo
from app.schemas.equipo_schema import EquipoTrabajoCrear, EquipoTrabajoResponse
from app.models.miembro_equipo import miembros_equipo
from app.models.usuario import Usuario

# Inicializamos el router para este módulo
router = APIRouter(
    prefix="/equipos",
    tags=["Equipos de Trabajo (Cuadrillas)"]
)

# 1. Endpoint para CREAR un nuevo equipo (POST)
@router.post("/", response_model=EquipoTrabajoResponse, status_code=status.HTTP_201_CREATED)
def crear_equipo(equipo: EquipoTrabajoCrear, db: Session = Depends(get_db)):
    # Verificamos si ya existe una cuadrilla con el mismo código único
    db_equipo = db.query(EquipoTrabajo).filter(EquipoTrabajo.codigo_equipo == equipo.codigo_equipo).first()
    if db_equipo:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código de equipo ya está registrado en el sistema"
        )
    
    # Si todo está bien, transformamos el Schema en un Modelo de BD
    nuevo_equipo = EquipoTrabajo(
        codigo_equipo=equipo.codigo_equipo,
        nombre_equipo=equipo.nombre_equipo,
        area_asignada=equipo.area_asignada,
        descripcion=equipo.descripcion
    )
    
    db.add(nuevo_equipo) # Se prepara para insertar
    db.commit()          # Se guardan los cambios en PostgreSQL
    db.refresh(nuevo_equipo) # Recuperamos el ID autogenerado
    
    return nuevo_equipo

# 2. Endpoint para LEER todos los equipos (GET)
@router.get("/", response_model=List[EquipoTrabajoResponse])
def listar_equipos(db: Session = Depends(get_db)):
    equipos = db.query(EquipoTrabajo).all()
    return equipos

# 3. Endpoint para MODIFICAR una cuadrilla existente (PUT)
@router.put("/{equipo_id}", response_model=EquipoTrabajoResponse)
def actualizar_equipo(equipo_id: int, equipo_actualizado: EquipoTrabajoCrear, db: Session = Depends(get_db)):
    # Buscamos el equipo en la base de datos por su ID
    db_equipo = db.query(EquipoTrabajo).filter(EquipoTrabajo.id == equipo_id).first()
    
    # Si no existe, disparamos un error 404
    if not db_equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el equipo con el ID {equipo_id}"
        )
    
    # Verificamos si quiere cambiar el código y si ese nuevo código ya le pertenece a otro equipo
    codigo_duplicado = db.query(EquipoTrabajo).filter(
        EquipoTrabajo.codigo_equipo == equipo_actualizado.codigo_equipo,
        EquipoTrabajo.id != equipo_id
    ).first()
    
    if codigo_duplicado:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nuevo código de equipo ya está siendo usado por otra cuadrilla"
        )
    
    # Reemplazamos los datos viejos con los nuevos del formulario
    db_equipo.codigo_equipo = equipo_actualizado.codigo_equipo
    db_equipo.nombre_equipo = equipo_actualizado.nombre_equipo
    db_equipo.area_asignada = equipo_actualizado.area_asignada
    db_equipo.descripcion = equipo_actualizado.descripcion

    db.commit()
    db.refresh(db_equipo)
    return db_equipo


# 4. Endpoint para ELIMINAR una cuadrilla (DELETE)
@router.delete("/{equipo_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_equipo(equipo_id: int, db: Session = Depends(get_db)):
    db_equipo = db.query(EquipoTrabajo).filter(EquipoTrabajo.id == equipo_id).first()
    
    if not db_equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el equipo con el ID {equipo_id}"
        )
    
    try:
        db.delete(db_equipo) # Ordenamos borrar el registro
        db.commit()          # Guardamos los cambios en Postgres
    except Exception:
        # Si salta un error aquí, es casi seguro por la llave foránea ON DELETE RESTRICT
        db.rollback() # Cancelamos la operación para no corromper nada
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar esta cuadrilla porque tiene órdenes de trabajo o miembros asignados"
        )
        
    return None # Al usar el estado 204 No Content, no se devuelve texto, solo la confirmación de éxito


# 5. Endpoint para ASIGNAR un técnico a una cuadrilla (POST)
@router.post("/{equipo_id}/usuarios/{usuario_id}", status_code=status.HTTP_201_CREATED)
def asignar_miembro_a_equipo(equipo_id: int, usuario_id: int, db: Session = Depends(get_db)):
    # 1. Validar que el equipo exista
    equipo = db.query(EquipoTrabajo).filter(EquipoTrabajo.id == equipo_id).first()
    if not equipo:
        raise HTTPException(status_code=404, detail="El equipo de trabajo no existe")
        
    # 2. Validar que el usuario exista
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="El usuario/técnico no existe")
        
    # 3. Validar si ya está asignado para no duplicar el registro
    ya_asignado = db.execute(
        miembros_equipo.select().where(
            (miembros_equipo.c.equipo_id == equipo_id) & 
            (miembros_equipo.c.usuario_id == usuario_id)
        )
    ).first()
    
    if ya_asignado:
        raise HTTPException(status_code=400, detail="Este usuario ya es miembro de esta cuadrilla")
        
    # 4. Insertar directamente en la tabla intermedia muchos a muchos
    nuevo_amarre = miembros_equipo.insert().values(equipo_id=equipo_id, usuario_id=usuario_id)
    db.execute(nuevo_amarre)
    db.commit()
    
    return {"message": f"Usuario {usuario.username} asignado con éxito al equipo {equipo.nombre_equipo}"}


# 6. Endpoint para REMOVER un técnico de una cuadrilla (DELETE)
@router.delete("/{equipo_id}/usuarios/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_miembro_de_equipo(equipo_id: int, usuario_id: int, db: Session = Depends(get_db)):
    # 1. Verificar si el amarre realmente existe en la tabla intermedia
    asignacion = db.execute(
        miembros_equipo.select().where(
            (miembros_equipo.c.equipo_id == equipo_id) & 
            (miembros_equipo.c.usuario_id == usuario_id)
        )
    ).first()
    
    if not asignacion:
        raise HTTPException(
            status_code=404, 
            detail="El usuario no se encuentra asignado a esta cuadrilla"
        )
    
    # 2. Ejecutar la eliminación en la tabla intermedia
    comando_borrar = miembros_equipo.delete().where(
        (miembros_equipo.c.equipo_id == equipo_id) & 
        (miembros_equipo.c.usuario_id == usuario_id)
    )
    db.execute(comando_borrar)
    db.commit()
    
    return None # Código 204 indica éxito sin contenido de retorno

# 7. Endpoint para LISTAR las asignaciones actuales con nombres legibles (GET)
@router.get("/asignaciones/detalles")
def listar_asignaciones_detalladas(db: Session = Depends(get_db)):
    # Encapsulamos el String dentro de text() para cumplir con SQLAlchemy
    query = db.execute(
        text(
            """
            SELECT 
                e.id AS equipo_id,
                e.codigo_equipo,
                e.nombre_equipo,
                u.id AS usuario_id,
                u.username,
                u.nombre_completo,
                u.rol
            FROM miembros_equipo me
            JOIN equipos_trabajo e ON me.equipo_id = e.id
            JOIN usuarios u ON me.usuario_id = u.id
            """
        )
    )
    
    # Formateamos la respuesta en un JSON limpio para el Frontend
    resultados = [
        {
            "equipo_id": fila.equipo_id,
            "codigo_equipo": fila.codigo_equipo,
            "nombre_equipo": fila.nombre_equipo,
            "usuario_id": fila.usuario_id,
            "username": fila.username,
            "nombre_completo": fila.nombre_completo,
            "rol": fila.rol
        }
        for fila in query.fetchall()
    ]
    
    return resultados