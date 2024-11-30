from crearBD import db, app 
from models import *

def colores(): 
    colores = [
        ("Blanco"),
        ("Negro"),
        ("Verde"),
        ("Amarillo"),
        ("Azul"),
        ("Rojo"),
        ("Naranja"),
        ("Violeta"),
        ("Celeste"),
        ("Rosado"),
        ("Gris"),
        ("Dorado"),
        ("Turquesa"),
        ("Verde Oscuro"),
        ("Azul Marino"),
        ("Crema"),
        ("Morado"),
        ("Purpura"),
        ("Colores varios"),
         
    ]
    for color in colores:
        data = Colores (color=color)
        db.session.add (data)
        db.session.commit()

def unidades_medidas():
    unidades_medidas = [
        ("Libra","LB"),
        ("Kilogramo", "Kg"),
        ("Gramo","Gr"),
        ("Quintales","Q"),
        ("Litro","Ltr"),
        ("Galones","Gls"),
        ("Camionada de tierra","Una camionada de tierra equivale a 300 sacos"),
        ("Sacos de tierra","Saco de tierra"),
        ("Metro cubico", "M3"),
                
    ]
    for unidad_medida, abreviatura in unidades_medidas:
        data = Unidades_Medidas (unidad_medida=unidad_medida, abreviatura=abreviatura)
        db.session.add (data)
        db.session.commit()

def temporadas_plantacion():
    temporadas = [
        ("Verano", "Temporada ideal para plantas que requieren calor y luz solar intensa."),
        ("Invierno", "Plantación de especies resistentes al frío o que se desarrollan mejor en climas fríos."),
    ]
    

    for temporada, descripcion in temporadas:
        data = Temporadas_Plantacion(temporada=temporada, descripcion=descripcion)
        db.session.add(data)
        db.session.commit()

def aplicaciones():
    aplicaciones = [
        ("fertilizantes","Mejoran la disponibilidad de nutrientes esenciales como nitrógeno (N), fósforo (P), y potasio (K), necesarios para el crecimiento de las plantas."),
        ("Sustras de cultivo","Proveen un medio de crecimiento ideal para las plantas, sustituyendo o mejorando el suelo. Se usan en macetas, semilleros o cultivos hidropónicos."),
        ("Insecticidas","Controlan o eliminanacion de plagas"),
        ("Enmiendas organicas","Controlan enfermedades fúngicas "),
        ("Reguladores de Crecimiento"," Controlan y modifican el crecimiento y desarrollo de las plantas. Se utilizan para inducir la floración, frenar el crecimiento excesivo o mejorar el tamaño de los frutos."),
        ("Herbicidas"," Se utilizan para el control de malezas que compiten con las plantas por recursos como agua, luz y nutrientes."),
    ]
    for aplicacion, descripcion in aplicaciones:
        data= Aplicaciones(aplicacion=aplicacion, descripcion=descripcion)
        db.session.add(data)
        db.session.commit()

def requerimientos_agua():
    requerimientos_agua = [
        ("Mucha agua","Son plantas que necesitan suelos húmedos o incluso inundados. Requieren riego frecuente o constante para prosperar."),
        ("cantidad moderada de agua","Necesitan un riego regular pero no constante. Prefieren suelos bien drenados y pueden tolerar un cierto grado de sequía."),
        ("Requieren poca agua","Están adaptadas a condiciones secas o áridas y pueden sobrevivir con riegos esporádicos. Son capaces de almacenar agua en sus tejidos o de reducir la pérdida de agua a través de la transpiración."),
        ("tolerantes a la sequía (xerófitas)","Pueden sobrevivir con condiciones de agua extremadamente escasa y están adaptadas para aprovechar el agua de manera muy eficiente."),
        ("Plantas de agua o hidrófitas","Estas plantas viven en ambientes acuáticos o en suelos constantemente saturados de agua."),
        ("Resumen de rangos de requerimiento de agua:","Necesitan entre 800-1500 mm por ciclo de cultivo (riego frecuente, suelos húmedos)."),
    ]
    for requerimiento_agua, descripcion in requerimientos_agua:
        data= Requerimientos_Agua(requerimiento_agua=requerimiento_agua, descripcion= descripcion)
        db.session.add(data)
        db.session.commit()


def tipo_movimientos():
    movimientos = [
        ("Compra", "Adquisición de plantas o insumos para el vivero."),
        ("Venta", "Comercialización de plantas a los clientes."),
        ("Salida a producción", "insumos a ser usados en producción."),
        ("Entrada a producción", "Planta agregadas de producción."),
        ("Devolución", "Retorno de productos por parte del cliente que regresan al stock."),
        ("Devolucion por daños", "Los productos que sufren daños, NO retornan al stock."),
        ("Cantidad inicial", "Los productos que se agregan por primera vez."),
        ("Baja de productos", "Los productos que se dan de baja."),
        
    ]
    
    for tipo_movimiento, descripcion in movimientos:
        data = Tipo_Movimientos(tipo_movimiento=tipo_movimiento, descripcion=descripcion)
        db.session.add(data)
        db.session.commit()

def tipos_suelos():
    suelos = [
        ("Arcilloso", "Suelo pesado que retiene agua, adecuado para plantas que necesitan humedad constante."),
        ("Arenoso", "Suelo ligero que drena rápidamente, ideal para plantas que prefieren ambientes secos."),
        ("Pedregoso", "Suelo con rocas y buen drenaje, ideal para especies que necesitan suelo seco.")
    ]
    
    for tipo_suelo, descripcion in suelos:
        data = Tipos_Suelos(tipo_suelo=tipo_suelo, descripcion=descripcion)
        db.session.add(data)
        db.session.commit()
        
def entornos_ideales():
    entornos_ideales = [
    ("Sombra", "Poca luz solar directa, para plantas que prefieren sombra."),
    ("Sol", "Exposición prolongada al sol, ideal para plantas de luz."),
    ("Mixto", "Sol parcial durante el día, mezcla de luz y sombra."),
    ("Interior", "Entorno con luz natural limitada o artificial."),
    ("Húmedo", "Alta humedad, ideal para plantas tropicales."),
    ("Seco", "Entorno árido, para plantas adaptadas a la sequía."),
    ("Boscoso", "Alta altitud y temperaturas frescas."),
    ]
    for entorno, descripcion in entornos_ideales:
        data = Entornos_Ideales(entorno=entorno, descripcion=descripcion)
        db.session.add(data)
        db.session.commit()

def composiciones_principales():
    composiciones_principales = [
        ("NPK","Fertilizante 10-10-10: Tiene 10% de nitrógeno, 10% de fósforo y 10% de potasio."),
        ("Compost","Es rico en materia orgánica y contiene pequeñas cantidades de N, P y K, con una composición variable según los materiales utilizados."),
        ("Estiércol","Aporta materia orgánica y nutrientes. Dependiendo del tipo de animal (vaca, caballo, pollo), varía su contenido en nitrógeno y otros nutrientes."),
        ("Humus de lombriz","Contiene altos niveles de nutrientes, particularmente nitrógeno y potasio, y mejora la estructura del suelo."),
        ("Turba","Es una enmienda rica en materia orgánica, ideal para mejorar la estructura del suelo."),
        ("Fibra de coco","Aporta un medio de cultivo bien aireado y retiene la humedad."),
        ("Extracto de algas marinas","Aumenta la resistencia al estrés y mejora el crecimiento."),
        ("Micorrizas","Hongos que ayudan a las raíces a absorber mejor el fósforo y otros nutrientes."),
        ("Extractos vegetales","Actúa como repelente de insectos."),
        ("Hongos entomopatógenos","Atacan insectos plaga como los ácaros o pulgones."),
        ("Glifosato","(herbicida no selectivo): Bloquea una enzima esencial para el crecimiento de las plantas."),
        ("2,4-D","(herbicida selectivo): Actúa principalmente en plantas de hoja ancha."),
    ]
    for composicion, descripcion in composiciones_principales:
        data = Composiciones_Principales(composicion=composicion, descripcion= descripcion)
        db.session.add(data)
        db.session.commit()


# with app.app_context():
    # entornos_ideales()        
    # tipos_suelos()
    # tipo_movimientos()
    # requerimientos_agua()
    # aplicaciones()
    # temporadas_plantacion()
    # composiciones_principales()
    # unidades_medidas()
    
