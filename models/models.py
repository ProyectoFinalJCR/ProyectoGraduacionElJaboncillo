from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func

db = SQLAlchemy()

class plantas(db.Model):
    __tablename__ = 'plantas'
    id = db.Column(db.Integer, primary_Key=True, autoincrement=True)
    nombre = db.Column(db.String, unique=True, nullable=False)
    tipo_planta = db.Column(db.String, nullable=False)
    tipo_crecimiento = db.Column(db.String, nullable=False)
    descripcion = db.Column(db.String, nullable=False)
    entorno_ideal = db.Column(db.String, nullable=False)
    requerimiento_agua = db.Column(db.String, nullable=False)
    requerimiento_suelo = db.Column(db.String, nullable=False)
    temporada_plantacion = db.Column(db.String, nullable=False)
    uso_comun = db.Column(db.String, nullable=False)

class insumos(db.Model):
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
    codiciones_almacenamiento = db.Column(db.String, nullable=True)
    compatibilidad = db.Column(db.String, nullable=True)
    precauciones = db.Column(db.String, nullable=True)
    unidad_medida = db.Column(db.String, nullable=True)


class categorias(db.Model):
    __tablename__ = 'categorias'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    categoria= db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)

class subcategorias(db.Model):
    __tablename__ = 'subcategorias'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'))
    subcategoria = db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)

class plantas_subcategoria(db.Model):
    __tablename__ = 'plantas_subcategoria'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    subcategoria_id = db.Column(db.Integer, db.ForeingKey('subcategorias.id'))
    planta_id = db.Column(db.Integer, db.ForeignKey('plantas.id'))

class insumos_subcategoria(db.Model):
    __tablename__ = 'insumos_subcategoria'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    subcategoria_id = db.Column(db.Integer, db.ForeignKey('subcategorias.id'))
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumos.id'))

class tipo_movimiento(db.Model):
    __tablename__ = 'tipo_movimientos'
    id = db.Column(db.Integer, primary_Key=True, autoincrement=True)
    tipo_movimiento = db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)

class stock(db.Model):
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

class proveedores(db.Model):
    __tablename__ = 'proveedores'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_proveedor = db.Column(db.String, nullable=False)
    correo_electronico = db.Column(db.String, unique=True, nullable=False)  
    telefono = db.Column(db.Integer, nullable=False)
    direccion = db.Column(db.String, nullable=False)

class compras(db.Model):
    __tablename__ = 'compras'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedores.id'))
    fecha_compra = db.Column(db.Date, nullable=False)
    total = db.Column(db.Float, nullable=False)

class detalle_compra(db.Model):
    __tablename__ = 'detalle_compra'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    compra_id = db.Column(db.Integer, db.ForeignKey('compras.id'))
    stock_id = db.Column(db.Integer, db.ForeignKey('stock.id'))
    cantidad = db.Column(db.Float, nullable=False)
    precio_unitario = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False) 

