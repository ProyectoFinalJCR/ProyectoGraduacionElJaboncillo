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

def rangos():
    rangos = [
        ("1cm-5cm","Rango en Centimetro"),
        ("6cm-10cm", "Rango en Centimetro"),
        ("10cm-15cm", "Rango en Centimetro"),
        ("15cm-20cm", "Rango en Centimetro"),
        ("20cm-30cm", "Rango en Centimetro"),
        ("30cm-40cm", "Rango en Centimetro"),
        ("40cm-50cm", "Rango en Centimetro"),
        ("50cm-60cm", "Rango en Centimetro"),
        ("60cm-70cm", "Rango en Centimetro"),
        ("70cm-80cm", "Rango en Centimetro"),
        ("80cm-90cm", "Rango en Centimetro"),
        ("9Ocm-100cm", "Rango en Centimetro"),
        ("1M-10M","Rango en Metro"),
        ("11M-20M", "Rango en Metro"),
        ("20M-30M", "Rango en Metro"),
        ("31M-40M", "Rango en Metro"),
        ("41M-50M", "Rango en Metro"),
        ("51M-60M", "Rango en Metro"),
        ("61M-70M", "Rango en Metro"),
        ("71M-80M", "Rango en Metro"),
        ("81M-90M", "Rango en Metro"),
        ("91M-100M", "Rango en Metro"),
        ("100M-110M", "Rango en Metro"),
        ("0°C - 5°C", "Rango en Frío extremo (peligroso para la mayoría de las plantas)"),
        ("6°C - 10°C", "Rango en Frío (rango marginal para algunas plantas resistentes)"),
        ("11°C - 15°C", "Rango en Fresco (adecuado para plantas de clima fresco)"),
        ("16°C - 20°C", "Rango en Temperatura Moderada (ideal para muchas plantas)"),
        ("21°C - 25°C", "Rango en Templado (excelente para la mayoría de las plantas)"),
        ("26°C - 30°C", "Rango en Cálido (bueno para plantas tropicales y subtropicales)"),
        ("31°C - 35°C", "Rango en Calor Alto (aceptable para plantas adaptadas al calor)"),
        ("36°C - 40°C", "Rango en Calor extremo (peligroso para muchas plantas)"),
        ("41°C - 45°C", "Rango en Calor crítico (solo para plantas extremadamente resistentes al calor)"),
        ("1 mes - 3 meses", "Ciclo de vida corto (Plantas anuales de rápido crecimiento)"),
        ("4 meses - 6 meses", "Ciclo de vida medio (Plantas de temporada como hortalizas y flores)"),
        ("7 meses - 1 año", "Ciclo de vida largo anual (Plantas que completan su ciclo en un año)"),
        ("1 año - 2 años", "Plantas bienales (Tardan dos años en completar su ciclo)"),
        ("2 años - 5 años", "Plantas perennes de vida corta (Como algunas hierbas y plantas ornamentales)"),
        ("6 años - 10 años", "Plantas perennes de vida media (Algunas plantas leñosas y arbustos)"),
        ("10 años - 20 años", "Plantas perennes de vida larga (Arbustos grandes y árboles pequeños)")
        ]
    for rango, descripcion in rangos:
        data = Rangos(rango=rango,descripcion=descripcion)
        db.session.add(data)
        db.session.commit()

def unidades_medidas():
    unidades_medidas = [
        ("Metro"),
        ("Kilogramo"),
        ("Tiempo"),
        ("Temperatura"),
        
        
    ]
    for unidad_medida in unidades_medidas:
        data = Unidades_Medidas (unidad_medida=unidad_medida)
        db.session.add (data)
        db.session.commit()

def tipos_medidas():
    tipos_medidas = [
        ("Longitud","Es la medida de la distancia entre dos puntos. Sus unidades incluyen metros, kilómetros, pies, entre otros."),
        ("Masa/peso", "La masa es la cantidad de materia que tiene un objeto, mientras que el peso es la fuerza ejercida por la gravedad sobre esa masa. Se mide en kilogramos, gramos, libras, etc."),
        ("Segundo","Unidad básica de tiempo en el Sistema Internacional de Unidades (SI). Equivale a una fracción específica del día terrestre."),
        ("Semana","Unidad de tiempo equivalente a siete días."),
        ("Mes","Unidad de tiempo basada en la duración de las fases de la luna, equivalente a aproximadamente 30 o 31 días."),
        ("Año","Unidad de tiempo que corresponde al período que tarda la Tierra en completar una vuelta alrededor del Sol, aproximadamente 365 días."),
        ("Clesius","Escala de temperatura donde el punto de congelación del agua es 0 °C y el de ebullición es 100 °C."),
        ("Kelvin","Escala de temperatura absoluta utilizada en ciencia. Comienza en el cero absoluto, el punto teórico más bajo de temperatura (0 K)."),
        ("Farenheit","Escala de temperatura utilizada principalmente en los Estados Unidos, donde el punto de congelación del agua es 32 °F y el de ebullición es 212 °F."),
        
    ]
    
    for medida , descripcion in tipos_medidas:
        data = Tipos_Medidas(medida=medida, descripcion=descripcion)
        db.session.add (data)
        db.session.commit()

def temporadas_plantacion():
    temporadas = [
        ("Primavera", "La mejor época para la plantación de la mayoría de las plantas, debido a las condiciones climáticas ideales."),
        ("Verano", "Temporada ideal para plantas que requieren calor y luz solar intensa."),
        ("Otoño", "Adecuado para la plantación de árboles y plantas perennes."),
        ("Invierno", "Plantación de especies resistentes al frío o que se desarrollan mejor en climas fríos."),
        ("Navideña","Esta temporada hace referencia a las fiestas navideñas"),
        ("Dia de los muertos","Es una planta de temporada del dia 2 de noviembrey semanas cercas a la fecha")
        
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
        ("Bioestimulamtes","malezas que pueden afectar la producción agrícola."),
        ("Reguladores de Crecimiento"," Controlan y modifican el crecimiento y desarrollo de las plantas. Se utilizan para inducir la floración, frenar el crecimiento excesivo o mejorar el tamaño de los frutos."),
        ("Herbicidas"," Se utilizan para el control de malezas que compiten con las plantas por recursos como agua, luz y nutrientes."),
        ("Angentes de control biologico","Utilizan organismos vivos (insectos beneficiosos, bacterias, hongos) para controlar plagas y enfermedades."),
        
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
        ("Devolución", "Retorno de productos al proveedor o por parte del cliente."),
    ]
    
    for tipo_movimiento, descripcion in movimientos:
        data = Tipo_Movimientos(tipo_movimiento=tipo_movimiento, descripcion=descripcion)
        db.session.add(data)
        db.session.commit()

def tipos_suelos():
    suelos = [
        ("Arcilloso", "Suelo pesado que retiene agua, adecuado para plantas que necesitan humedad constante."),
        ("Arenoso", "Suelo ligero que drena rápidamente, ideal para plantas que prefieren ambientes secos."),
        ("Limoso", "Suelo rico en nutrientes, adecuado para la mayoría de las plantas."),
        ("Pedregoso", "Suelo con rocas y buen drenaje, ideal para especies que necesitan suelo seco.")
    ]
    
    for tipo_suelo, descripcion in suelos:
        data = Tipos_Suelos(tipo_suelo=tipo_suelo, descripcion=descripcion)
        db.session.add(data)
        db.session.commit()

def condiciones_almacenamiento():
    condiciones_almacenamiento = [
        ("Agua luz temperatura adecuada"),
        ("Suelos aireados, riego moderado."),
        ("Suelos ricos, luz solar."),
        ("Suelos fértiles, soporte vertical."),
        ("Suelos aireados, riego moderado."),
        ("Suelos pobres, alta humedad."),
        ("Sombra, suelo húmedo, fresco."),
        ("Riqueza en suelo, humedad."),
        ("Suelos ricos, control riego."),
        ("Suelos arenosos, resistencia sequía."),
        ("Profundidad, luz adecuada, riego."),
         
    ]
    for condicion in condiciones_almacenamiento:
        data = Condiciones_almacenamiento(condicion=condicion)
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
    ("Costero", "Cerca del mar, con salinidad y viento."),
    ("Montaña", "Alta altitud y temperaturas frescas."),

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
    #unidades_medidas()
    #rangos()
    # composiciones_principales()
    #tipos_medidas()
    #temporadas_plantacion()
    #aplicaciones()
    #requerimientos_agua()
    # tipo_movimientos()
    #tipos_suelos()
    #condiciones_almacenamiento()
    #entornos_ideales()        
    
