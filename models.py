from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func

db = SQLAlchemy()

class Aplicaciones (db.Model):
    __tablename__ = 'aplicaciones'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    aplicacion = db.Column(db.String, nullable=False)
    descripcion = db.Column(db.String, nullable=True)

class Composiciones_Principales (db.Model):
    __tablename__ = 'composiciones_principales'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    composicion = db.Column(db.String, nullable=False)
    descripcion = db.Column(db.String, nullable=True)

class Unidades_Medidas (db.Model):
    __tablename__ = 'unidades_medidas'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    unidad_medida = db.Column(db.String, nullable=False)
    abreviatura = db.Column(db.String, nullable=False)

    
class Rangos(db.Model):
    __tablename__= 'rangos'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    rango = db.Column(db.String, nullable=False)


class Requerimientos_Agua (db.Model):
    __tablename__ = 'requerimientos_agua'
    id = db.Column (db.Integer, primary_key=True, autoincrement =True)
    requerimiento_agua =db.Column (db.String, nullable=False)
    descripcion =db.Column (db.String, nullable=True)

class Colores (db.Model):
    __tablename__ = 'colores'
    id =db.Column (db.Integer, primary_key=True, autoincrement =True)
    color =db.Column (db.String, nullable=False)
 
class Entornos_Ideales(db.Model):
    __tablename__ = 'entornos_ideales'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    entorno = db.Column(db.String, nullable=False)
    descripcion = db.Column(db.String, nullable=False)

class Tipos_Suelos(db.Model):
    __tablename__ = 'tipos_suelos'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    tipo_suelo = db.Column(db.String, nullable=False)
    descripcion = db.Column(db.String, nullable=False)

class Temporadas_Plantacion(db.Model):
    __tablename__ = 'temporadas_plantacion'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    temporada = db.Column(db.String, nullable=False)
    descripcion = db.Column(db.String, nullable=False)


class Plantas(db.Model):
    __tablename__ = 'plantas'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String, nullable=False)
    descripcion = db.Column(db.String, nullable=False)
    imagen_url = db.Column(db.String, nullable=True)
    entorno_ideal_id = db.Column(db.Integer, db.ForeignKey('entornos_ideales.id'), nullable = False)
    requerimiento_agua_id = db.Column(db.Integer, db.ForeignKey('requerimientos_agua.id'), nullable = False)
    tipo_suelo_id = db.Column(db.Integer, db.ForeignKey('tipos_suelos.id'), nullable = False)
    temporada_plantacion_id = db.Column(db.Integer, db.ForeignKey('temporadas_plantacion.id'), nullable = False)
    imagen_url = db.Column(db.String, nullable=True)
    precio_venta = db.Column(db.Float, nullable=False)


class Colores_plantas (db.Model):
    __tablename__ = 'colores_plantas'
    id =db.Column (db.Integer, primary_key=True, autoincrement =True)
    color_id =db.Column (db.Integer, db.ForeignKey('colores.id'), nullable = False) 
    planta_id =db.Column (db.Integer, db.ForeignKey('plantas.id'), nullable = False)     

class Insumos(db.Model):
    __tablename__ = 'insumos'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String, nullable=False)
    tipo_insumo = db.Column(db.String, nullable=False)
    descripcion = db.Column(db.String, nullable=False)
    composicion_principal_id =db.Column(db.Integer, db.ForeignKey('composiciones_principales.id'), nullable = False)
    frecuencia_aplicacion = db.Column(db.String, nullable=True)
    compatibilidad = db.Column(db.String, nullable=True)
    precauciones = db.Column(db.String, nullable=True)
    imagen_url = db.Column(db.String, nullable=True)
    fecha_vencimiento = db.Column(db.Date, nullable=True)
    precio_venta = db.Column(db.Float, nullable=False)

class Insumos_Unidades(db.Model):
    __tablename__ = 'insumos_unidades'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True )
    unidad_medida_id = db.Column(db.Integer, db.ForeignKey('unidades_medidas.id'), nullable = False)
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumos.id'), nullable = False)

class Aplicaciones_Insumos (db.Model):
    __tablename__ = 'aplicaciones_insumos'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    aplicacion_id = db.Column(db.Integer, db.ForeignKey('aplicaciones.id'), nullable = False)  
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumos.id'), nullable = False) 

class Colores_Insumos (db.Model):
    __tablename__ = 'colores_insumos'
    id =db.Column (db.Integer, primary_key=True, autoincrement =True)
    color_id =db.Column (db.Integer, db.ForeignKey('colores.id'), nullable = False) 
    insumo_id =db.Column (db.Integer, db.ForeignKey('insumos.id'), nullable = False) 

class Categorias(db.Model):
    __tablename__ = 'categorias'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    categoria= db.Column(db.String, nullable=False)
    descripcion = db.Column(db.String, nullable=False)

class Subcategorias(db.Model):
    __tablename__ = 'subcategorias'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'), nullable = False)
    subcategoria = db.Column(db.String, nullable=False)
    descripcion = db.Column(db.String, nullable=False)

class Plantas_Subcategoria(db.Model):
    __tablename__ = 'plantas_subcategoria'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    subcategoria_id = db.Column(db.Integer, db.ForeignKey('subcategorias.id'), nullable = False)
    planta_id = db.Column(db.Integer, db.ForeignKey('plantas.id'), nullable = False)

class Rangos_Medidas(db.Model):
    __tablename__= 'rangos_medidas'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    rango_id = db.Column(db.Integer, db.ForeignKey('rangos.id'), nullable = False)
    planta_id = db.Column(db.Integer, db.ForeignKey('plantas.id'), nullable = False)

class Insumos_Subcategoria(db.Model):
    __tablename__ = 'insumos_subcategoria'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    subcategoria_id = db.Column(db.Integer, db.ForeignKey('subcategorias.id'), nullable = False)
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumos.id'), nullable = False)

class Tipo_Movimientos(db.Model):
    __tablename__ = 'tipo_movimientos'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    tipo_movimiento = db.Column(db.String, nullable=False)
    descripcion = db.Column(db.String, nullable=False)

class Stock(db.Model):
    __tablename__ = 'stock'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    planta_id = db.Column(db.Integer, db.ForeignKey('plantas.id'), nullable = True)
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumos.id'), nullable = True)
    cantidad = db.Column(db.Float, nullable=False)
    kardex_id = db.Column(db.Integer, db.ForeignKey('movimientos_kardex.id'), nullable = False)
    precio_total_inversion = db.Column(db.Float, nullable=False)
    estado = db.Column(db.String, default=True)

class Roles(db.Model):
    __tablename__ = 'roles'
    id = db.Column (db.Integer, primary_key=True, autoincrement=True)
    rol = db.Column (db.String, nullable=False )

class Rutas(db.Model):
    __tablename__ = 'rutas'
    id = db.Column (db.Integer, primary_key=True, autoincrement=True)
    ruta = db.Column (db.String, nullable=False )

class Rutas_roles(db.Model):
    __tablename__ = 'rutas_roles'
    id = db.Column (db.Integer, primary_key=True, autoincrement=True)
    rol_id = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable = False)
    ruta_id = db.Column(db.Integer, db.ForeignKey('rutas.id'), nullable = False)


class Usuarios(db.Model):
    __tablename__ = 'usuarios'
    id = db.Column (db.Integer, primary_key=True , autoincrement=True)
    nombre_completo = db.Column (db.String, nullable=False)
    correo = db.Column (db.String, unique=True, nullable=False)
    clave = db.Column (db.String, nullable=True)
    rol_id = db.Column (db.Integer, db.ForeignKey('roles.id'), nullable = False)

class Divisas(db.Model):
    __tablename__ = 'divisas'
    id = db.Column (db.Integer, primary_key=True , autoincrement=True)
    divisa = db.Column (db.String, nullable=False)
    abreviatura = db.Column (db.String, nullable=False)
    equivalente_cordobas = db.Column (db.Float, nullable=False)

class Ventas (db.Model):
    __tablename__ = 'ventas'
    id =db.Column (db.Integer, primary_key=True, autoincrement =True)
    nombre_cliente =db.Column(db.String, nullable=False)
    usuario_id= db.Column (db.Integer, db.ForeignKey('usuarios.id'), nullable = True)
    fecha_venta = db.Column (db.Date, nullable=False)
    divisa_id = db.Column (db.Integer, db.ForeignKey('divisas.id'), nullable = True)
    nota = db.Column (db.String, nullable=True)
    total = db.Column (db.Float, nullable=False)
    estado = db.Column (db.String, nullable=False)

class Movimientos_kardex (db.Model):
    __tablename__ = 'movimientos_kardex'
    id = db.Column (db.Integer, primary_key=True, autoincrement =True)
    planta_id = db.Column (db.Integer, db.ForeignKey ('plantas.id'), nullable = True)
    insumo_id = db.Column (db.Integer, db.ForeignKey ('insumos.id'), nullable = True)
    cantidad = db.Column (db.Float, nullable=False)
    tipo_movimiento_id = db.Column (db.Integer, db.ForeignKey('tipo_movimientos.id'), nullable = False)
    precio_unitario = db.Column (db.Float, nullable=False)
    fecha_movimiento = db.Column (db.Date, nullable=False)
    nota = db.Column (db.String, nullable=True)

class Detalle_ventas (db.Model):
    __tablename__ = 'detalle_ventas'
    id = db.Column(db.Integer, primary_key=True, autoincrement =True)
    planta_id = db.Column (db.Integer, db.ForeignKey ('plantas.id'), nullable = False) 
    insumo_id = db.Column (db.Integer, db.ForeignKey ('insumos.id'), nullable = False)
    venta_id = db.Column(db.Integer, db.ForeignKey ('ventas.id'), nullable = False)
    kardex_id = db.Column (db.Integer, db.ForeignKey ('movimientos_kardex.id'), nullable = False)
    cantidad = db.Column (db.Float, nullable=False)
    precio_unitario = db.Column (db.Float, nullable=False) 
    subtotal = db.Column (db.Float, nullable= False)

class Devoluciones (db.Model):
    __tablename__ = 'devoluciones'
    id =db.Column (db.Integer, primary_key=True, autoincrement =True)
    venta_id = db.Column (db.Integer, db.ForeignKey('ventas.id'), nullable = True)
    cantidad_producto = db.Column (db.Float, nullable=False)
    motivo = db.Column (db.String, nullable=False)
    fecha_devolucion = db.Column (db.Date, nullable=False)
    total = db.Column (db.Float, nullable=False)

class Detalle_devoluciones (db.Model):
    __tablename__ = 'detalle_devoluciones'
    id = db.Column(db.Integer, primary_key=True, autoincrement =True)
    devolucion_id = db.Column (db.Integer, db.ForeignKey('devoluciones.id'), nullable = False)
    planta_id = db.Column (db.Integer, db.ForeignKey('plantas.id'), nullable = True)
    insumo_id = db.Column (db.Integer, db.ForeignKey('insumos.id'), nullable = True)
    kardex_id =db.Column (db.Integer, db.ForeignKey('movimientos_kardex.id'), nullable = False)
    cantidad = db.Column (db.Float, nullable=False)
    precio_unitario = db.Column (db.Float, nullable=False)
    subtotal = db.Column (db.Float, nullable=False)

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
    proveedor_id = db.Column(db.Integer, db.ForeignKey('proveedores.id'), nullable = False)
    fecha_compra = db.Column(db.Date, nullable=False)
    total = db.Column(db.Float, nullable=False)

class Detalles_Compra(db.Model):
    __tablename__ = 'detalle_compra'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    compra_id = db.Column(db.Integer, db.ForeignKey('compras.id'), nullable = True)
    planta_id = db.Column(db.Integer, db.ForeignKey('plantas.id'), nullable = True)
    insumo_id = db.Column(db.Integer, db.ForeignKey('insumos.id'), nullable = False)
    kardex_id = db.Column(db.Integer,db.ForeignKey("movimientos_kardex.id"), nullable = False)
    cantidad = db.Column(db.Float, nullable=False)
    precio_unitario = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False) 
    
class Produccion(db.Model):
    __tablename__ = 'produccion'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nota = db.Column(db.String, nullable=False)
    fecha = db.Column(db.Date, nullable=False)

class Detalle_produccion(db.Model):
    __tablename__ = 'detalle_produccion'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    produccion_id = db.Column(db.Integer, db.ForeignKey('produccion.id'), nullable = False)
    planta_id = db.Column(db.Integer, db.ForeignKey('plantas.id'), nullable = True)
    kardex_id = db.Column(db.Integer, db.ForeignKey('movimientos_kardex.id'), nullable = False)
    cantidad = db.Column(db.Integer, nullable=False)

class Listas_deseo(db.Model):
    __tablename__ = 'listas_deseo'
    lista_deseo_id = db.Column (db.Integer, primary_key=True, autoincrement=True)
    usuario_id = db.Column (db.Integer, db.ForeignKey ('usuarios.id'), nullable = False)
    planta_id = db.Column (db.Integer, db.ForeignKey ('plantas.id'), nullable = False)
    insumo_id = db.Column (db.Integer, db.ForeignKey ('insumos.id'), nullable = False)
    fecha = db.Column (db.Date, nullable=False)

class configuracion_sistema(db.Model):
    __tablename__ = 'configuracion_sistema'
    id = db.Column (db.Integer, primary_key=True, autoincrement=True)
    nombre_empresa = db.Column (db.String, nullable=False)
    direccion = db.Column (db.String, nullable=False)
    telefono = db.Column (db.String, nullable=False)
    email = db.Column (db.String, nullable=False)
    logo_empresa_url = db.Column (db.String, nullable=False)
    numero_RUC = db.Column (db.String, nullable=False)
    link_facebook = db.Column (db.String, nullable=False)
    link_instagram = db.Column (db.String, nullable=False)
    link_tiktok = db.Column (db.String, nullable=False)
    link_whatsapp = db.Column (db.String, nullable=False)

