import pytest
from models import (
    Plantas,
    Entornos_Ideales,
    Requerimientos_Agua,
    Tipos_Suelos,
    Temporadas_Plantacion
)

def test_crear_planta():
    # Crear objetos de dependencias simuladas
    entorno = Entornos_Ideales(id=1, entorno="Interior", descripcion="Ambientes internos con poca luz")
    agua = Requerimientos_Agua(id=1, requerimiento_agua="Moderado", descripcion="Riego moderado")
    suelo = Tipos_Suelos(id=1, tipo_suelo="Arenoso", descripcion="Suelo con buen drenaje")
    temporada = Temporadas_Plantacion(id=1, temporada="Primavera", descripcion="Clima cálido")

    # Crear una planta
    planta = Plantas(
        id=1,
        nombre="Orquídea",
        descripcion="Flor exótica",
        entorno_ideal_id=entorno.id,
        requerimiento_agua_id=agua.id,
        tipo_suelo_id=suelo.id,
        temporada_plantacion_id=temporada.id,
        precio_venta=25.0
    )

    # Validar atributos
    assert planta.nombre == "Orquídea"
    assert planta.descripcion == "Flor exótica"
    assert planta.precio_venta == 25.0
    assert planta.entorno_ideal_id == entorno.id
    assert planta.requerimiento_agua_id == agua.id

def test_relacionar_entorno_ideal():
    # Crear un entorno ideal
    entorno = Entornos_Ideales(id=1, entorno="Exterior", descripcion="Ambientes externos soleados")
    
    # Crear una planta que use ese entorno
    planta = Plantas(
        id=2,
        nombre="Girasol",
        descripcion="Planta alta y amarilla",
        entorno_ideal_id=entorno.id,
        requerimiento_agua_id=1,
        tipo_suelo_id=1,
        temporada_plantacion_id=1,
        precio_venta=15.0
    )

    # Validar relación simulada
    assert planta.entorno_ideal_id == entorno.id
