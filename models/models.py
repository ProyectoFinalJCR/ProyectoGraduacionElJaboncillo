from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func

db = SQLAlchemy()

class Entornos_Ideales(db.Model):
    __tablename__ = 'entornos_ideales'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    entorno = db.Colum(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)
class Requerimientos_Agua(db.Model):
    __tablename__ = 'requerimientos_agua'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    requerimiento_agua = db.Colum(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)
class Tipos_Suelos(db.Model):
    __tablename__ = 'tipos_suelos'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    tipo_suelo = db.Colum(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)
class Temporadas_Plantacion(db.Model):
    __tablename__ = 'temporadas_plantacion'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    temporada = db.Colum(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)
class Rangos(db.Model):
    __tablename__ = 'rangos'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    rango = db.Colum(db.String, unique=True, nullable=False)
class Tipos_Medidas(db.Model):
    __tablename__ = 'tipos_medidas'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    medida = db.Colum(db.String, unique=True, nullable=False)

class Plantas(db.Model):
    __tablename__ = 'plantas'
    id = db.Column(db.Integer, primary_Key=True, autoincrement=True)
    nombre = db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)
    entorno_ideal_id = db.Column(db.Integer, db.ForeingKey('entornos_ideales.id'))
    requerimiento_agua_id = db.Column(db.Integer, db.ForeingKey('requerimientos_agua.id'))
    tipo_suelo_id = db.Column(db.Integer, db.ForeingKey('tipos_suelos.id'))
    temporada_plantacion_id = db.Column(db.Integer, db.ForeingKey('temporadas_plantacion.id'))
class Rangos_Medidas(db.Model):
    __tablename__ = 'rangos'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    rango_id = db.Column(db.Integer, db.ForeingKey('rangos.id'))
    tipos_medidas_id = db.Column(db.Integer, db.ForeingKey('tipos_medidas.id'))
    plantas_id = db.Column(db.Integer, db.ForeingKey('plantas.id'))

class Unidades_Medidas(db.Model):
    __tablename__ = 'unidades_medidas'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    unidad_medida = db.Column(db.String, unique=True, nullable=False)

class Insumos(db.Model):
    __tablename__ = 'insumos'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String, unique=True, nullable=False)
    tipo_insumo = db.Column(db.String, nullable=False)
    descripcion = db.Column(db.String, nullable=False)
    color = db.Column(db.String, nullable=True)
    composicion_principal = db.Column(db.String, nullable=True)
    aplicacion = db.Column(db.String, nullable=True)
    frecuencia_aplicacion = db.Column(db.String, nullable=True)
    durabilidad = db.Column(db.String, nullable=True)
    codiciones_almacenamiento_id = db.Column(db.String, nullable=True)
    compatibilidad = db.Column(db.String, nullable=True)
    precauciones = db.Column(db.String, nullable=True)
    unidad_medida = db.Column(db.String, nullable=True)
class Insumos_Unidades(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    unidad_medida_id = db.Column(db.Integer, db.ForeingKey('unidades_medidas.id'))
    insumo_id = db.Column(db.Integer, db.ForeingKey('insumos.id'))

class Categorias(db.Model):
    __tablename__ = 'categorias'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    categoria= db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)

class Subcategorias(db.Model):
    __tablename__ = 'subcategorias'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'))
    subcategoria = db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)

class Plantas_Subcategoria(db.Model):
    __tablename__ = 'plantas_subcategoria'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    subcategoria_id = db.Column(db.Integer, db.ForeingKey('subcategorias.id'))
    planta_id = db.Column(db.Integer, db.ForeignKey('plantas.id'))

class Insumos_Subcategoria(db.Model):
    __tablename__ = 'insumos_subcategoria'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    subcategoria_id = db.Column(db.Integer, db.ForeignKey('subcategorias.id'))
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumos.id'))

class Tipo_Movimiento(db.Model):
    __tablename__ = 'tipo_movimientos'
    id = db.Column(db.Integer, primary_Key=True, autoincrement=True)
    tipo_movimiento = db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)

class Stock(db.Model):
    __tablename__ = 'stock'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    planta_id = db.Column(db.Integer, db.ForeignKey('plantas.id'))
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumos.id'))
    cantidad = db.Column(db.Float, nullable=False)
    fecha_actualizacion = db.Column(db.Date, nullable=False)
    tipo_movimiento_id = db.Column(db.Integer, db.ForeignKey('tipo_movimientos.id'))
    descripcion = db.Column(db.String, nullable=False)
    imagen_url = db.Column(db.String, unique=True, nullable=False)
    estado = db.Column(db.Boolean, default=True)

class Proveedores(db.Model):
    __tablename__ = 'proveedores'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_proveedor = db.Column(db.String, nullable=False)
    correo_electronico = db.Column(db.String, unique=True, nullable=False)  
    telefono = db.Column(db.Integer, nullable=False)
    direccion = db.Column(db.String, nullable=False)

class Compras(db.Model):
    __tablename__ = 'compras'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedores.id'))
    fecha_compra = db.Column(db.Date, nullable=False)
    total = db.Column(db.Float, nullable=False)

class Detalle_Compra(db.Model):
    __tablename__ = 'detalle_compra'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    compra_id = db.Column(db.Integer, db.ForeignKey('compras.id'))
    stock_id = db.Column(db.Integer, db.ForeignKey('stock.id'))
    cantidad = db.Column(db.Float, nullable=False)
    precio_unitario = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False) 

