from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.historial import HistorialMantenimiento
from app.models.orden import OrdenTrabajo
from app.models.equipo import EquipoTrabajo
from app.models.usuario import Usuario
from app.schemas.historial_schema import HistorialCrear, HistorialResponse

router = APIRouter(
    prefix="/historial",
    tags=["Historial de Mantenimiento (Registros Cerrados)"]
)

# 1. Endpoint para REGISTRAR un mantenimiento terminado en el historial (POST)
@router.post("/", response_model=HistorialResponse, status_code=status.HTTP_201_CREATED)
def crear_registro_historial(historial: HistorialCrear, db: Session = Depends(get_db)):
    
    # 1. Validar que la cuadrilla asignada exista
    cuadrilla = db.query(EquipoTrabajo).filter(EquipoTrabajo.id == historial.equipo_trabajo_id).first()
    if not cuadrilla:
        raise HTTPException(status_code=404, detail="La cuadrilla/equipo especificado no existe")
        
    # 2. Validar que el técnico responsable exista
    tecnico = db.query(Usuario).filter(Usuario.id == historial.tecnico_responsable_id).first()
    if not tecnico:
        raise HTTPException(status_code=404, detail="El técnico responsable no existe en el sistema")

    # 3. Validar la Orden de Trabajo de origen (Si es que viene de una OT)
    if historial.orden_origen_id:
        ot = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == historial.orden_origen_id).first()
        if not ot:
            raise HTTPException(status_code=404, detail="La Orden de Trabajo (OT) de origen no existe")
        
        # Una gran práctica: Si archivan el historial, actualizamos automáticamente la OT a 'Terminada'
        ot.estado = "Terminada"

    # Creamos el registro histórico
    nuevo_historial = HistorialMantenimiento(
        fecha=historial.fecha,
        tipo=historial.tipo,
        descripcion_actividad=historial.descripcion_actividad,
        costo_repuestos=historial.costo_repuestos,
        orden_origen_id=historial.orden_origen_id,
        equipo_trabajo_id=historial.equipo_trabajo_id,
        tecnico_responsable_id=historial.tecnico_responsable_id
    )
    
    db.add(nuevo_historial)
    db.commit()
    db.refresh(nuevo_historial)
    return nuevo_historial

# 2. Endpoint para LEER todo el historial técnico de la planta (GET)
@router.get("/", response_model=List[HistorialResponse])
def listar_historial(db: Session = Depends(get_db)):
    return db.query(HistorialMantenimiento).all()

# 3. Endpoint para MODIFICAR un registro del historial (PUT) - Solo correcciones de Typos/Costos
@router.put("/{historial_id}", response_model=HistorialResponse)
def modificar_registro_historial(historial_id: int, datos_actualizados: HistorialCrear, db: Session = Depends(get_db)):
    # Buscamos el registro en el historial
    db_historial = db.query(HistorialMantenimiento).filter(HistorialMantenimiento.id == historial_id).first()
    
    if not db_historial:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el registro de historial con ID {historial_id}"
        )
    
    # Permitimos corregir los datos principales del reporte técnico
    db_historial.tipo = datos_actualizados.tipo
    db_historial.descripcion_actividad = datos_actualizados.descripcion_actividad
    db_historial.costo_repuestos = datos_actualizados.costo_repuestos
    db_historial.fecha = datos_actualizados.fecha
    
    # Nota: No modificamos la orden_origen_id ni las llaves principales 
    # para evitar alterar el rastro de qué cuadrilla lo hizo originalmente.

    db.commit()
    db.refresh(db_historial)
    return db_historial