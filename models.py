from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func

db = SQLAlchemy()

class Aplicaciones (db.Model):
    __tablename__ = 'aplicaciones'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    aplicacion = db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=True)

class Composiciones_Principales (db.Model):
    __tablename__ = 'composiciones_principales'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    composicion = db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=True)

class Unidades_Medidas (db.Model):
    __tablename__ = 'unidades_medidas'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    unidad_medida = db.Column(db.Integer, unique=True, nullable=False)

    
class Rangos(db.Model):
    __tablename__= 'rangos'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    rango = db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, unique=True, nullable=False)

class Tipos_Medidas(db.Model):
    __tablename__= 'tipos_medidas'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    medida = db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, unique=True, nullable=False)

class Requerimientos_Agua (db.Model):
    __tablename__ = 'requerimientos_agua'
    id = db.Column (db.Integer, primary_key=True, autoincrement =True)
    requerimiento_agua =db.Column (db.String, unique=True, nullable=False)
    descripcion =db.Column (db.String, nullable=True)

class Condiciones_almacenamiento (db.Model):
    __tablename__ = 'condiciones_almacenamiento'
    id =db.Column (db.Integer, primary_key=True, autoincrement =True)
    condicion =db.Column (db.String, unique=True, nullable=False)

class Colores (db.Model):
    __tablename__ = 'colores'
    id =db.Column (db.Integer, primary_key=True, autoincrement =True)
    color =db.Column (db.String, unique=True, nullable=False)
 
class Entornos_Ideales(db.Model):
    __tablename__ = 'entornos_ideales'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    entorno = db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)

class Tipos_Suelos(db.Model):
    __tablename__ = 'tipos_suelos'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    tipo_suelo = db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)

class Temporadas_Plantacion(db.Model):
    __tablename__ = 'temporadas_plantacion'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    temporada = db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)


class Plantas(db.Model):
    __tablename__ = 'plantas'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String, unique=True, nullable=False)
    descripcion = db.Column(db.String, nullable=False)
    entorno_ideal_id = db.Column(db.Integer, db.ForeignKey('entornos_ideales.id'))
    requerimiento_agua_id = db.Column(db.Integer, db.ForeignKey('requerimientos_agua.id'))
    tipo_suelo_id = db.Column(db.Integer, db.ForeignKey('tipos_suelos.id'))
    temporada_plantacion_id = db.Column(db.Integer, db.ForeignKey('temporadas_plantacion.id'))

class Colores_plantas (db.Model):
    __tablename__ = 'colores_plantas'
    id =db.Column (db.Integer, primary_key=True, autoincrement =True)
    color_id =db.Column (db.Integer, db.ForeignKey('colores.id')) 
    planta_id =db.Column (db.Integer, db.ForeignKey('plantas.id'))     

class Insumos(db.Model):
    __tablename__ = 'insumos'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String, unique=True, nullable=False)
    tipo_insumo = db.Column(db.String, nullable=False)
    descripcion = db.Column(db.String, nullable=False)
    composicion_principal_id =db.Column(db.Integer, db.ForeignKey('composiciones_principales.id'))
    frecuencia_aplicacion = db.Column(db.String, nullable=True)
    durabilidad = db.Column(db.String, nullable=True)
    codiciones_almacenamiento_id = db.Column(db.Integer, db.ForeignKey('condiciones_almacenamiento.id'))
    compatibilidad = db.Column(db.String, nullable=True)
    precauciones = db.Column(db.String, nullable=True)

class Insumos_Unidades(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    unidad_medida_id = db.Column(db.Integer, db.ForeignKey('unidades_medidas.id'))
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumos.id'))

class Aplicaciones_Insumos (db.Model):
    __tablename__ = 'aplicaciones_insumos'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    aplicacion_id = db.Column(db.Integer, db.ForeignKey('aplicaciones.id'))  
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumos.id')) 

class Colores_Insumos (db.Model):
    __tablename__ = 'condiciones_insumos'
    id =db.Column (db.Integer, primary_key=True, autoincrement =True)
    color_id =db.Column (db.Integer, db.ForeignKey('colores.id')) 
    insumo_id =db.Column (db.Integer, db.ForeignKey('insumos.id')) 

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
    subcategoria_id = db.Column(db.Integer, db.ForeignKey('subcategorias.id'))
    planta_id = db.Column(db.Integer, db.ForeignKey('plantas.id'))

class Rangos_Medidas(db.Model):
    __tablename__= 'rangos_medidas'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    rango_id = db.Column(db.Integer, db.ForeignKey('rangos.id') )
    medida_id = db.Column(db.Integer, db.ForeignKey('tipos_medidas.id'))
    planta_id = db.Column(db.Integer, db.ForeignKey('plantas.id'))

class Insumos_Subcategoria(db.Model):
    __tablename__ = 'insumos_subcategoria'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    subcategoria_id = db.Column(db.Integer, db.ForeignKey('subcategorias.id'))
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumos.id'))

class Tipo_Movimientos(db.Model):
    __tablename__ = 'tipo_movimientos'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
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

class Roles(db.Model):
    __tablename__ = 'roles'
    id = db.Column (db.Integer, primary_key=True, autoincrement=True)
    rol = db.Column (db.String,unique=True, nullable=False )

class Rutas(db.Model):
    __tablename__ = 'rutas'
    id = db.Column (db.Integer, primary_key=True, autoincrement=True)
    ruta = db.Column (db.String,unique=True, nullable=False )

class Rutas_roles(db.Model):
    __tablename__ = 'rutas_roles'
    id = db.Column (db.Integer, primary_key=True, autoincrement=True)
    rol_id = db.Column(db.Integer, db.ForeignKey('roles.id'))
    ruta_id = db.Column(db.Integer, db.ForeignKey('rutas.id'))


class Usuarios(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column (db.Integer, primary_key=True , autoincrement=True)
    nombre_completo = db.Column (db.String, unique=True , nullable=False)
    correo = db.Column (db.String, nullable=True)
    clave = db.Column (db.String, nullable=True)
    rol_id = db.Column (db.Integer, db.ForeignKey('roles.id'))


class Facturas (db.Model):
    __tablename__ = 'facturas'
    id =db.Column (db.Integer, primary_key=True, autoincrement =True)
    nombre_cliente =db.Column(db.String, unique=True, nullable=False)
    usuario_id= db.Column (db.Integer, db.ForeignKey('usuarios.id'))
    fecha_factura= db.Column (db.Date, nullable=False)
    total = db.Column (db.Float, nullable=False)

class Detalles_Factura (db.Model):
    __tablename__ = 'detalles_factura'
    detalle_id = db.Column(db.Integer, primary_key=True, autoincrement =True)
    factura_id = db.Column(db.Integer, db.ForeignKey ('facturas.id'))
    stock_id = db.Column (db.Integer, db.ForeignKey ('stock.id')) 
    cantidad = db.Column (db.Float, nullable=False)
    precio_unitario = db.Column (db.Float, nullable=False) 
    subtotal = db.Column (db.Float, nullable= False)

class Devoluciones (db.Model):
    __tablename__ = 'devoluciones'
    devolucion_id =db.Column (db.Integer, primary_key=True, autoincrement =True)
    stock_id =db.Column (db.Integer, db.ForeignKey('stock.id'))
    factura_id = db.Column (db.Integer, db.ForeignKey('facturas.id'))
    cantidad_producto = db.Column (db.Float, nullable=False)
    motivo = db.Column (db.String, unique=True , nullable=False)
    fecha_devolucion = db.Column (db.Date, nullable=False)

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

class Detalles_Compra(db.Model):
    __tablename__ = 'detalle_compra'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    compra_id = db.Column(db.Integer, db.ForeignKey('compras.id'))
    stock_id = db.Column(db.Integer, db.ForeignKey('stock.id'))
    cantidad = db.Column(db.Float, nullable=False)
    precio_unitario = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False) 
class Listas_deseo(db.Model):
    __tablename__ = 'listas_deseo'
    lista_deseo_id = db.Column (db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column (db.Integer, db.ForeignKey ('usuarios.id'))
    planta_id = db.Column (db.Integer, db.ForeignKey ('plantas.id'))
    insumo_id = db.Column (db.Integer, db.ForeignKey ('insumos.id'))
    fecha = db.Column (db.Date, nullable=False)

