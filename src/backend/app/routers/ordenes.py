from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.orden import OrdenTrabajo
from app.models.equipo import EquipoTrabajo
from app.schemas.orden_schema import OrdenTrabajoCrear, OrdenTrabajoResponse

router = APIRouter(
    prefix="/ordenes",
    tags=["Órdenes de Trabajo (OT)"]
)

# 1. Endpoint para CREAR una nueva Orden de Trabajo (POST)
@router.post("/", response_model=OrdenTrabajoResponse, status_code=status.HTTP_201_CREATED)
def crear_orden_trabajo(orden: OrdenTrabajoCrear, db: Session = Depends(get_db)):
    # Validamos primero si la cuadrilla asignada realmente existe en la planta
    cuadrilla = db.query(EquipoTrabajo).filter(EquipoTrabajo.id == orden.equipo_trabajo_id).first()
    if not cuadrilla:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se puede crear la OT porque la cuadrilla con ID {orden.equipo_trabajo_id} no existe"
        )
    
    # Validamos que el código de la OT no esté repetido
    orden_existente = db.query(OrdenTrabajo).filter(OrdenTrabajo.codigo_ot == orden.codigo_ot).first()
    if orden_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El código de Orden de Trabajo (OT) ya está registrado"
        )
    
    nueva_ot = OrdenTrabajo(
        codigo_ot=orden.codigo_ot,
        componente_intervenido=orden.componente_intervenido,
        prioridad=orden.prioridad,
        equipo_trabajo_id=orden.equipo_trabajo_id
        # El estado 'Pendiente' y la fecha se asignan por defecto desde la BD
    )
    
    db.add(nueva_ot)
    db.commit()
    db.refresh(nueva_ot)
    return nueva_ot


# 2. Endpoint para LISTAR todas las OTs (GET)
@router.get("/", response_model=List[OrdenTrabajoResponse])
def listar_ordenes_trabajo(db: Session = Depends(get_db)):
    return db.query(OrdenTrabajo).all()


# 3. Endpoint para CAMBIAR EL ESTADO de una OT (PATCH)
# Usamos PATCH porque solo vamos a alterar un campo específico (el estado)
@router.patch("/{orden_id}/estado", response_model=OrdenTrabajoResponse)
def actualizar_estado_ot(orden_id: int, nuevo_estado: str, db: Session = Depends(get_db)):
    ot = db.query(OrdenTrabajo).filter(OrdenTrabajo.id == orden_id).first()
    if not ot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró la Orden de Trabajo con ID {orden_id}"
        )
    
    # Validamos que no metan estados inventados
    estados_validos = ["Pendiente", "En Proceso", "Terminada"]
    if nuevo_estado not in estados_validos:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Estado inválido. Los estados permitidos son: {', '.join(estados_validos)}"
        )
        
    ot.estado = nuevo_estado
    db.commit()
    db.refresh(ot)
    return ot

# 4. Endpoint para obtener los KPIs del Dashboard (GET)
@router.get("/stats")
def obtener_estadisticas_dashboard(db: Session = Depends(get_db)):
    # Contamos las órdenes según su estado actual en la base de datos
    pendientes = db.query(OrdenTrabajo).filter(OrdenTrabajo.estado == "Pendiente").count()
    en_proceso = db.query(OrdenTrabajo).filter(OrdenTrabajo.estado == "En Proceso").count()
    terminadas = db.query(OrdenTrabajo).filter(OrdenTrabajo.estado == "Terminada").count()
    
    # Contamos el total de cuadrillas registradas
    total_cuadrillas = db.query(EquipoTrabajo).count()
    
    return {
        "pendientes": pendientes,
        "en_proceso": en_proceso,
        "terminadas": terminadas,
        "total_cuadrillas": total_cuadrillas
    }