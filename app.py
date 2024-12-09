import os
import requests
from datetime import datetime, timedelta
from flask import Flask, jsonify, render_template, redirect, request, session, flash, url_for
from flask_socketio import SocketIO, emit
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from dotenv import load_dotenv
from functools import wraps
from models import *
from sqlalchemy import extract, func, case

from sqlalchemy import create_engine, text
from sqlalchemy.orm import scoped_session, sessionmaker
load_dotenv()

app = Flask(__name__)


# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)
socketio = SocketIO(app)

#Set up database
engine = create_engine(os.getenv("DATABASE_URL"), pool_pre_ping=True)
db = scoped_session(sessionmaker(bind=engine))

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '-1'
    return response

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        
        if session.get("user_id") is None:
            return redirect("/login")
        
        return f(*args, **kwargs)
    return decorated_function


# Función para obtener las rutas permitidas para un perfil desde la base de datos
def obtener_rutas_permitidas(usuario):
        # Consulta para obtener el perfil y las rutas permitidas para ese perfil
        consulta = text('''SELECT r."ruta" FROM usuarios as u INNER JOIN roles as ro ON u.rol_id = ro.id
        INNER JOIN rutas_roles as rr ON rr.rol_id = ro.id
        INNER JOIN rutas as r ON rr.ruta_id = r.id
        WHERE u.id = :usuario ''')
        rutas = db.execute(consulta, {'usuario': usuario}).fetchall()
        # Convertir el resultado a diccionario para poder acceder con claves
        rutas_permitidas = [row[0] for row in rutas]  # Accediendo por nombre de columna
        return rutas_permitidas

# Decorador para verificar si el usuario tiene acceso a la ruta
def ruta_permitida(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        usuario = session.get("user_id")
        if usuario is None:
            return redirect("/")

        # Obtener las rutas permitidas para el usuario
        rutas_permitidas = obtener_rutas_permitidas(usuario)
        ruta_actual = request.path  # Obtener la ruta que está intentando acceder

        if ruta_actual not in rutas_permitidas:
            return "Acceso denegado", 403
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def index():
    ObtenerDatosConfig = text('SELECT * FROM configuracion_sistema')
    datos_configuracion = db.execute(ObtenerDatosConfig).fetchone()
    return render_template('index.html', datos_configuracion=datos_configuracion)


@app.route('/login', methods = ["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template('iniciar_sesion.html')
    else:
        data = request.get_json()
        # userEmail = request.form.get('userEmail')
        # userPassword = request.form.get('userPassword')

        if not data:
            return jsonify({"success": False, "message": "No se recibieron datos."}), 400

        userEmail = data.get('email')
        userPassword = data.get('password')

        #validar que ambos campos esten llenos
        # if not userEmail or not userPassword:
        #     return jsonify({"success": False, "message":"Verifique su correo electronico o contrasaña"}), 400
        print("para validar en la consulta " + userEmail)
        #seleccionar usuario de la bd
        select_user_query = text('''SELECT * FROM public."usuarios" as u INNER JOIN public.roles as r ON u."rol_id" = r."id" WHERE u."correo" = :email''')
        selected_user = db.execute(select_user_query,{'email':userEmail}).fetchone()

        if selected_user:
            #verificar contraseña
            if check_password_hash(selected_user[3], userPassword) and selected_user[2] == userEmail:
                session["user_id"] = selected_user[0]
                session["user_name"] = selected_user[1]
                session["rol_id"] = selected_user[4]
                session["user_rol"] = selected_user[7]

                print("tiene que ser el rol",session["user_rol"])
                print(session["rol_id"])
                #verifica el rol del usuario para redirigirlo a su vista correspondiente
                if session["user_rol"] == 'CLIENTE':
                    return jsonify({"success": True, "redirect":"/"}), 200
                else:
                    return jsonify({"success": True, "redirect": "/inicioAdmin"}), 200

            else:
                #contraseña incorrecta
                return jsonify({"success": False, "message":"Contraseña o correo electronico incorrecto"})
        else:
            #usuario no encontrado
            return jsonify({"success": False, "message":"Usuario no existe"})


#Solo para clientes 
@app.route('/register', methods=["GET", "POST"])
def registrarse():
    if request.method == "GET":
        return render_template('registrarse.html')
    else:
        userName = request.form.get('userName')
        userEmail = request.form.get('email')
        userPassword = request.form.get('password')
        userConfirmPassword = request.form.get('confirm_password')
        captcha_response = request.form.get('g-recaptcha-response') 

        if not captcha_response:
            return render_template("registrarse.html", error_msg="Por favor, completa el CAPTCHA.")


        # Validar CAPTCHA con Google
        secret_key = "6Ld-4pIqAAAAADM2JVXK_ulOEbybYC1IZLQvPge-"
        captcha_validation_url = "https://www.google.com/recaptcha/api/siteverify"
        data = {
            'secret': secret_key,
            'response': captcha_response
        }
        captcha_response = requests.post(captcha_validation_url, data=data).json()
        
        if not captcha_response.get('success'):
            return render_template("registrarse.html", error_msg="Por favor, completa el CAPTCHA correctamente.")
        

        if userPassword != userConfirmPassword:
            return render_template("registrarse.html", error_msg = "Las contraseñas no coinciden")
        else:
            hash_password = generate_password_hash(userPassword)
        
        duplicate_user = text('SELECT * FROM public."usuarios" WHERE "correo"=:correo')

        if db.execute(duplicate_user,{'correo': userEmail}).rowcount > 0:
            return render_template("registrarse.html", error_msg = "Un usuario como este ya existe, intenta nuevamente")
        else:
            new_user_client_query = text("INSERT INTO usuarios (nombre_completo, correo, clave, rol_id) VALUES (:userName, :userEmail, :userPassword, 3)")
            db.execute(new_user_client_query,{"userName":userName, "userEmail":userEmail, "userPassword": hash_password})
            db.commit()
            db.close()

            #asignar el session = id y rol si quieren que le de acceso una vez creó la cuenta
            #seleccionar usuario de la bd tabla usuarios
            seleccionar_usuario = text('''SELECT *, r."rol" FROM public."usuarios" as u INNER JOIN public.roles as r ON  u."rol_id" = r."id" WHERE "correo"=:email ''')
            usuario_seleccionado = db.execute(seleccionar_usuario,{'email': userEmail}).fetchone()
            session['user_id'] = usuario_seleccionado[0]
            session['rol_id'] = usuario_seleccionado[4]

            return redirect("/login")

@app.route('/categorias', methods=["GET", "POST"])
@login_required
@ruta_permitida
def categorias():
    if request.method == "GET":
        obtenerCategorias = text("SELECT * FROM categorias WHERE estado = true order by id asc")
        rows = db.execute(obtenerCategorias).fetchall()
        print(rows)
        return render_template('categorias.html', categorias=rows)
    
    else:
        categoria = request.form.get('categoria')
        descripcionCategoria = request.form.get('descripcion')

        obtenerCat = text("SELECT * FROM categorias WHERE categoria=:categoria")
        if db.execute(obtenerCat, {'categoria': categoria}).rowcount > 0:
            flash(('Ya existe una categoria con ese nombre', 'error', '¡Error!'))
            return redirect(url_for('categorias'))
        else:
            agregarCategoria = text("INSERT INTO categorias (categoria, descripcion) VALUES (:categoria, :descripcion)")
            db.execute(agregarCategoria, {"categoria": categoria, "descripcion": descripcionCategoria})
            
            db.commit()
            db.close()
        flash(('La categoria ha sido agregada con éxito.', 'success', '¡Éxito!'))
        return redirect(url_for('categorias'))
        
@app.route('/editarCategoria', methods=["POST"])
@login_required
def editarCategoria():
    print("Entro a editar categoria")
    categoria = request.form.get('nombre_editar')
    descripcion = request.form.get('descripcion_editar')
    idCategoria = request.form.get('id_editar')

    if not idCategoria:
        flash(('No está recibiendo valores de categoría', 'error', '¡Error!'))
        return redirect(url_for('categorias'))
    if not categoria:
        flash(('Ingrese la categoría', 'error', '¡Error!'))
        return redirect(url_for('categorias'))
    if not descripcion:
        flash(('Ingrese una descripción', 'error', '¡Error!'))
        return redirect(url_for('categorias'))
    
    # VALIDANDO SI HAY UNA CATEGORIA CON ESE NOMBRE
    obtenerCat = text("SELECT * FROM categorias WHERE categoria=:categoria AND id!=:id")
    if db.execute(obtenerCat, {'categoria': categoria, 'id': idCategoria}).rowcount > 0:
        flash(('Ya existe una subcategoria con ese nombre', 'error', '¡Error!'))
        return redirect(url_for('categorias'))

    else:
        obtenerCat = text("SELECT categoria FROM categorias WHERE id=:id")

        if db.execute(obtenerCat, {'id': idCategoria}).rowcount > 0:
            editarCategoria = text("UPDATE categorias SET categoria=:categoria, descripcion=:descripcion WHERE id =:id")
            db.execute(editarCategoria, {"id":idCategoria, "categoria":categoria, "descripcion":descripcion})
            db.commit()
            db.close()
        else:
            flash("Ha ocurrido un error", 'error', '¡Error!')
            return redirect(url_for('categorias'))

    flash(('La categoría ha sido editada con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('categorias'))

@app.route('/eliminarCategoria', methods=["POST"])
@login_required
def eliminarCategoria():
    idCategoria = request.form.get('id_eliminar')
    print(idCategoria)

    query = text("SELECT COUNT(*) FROM subcategorias WHERE categoria_id = :categoria_id")
    resultado = db.execute(query, {'categoria_id': idCategoria}).scalar()

    if resultado > 0:
        flash(('No se puede eliminar la categoría porque tiene subcategorías asociadas.', 'error'))
        return redirect(url_for('categorias'))

    query = text("UPDATE categorias SET estado=:estado WHERE id = :id")
    db.execute(query, {"estado": 'false', "id": idCategoria})
    db.commit()
    db.close()
    flash(('La categoria ha sido eliminada con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('categorias'))


@app.route('/usuarios', methods =["GET","POST"])
@login_required
@ruta_permitida
def usuarios():
    if request.method == "GET":
        print("Usuarios GET")
        obtenerUsuarios = text("SELECT * FROM usuarios as u INNER JOIN roles as r ON r.id = u.rol_id WHERE u.rol_id = 1 OR u.rol_id = 2 ORDER by u.id asc")
        usuario = db.execute(obtenerUsuarios).fetchall()

        obtenerRol = text("SELECT * FROM roles WHERE id = 1 OR id = 2")
        roles = db.execute(obtenerRol).fetchall()

        return render_template('usuarios.html', usuario=usuario, Roles = roles)
    else:
        nombre_completo = request.form.get('nombre')
        correo = request.form.get('correo')
        contraseña = request.form.get('contraseña')
        rol_id = request.form.get("idrol")

        hashed_contraseña = generate_password_hash(contraseña)

            # Validaciones
        if not nombre_completo:
            flash(('El nombre completo es obligatorio', 'error', '¡Error!'))
            return redirect(url_for('usuarios'))
        if not correo:
            flash(('El correo electrónico es obligatorio', 'error', '¡Error!'))
            return redirect(url_for('usuarios'))
        if not contraseña:
            flash(('La contraseña es obligatoria', 'error', '¡Error!'))
            return redirect(url_for('usuarios'))
        if not rol_id:
            flash(('Debe seleccionar un rol', 'error', '¡Error!'))
            return redirect(url_for('usuarios'))
        
        obtenerUser = text("SELECT * FROM usuarios WHERE correo =:correo")

        if db.execute(obtenerUser, {'correo': correo}).rowcount > 0:
            flash(('Ya existe un usuario con este correo', 'error', '¡Error!'))
            return redirect(url_for('usuarios'))
        else:
            estado = "true"
            insertar_usuario = text("INSERT INTO usuarios (nombre_completo, correo, clave, rol_id, estado) VALUES (:userName, :userEmail, :userPassword, :idRol, :estado)")
            db.execute(insertar_usuario,{"userName":nombre_completo, "userEmail":correo, "userPassword": hashed_contraseña, "idRol":rol_id, "estado":estado})
            db.commit()
            db.close()
            flash(('Usuario agregado con éxito.', 'success', '¡Éxito!'))
            return redirect("/usuarios")     

@app.route('/eliminarUsuarios', methods=["GET", "POST"])
@login_required
def eliminarUsuarios():
    print("Eliminar usuarios")
    idUsuario = request.form.get('id_usuario')
    print(idUsuario)

    query = text("DELETE FROM usuarios WHERE id = :id")
    db.execute(query, {"id": idUsuario})
    db.commit()
    db.close()
    flash(('El usuario ha sido eliminado con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('usuarios'))

@app.route('/editarUsuario', methods=["POST"])
@login_required
def editarUsuario():
    if request.method == "POST":
        print("Entro a editar usuario")

        idUsuario_editar = request.form.get("id_editar_usuario")
        nombre_completo_editar = request.form.get('nombreUsuario_editar')
        correo_editar = request.form.get("correo_editar")
        rol_id_editar = request.form.get("rol_editar")

        print(idUsuario_editar,nombre_completo_editar, correo_editar, rol_id_editar)
        if not idUsuario_editar:
            flash(('No está recibiendo valores del usuario', 'error', '¡Error!'))
            return redirect(url_for('usuarios'))
        if not nombre_completo_editar:
            flash(('Ingrese el nombre completo', 'error', '¡Error!'))
            return redirect(url_for('usuarios'))
        if not correo_editar:
            flash(('Ingrese el correo electrónico', 'error', '¡Error!'))
            return redirect(url_for('usuarios'))
        if not rol_id_editar:
            flash(('Seleccione un rol para el usuario', 'error', '¡Error!'))
            return redirect(url_for('usuarios'))
        
        # VALIDANDO SI HAY UNA SUBCATEGORIA CON ESE NOMBRE
        obtenerUser = text("SELECT * FROM usuarios WHERE correo =:correo AND id != :id")
        if db.execute(obtenerUser,{"correo": correo_editar, "id": idUsuario_editar}).rowcount > 0:
            flash(('Ya existe un usuario con este correo', 'error', '¡Error!'))
            return redirect(url_for('usuarios'))
        else:
            # VALIDANDO SI EXISTE UNA SUBCATEGORIA CON ESE ID
            obtenerUs = text("SELECT correo FROM usuarios WHERE id=:id")

            if db.execute(obtenerUs, {'id': idUsuario_editar}).rowcount > 0:
                editarUsuario = text("UPDATE usuarios SET nombre_completo=:nombre_completo, correo=:correo, rol_id=:rol_id WHERE id =:id")
                db.execute(editarUsuario, {"id":idUsuario_editar, "nombre_completo":nombre_completo_editar, "correo":correo_editar, "rol_id": rol_id_editar})
                db.commit()
                db.close()
            else:
                flash("Ha ocurrido un error", 'error', '¡Error!')
                return redirect(url_for('usuarios'))

        
        flash(('Los datos han sido editados con éxito.', 'success', '¡Éxito!'))
        return redirect(url_for('usuarios'))

    
@app.route("/inicioAdmin", methods=["GET", "POST"])
@login_required
@ruta_permitida
def inicio():
    return render_template("inicio_admin.html")

@app.route("/subCategorias", methods=["GET", "POST"])
@login_required
@ruta_permitida
def subCategorias():
    if request.method == "GET":
        obtenerCategorias = text("SELECT * FROM categorias order by id asc")
        rows = db.execute(obtenerCategorias).fetchall()

        obtenerSubcategorias = text("SELECT subcategorias.id AS id, categorias.id AS id_categoria, categorias.categoria AS categoria, subcategorias.subcategoria AS subcategoria, subcategorias.descripcion AS descripcion FROM subcategorias JOIN categorias ON subcategorias.categoria_id = categorias.id")
        rows2 = db.execute(obtenerSubcategorias).fetchall()
        return render_template("subcategorias.html", categorias=rows, subcategorias=rows2)
    else:
        nombreSub = request.form.get('nombreSub')
        descripcion = request.form.get('descripcion')
        idCat = request.form.get('idCat')

        obtenerSub = text("SELECT * FROM subcategorias WHERE subcategoria=:subcategoria")
        if db.execute(obtenerSub, {'subcategoria': nombreSub}).rowcount > 0:
            flash(('Ya existe una subcategoria con ese nombre', 'error', '¡Error!'))
            return redirect(url_for('subCategorias'))
        else:
            insertarSub = text("INSERT INTO subcategorias (categoria_id, subcategoria, descripcion) VALUES (:categoria_id, :subcategoria, :descripcion)")
            db.execute(insertarSub, {"categoria_id": idCat, "subcategoria": nombreSub, "descripcion": descripcion})

            db.commit()
        flash(('La subcategoría ha sido agregada con éxito.', 'success', '¡Éxito!'))
        return redirect(url_for('subCategorias'))
    
@app.route('/eliminarSubcategoria', methods=["GET", "POST"])
@login_required
def eliminarSubcategoria():
    idSubcategoria = request.form.get('id_eliminar')

    query = text("UPDATE subcategorias SET estado=:estado WHERE id = :id")
    db.execute(query, {"estado": 'false', "id": idSubcategoria})
    db.commit()
    db.close()
    flash(('La subcategoría ha sido eliminada con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('subCategorias'))

@app.route('/editarSubcategoria', methods=["POST"])
@login_required
def editarSubcategoria():
    subcategoria = request.form.get('nombreSub_editar')
    idcategoria = request.form.get('idCat_editar')
    descripcion = request.form.get('descripcion_editar')
    idSubcategoria = request.form.get('id_editar')

    if not idSubcategoria:
        flash(('No está recibiendo valores de subcategoría', 'error', '¡Error!'))
        return redirect(url_for('subCategorias'))
    if not subcategoria:
        flash(('Ingrese la subcategoría', 'error', '¡Error!'))
        return redirect(url_for('subCategorias'))
    if not idcategoria:
        flash(('Ingrese la categoría', 'error', '¡Error!'))
        return redirect(url_for('subCategorias'))
    if not descripcion:
        flash(('Ingrese una descripción', 'error', '¡Error!'))
        return redirect(url_for('subCategorias'))
    
    # VALIDANDO SI HAY UNA SUBCATEGORIA CON ESE NOMBRE
    obtenerSub = text("SELECT * FROM subcategorias WHERE subcategoria=:subcategoria AND id!=:idSubcategoria")
    if db.execute(obtenerSub, {'subcategoria': subcategoria, 'idSubcategoria': idSubcategoria}).rowcount > 0:
        flash(('Ya existe una subcategoria con ese nombre', 'error', '¡Error!'))
        return redirect(url_for('subCategorias'))
    
    else:
        # VALIDANDO SI EXISTE UNA SUBCATEGORIA CON ESE ID
        obtenerSubcat = text("SELECT subcategoria FROM subcategorias WHERE id=:id")

        if db.execute(obtenerSubcat, {'id': idSubcategoria}).rowcount > 0:
            editarSubcategoria = text("UPDATE subcategorias SET categoria_id=:categoria_id, subcategoria=:subcategoria, descripcion=:descripcion WHERE id =:id")
            db.execute(editarSubcategoria, {"id":idSubcategoria, "categoria_id":idcategoria, "subcategoria":subcategoria, "descripcion": descripcion})
            db.commit()
            db.close()
        else:
            flash("Ha ocurrido un error", 'error', '¡Error!')
            return redirect(url_for('subCategorias'))

    flash(('La subcategoría ha sido editada con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('subCategorias'))

@app.route('/insumos', methods=["GET", "POST"])
@login_required
@ruta_permitida
def insumos():
    if request.method == "GET":
        obtenerComposicion = text("SELECT * FROM composiciones_principales order by id asc")
        composicionP = db.execute(obtenerComposicion).fetchall()

        obtenerTipoInsumo = text("SELECT * FROM aplicaciones order by id asc")
        tiposInsumo = db.execute(obtenerTipoInsumo).fetchall()

        unidadesMedida = text("SELECT * FROM unidades_medidas order by id asc")
        unidadMedida = db.execute(unidadesMedida).fetchall()

        obtenerSubcat = text("SELECT * FROM subcategorias INNER JOIN categorias ON subcategorias.categoria_id = categorias.id WHERE categorias.categoria = 'Insumos'")
        subcat = db.execute(obtenerSubcat).fetchall()

        #muestra la información de los insumos
        MostrarInsumos = text("""SELECT i.id,
                               i.nombre, 
                              ap.aplicacion,
                               ap.id,
                               i.descripcion,
                               cp.composicion,
                               cp.id,
                               i.frecuencia_aplicacion,
                               i.compatibilidad,
                               i.precauciones,
                               STRING_AGG(DISTINCT sub.subcategoria, ', ') AS subcategoria,
                               STRING_AGG(DISTINCT sub.id::text, ', ') AS sub_id,
                               unidad.unidad_medida,
                               unidad.id,
                               i.fecha_vencimiento,
                               i.precio_venta,
                               i.imagen_url 
                              FROM insumos i
                              INNER JOIN insumos_subcategoria s ON i.id = s.insumo_id 
                              INNER JOIN subcategorias sub ON sub.id = s.subcategoria_id
                              INNER JOIN composiciones_principales cp ON i.composicion_principal_id = cp.id
                              INNER JOIN insumos_unidades iu ON i.id = iu.insumo_id
                              INNER JOIN unidades_medidas unidad ON unidad.id = iu.unidad_medida_id
                              INNER JOIN aplicaciones_insumos api ON api.insumo_id = i.id
                              INNER JOIN aplicaciones ap ON ap.id = api.aplicacion_id 
                              WHERE i.estado = 'true'
                               GROUP BY 
                              i.id, 
                              i.nombre, 
                              ap.aplicacion, 
                              ap.id, 
                              i.descripcion, 
                              cp.composicion, 
                              cp.id, 
                              i.frecuencia_aplicacion, 
                              i.compatibilidad, 
                              i.precauciones,
                              unidad.unidad_medida, 
                              unidad.id,
                              i.fecha_vencimiento, 
                              i.precio_venta, 
                              i.imagen_url
                              ORDER BY i.id ASC; 
                              """)

        Insumos = db.execute(MostrarInsumos).fetchall()

        obtenerCategorias = text("SELECT * FROM categorias order by id asc")
        rows = db.execute(obtenerCategorias).fetchall()

        obtenerSubcategorias = text("SELECT subcategorias.id AS id, categorias.id AS id_categoria, categorias.categoria AS categoria, subcategorias.subcategoria AS subcategoria, subcategorias.descripcion AS descripcion FROM subcategorias JOIN categorias ON subcategorias.categoria_id = categorias.id")
        rows2 = db.execute(obtenerSubcategorias).fetchall()
        


        return render_template('insumos.html', Composicionp=composicionP, TiposInsumo = tiposInsumo, Subcat = subcat, UnidadesMedida = unidadMedida, insumos=Insumos, categorias=rows, subcategorias=rows2)

    else:
        insumo = request.form.get('nombre_insumo')
        tipoInsumo = request.form.get('idtipoInsumo')
        descripcionInsumo = request.form.get('descripcion_insumo')
        subcatInsumo = request.form.getlist('idsubcat')
        composicionInsumo = request.form.get('idComposicionP')
        frecuenciaInsumo = request.form.get('frecuenciaAplicacion_insumo')
        compatibilidadInsumo = request.form.get('compatibilidad')
        precaucionesInsumo = request.form.get('precauciones')
        imgInsumo = request.form.get('imgInsumo')
        fechaVencimientoInsumo = request.form.get('fecha_vencimiento')
        if fechaVencimientoInsumo:  # Verifica si no está vacío o es None
            try:
                fecha_vencimiento = datetime.strptime(fechaVencimientoInsumo, "%Y-%m-%d").date()
            except ValueError:
                flash(('La fecha de vencimiento no tiene un formato válido. Por favor, verifique.', 'error'))
                return redirect(url_for('insumos'))
        else:
            fecha_vencimiento = None 
        # fecha_vencimiento = datetime.strptime(fechaVencimientoInsumo, "%Y-%m-%d").date()

        fecha_actual = datetime.now().date()
        precioVentaInsumo = request.form.get("precio_venta")
        unidadMedidaInsumo = request.form.get('idUnidadMedida')

        if not insumo:
            flash(('Ingrese el nombre del insumo', 'error', '¡Error!'))
            return redirect(url_for('insumos'))
        
        if not tipoInsumo:
            flash(('Seleccione un tipo de insumo', 'error', '¡Error!'))
            return redirect(url_for('insumos'))
        
        if not subcatInsumo:
            flash(('Seleccione una subcategoria', 'error', '¡Error!'))
            return redirect(url_for('insumos'))
        
        if not composicionInsumo:
            flash(('Seleccione una composición principal', 'error', '¡Error!'))
            return redirect(url_for('insumos'))
        
        if not frecuenciaInsumo:
            flash(('Ingrese la frecuencia de aplicación', 'error', '¡Error!'))
            return redirect(url_for('insumos'))

        if not compatibilidadInsumo:
            flash(('Ingrese la compatibilidad', 'error', '¡Error!'))
            return redirect(url_for('insumos'))
        
        if not precaucionesInsumo:
            flash(('Ingrese las precauciones', 'error', '¡Error!'))
            return redirect(url_for('insumos'))
                
        if fecha_vencimiento is not None and fecha_vencimiento < fecha_actual:
            flash(("No puedes ingresar un producto con la fecha de vencimiento caducada", 'error', '¡Error!'))
            return redirect(url_for("insumos"))

        if not precioVentaInsumo:
            flash(("No se ha ingresado el precio de venta", 'error', '¡Error!'))
            return redirect(url_for('insumos'))
        
        precio = float(precioVentaInsumo)
        if precio < 0:
            flash(("El precio de venta no puede ser negativo", 'error', '¡Error!'))
            return redirect(url_for('insumos'))
        
        if precio == 0:
            flash(("El precio de venta no puede ser 0", 'error', '¡Error!'))
            return redirect(url_for('insumos'))
        
        if not unidadMedidaInsumo:
            flash(("No se ha seleccionado una unidad de medida", 'error', '¡Error!'))
            return redirect(url_for('insumos'))
        
        obtenerInsumo = text("SELECT * FROM insumos WHERE nombre=:insumo")
        if db.execute(obtenerInsumo, {'insumo': insumo}).rowcount > 0:
            flash(('Ya existe un insumo con ese nombre', 'error', '¡Error!'))
            return redirect(url_for('insumos'))
        else:

            insertarInsumo = text("INSERT INTO insumos (nombre, tipo_insumo, descripcion, composicion_principal_id, frecuencia_aplicacion, compatibilidad, precauciones, fecha_vencimiento, precio_venta, imagen_url, estado) VALUES (:insumo, :tipoInsumo, :descripcionInsumo, :composicionInsumo, :frecuenciaInsumo,:compatibilidadInsumo, :precaucionesInsumo, :fecha_vencimiento, :precio_venta, :imagen_url, :estado)")
            db.execute(insertarInsumo, {"insumo": insumo, "tipoInsumo": tipoInsumo, "descripcionInsumo": descripcionInsumo, "composicionInsumo": composicionInsumo, "frecuenciaInsumo": frecuenciaInsumo, "compatibilidadInsumo": compatibilidadInsumo, "precaucionesInsumo": precaucionesInsumo, "fecha_vencimiento": fecha_vencimiento, "precio_venta": precioVentaInsumo, "imagen_url": imgInsumo, "estado": 'true'})

            selectInsumoId = text("SELECT id FROM insumos WHERE nombre=:insumo")
            insumoId = db.execute(selectInsumoId, {'insumo': insumo}).fetchone()

            for subcat in subcatInsumo:
                insertSubcatInsumo = text("INSERT INTO insumos_subcategoria (subcategoria_id, insumo_id) VALUES (:subcatInsumo, :insumoId)")
                db.execute(insertSubcatInsumo, {"subcatInsumo": int(subcat), "insumoId": insumoId[0]})

            insertarInsumoIdUnidad = text("INSERT INTO insumos_unidades (insumo_id, unidad_medida_id) VALUES (:insumoId, :unidadMedidaId)")
            db.execute(insertarInsumoIdUnidad, {"insumoId": insumoId[0], "unidadMedidaId": unidadMedidaInsumo})
            
            
            insertarInsumoIdAplicacion = text("INSERT INTO aplicaciones_insumos (insumo_id, aplicacion_id) VALUES (:insumoId, :aplicacionId)")
            db.execute(insertarInsumoIdAplicacion, {"insumoId": insumoId[0], "aplicacionId": tipoInsumo})

            db.commit()
            db.close()
        flash(('El insumo ha sido agregado con éxito.', 'success', '¡Éxito!'))
        return redirect(url_for('insumos'))



@app.route('/eliminarInsumo', methods=["GET", "POST"])
@login_required
@ruta_permitida
def eliminarInsumos():
    idInsumo = request.form.get('id_insumo')

    queryEliminarInsumo = text("UPDATE insumos SET estado = 'false' WHERE id = :idInsumo")
    db.execute(queryEliminarInsumo, {"idInsumo": idInsumo})
    db.commit()
    db.close()
    flash(('El insumo se ha sido eliminado con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('insumos'))

@socketio.on("addImgInsumo")
def agregarImgInsumo(data):
    print(data)
    insumo = data['idIns']
    imagen = data['url']

    print(f"{insumo} id de la comunidad" )
    print(f"{imagen} imagen de la comunidad")
    query = text("UPDATE insumos SET imagen_url = :imagen WHERE id =:id")
    db.execute(query,{"imagen": imagen, "id": insumo})
    db.commit()
    db.close()
     # Emitir un evento al cliente para actualizar la imagen en la interfaz
    emit('addImgInsumo', {'idIns': insumo, 'url': imagen}, broadcast=True)

@app.route('/editarinsumo', methods=["POST"])
@login_required
def editarinsumo():
    if request.method == "POST":
       insumo_ID = request.form.get('id_editar_insumo')
       insumo_editar = request.form.get('insumo_editar')
       tipoInsumo_editar = request.form.get('idtipoInsumo_editar')
       descripcionInsumo_editar = request.form.get('descripcion_insumo_editar')
       subcatInsumo_editar = request.form.getlist('idsubcat_editar')
       composicionInsumo_editar = request.form.get('idComposicionP_editar')
       frecuenciaInsumo_editar = request.form.get('frecuenciaAplicacion_insumo_editar')
       compatibilidadInsumo_editar = request.form.get('compatibilidad_editar')
       precaucionesInsumo_editar = request.form.get('precauciones_editar')
       fechaVencimientoInsumo_editar = request.form.get('fechaVencimientoInsumo_editar')
       if fechaVencimientoInsumo_editar:  # Verifica si no está vacío o es None
            try:
                fecha_vencimiento = datetime.strptime(fechaVencimientoInsumo_editar, "%Y-%m-%d").date()
            except ValueError:
                flash(('La fecha de vencimiento no tiene un formato válido. Por favor, verifique.', 'error'))
                return redirect(url_for('insumos'))
       else:
            fecha_vencimiento = None
    #    fecha_vencimiento = datetime.strptime(fechaVencimientoInsumo_editar, "%Y-%m-%d").date()
       fecha_actual = datetime.now().date()
       precio_ventaInsumo_editar = request.form.get('precioVentaInsumo_editar')
       unidadMedida_editar = request.form.get('unidadMedida_editar')

       if not insumo_editar:
           flash(('Ingrese el nombre del insumo', 'error', '¡Error!'))
           return redirect(url_for('insumos'))
       
       if not tipoInsumo_editar:
           flash(('Seleccione un tipo de insumo', 'error', '¡Error!'))
           return redirect(url_for('insumos'))
        
       if not descripcionInsumo_editar:
           flash(('Ingrese la descripción del insumo', 'error', '¡Error!'))
           return redirect(url_for('insumos'))
        
       if not subcatInsumo_editar:
           flash(('Seleccione una subcategoria', 'error', '¡Error!'))
           return redirect(url_for('insumos'))
       
       if not composicionInsumo_editar:
           flash(('Seleccione una composición principal', 'error', '¡Error!'))
           return redirect(url_for('insumos'))
       
       if not frecuenciaInsumo_editar:
           flash(('Ingrese la frecuencia de aplicación', 'error', '¡Error!'))
           return redirect(url_for('insumos'))
       
       if not compatibilidadInsumo_editar:
           flash(('Ingrese la compatibilidad', 'error', '¡Error!'))
           return redirect(url_for('insumos'))
       
       if not precaucionesInsumo_editar:
           flash(('Ingrese las precauciones', 'error', '¡Error!'))
           return redirect(url_for('insumos'))
        
       if fecha_vencimiento is not None and fecha_vencimiento < fecha_actual:
            flash(("No puedes ingresar un producto con la fecha de vencimiento caducada", 'error', '¡Error!'))
            return redirect(url_for("insumos"))

       if not precio_ventaInsumo_editar:
            flash(('Ingrese el precio de venta', 'error', '¡Error!'))
            return redirect(url_for('insumos'))
       
       if not unidadMedida_editar:
           flash(('Seleccione una unidad de medida', 'error', '¡Error!'))
           return redirect(url_for('insumos'))
       
       # VALIDANDO SI HAY UN insumo CON ESE NOMBRE
       obtenerInsumo = text("SELECT * FROM insumos WHERE nombre=:insumo AND id!=:id")
       if db.execute(obtenerInsumo,{'insumo': insumo_editar, "id":insumo_ID}).rowcount > 0:
           flash(('Ya existe un insumo con ese nombre', 'error', '¡Error!'))
           return redirect(url_for('insumos'))
       else:
           
           
           # VALIDANDO SI EXISTE UN INSUMO CON ESE ID
           obtenerInsumo = text("SELECT * FROM insumos WHERE id=:id")
           if db.execute(obtenerInsumo, {'id': insumo_ID}).rowcount > 0:
               editarInsumo = text("UPDATE insumos SET nombre=:nombre, tipo_insumo=:tipoInsumo, descripcion=:descripcion, composicion_principal_id=:composicionInsumo, frecuencia_aplicacion=:frecuenciaInsumo,compatibilidad=:compatibilidadInsumo, precauciones=:precauciones, fecha_vencimiento=:fechaVencimiento, precio_venta=:precioVenta WHERE id =:id")
               db.execute(editarInsumo, {"id":insumo_ID, "nombre":insumo_editar, "tipoInsumo":tipoInsumo_editar, "descripcion":descripcionInsumo_editar, "composicionInsumo":composicionInsumo_editar, "frecuenciaInsumo":frecuenciaInsumo_editar,"compatibilidadInsumo": compatibilidadInsumo_editar, "precauciones": precaucionesInsumo_editar, "fechaVencimiento": fecha_vencimiento, "precioVenta": precio_ventaInsumo_editar})

               editarUnidadMedida = text("UPDATE insumos_unidades SET unidad_medida_id=:unidad_medida_id, insumo_id=:insumo_id WHERE insumo_id=:insumo_id")
               db.execute(editarUnidadMedida, {"unidad_medida_id": unidadMedida_editar, "insumo_id": insumo_ID})

               editaraplicacion = text("UPDATE aplicaciones_insumos SET aplicacion_id=:aplicacion_id, insumo_id=:insumo_id WHERE insumo_id=:insumo_id")
               db.execute(editaraplicacion, {"aplicacion_id": tipoInsumo_editar, "insumo_id": insumo_ID})   

               db.commit()
              

                # Insertar nuevas subcategorías seleccionadas que no existan para este insumo
               subcategorias_seleccionadass = subcatInsumo_editar
               print("Sson las subcategorias seleccionadas", subcategorias_seleccionadass)

                # Obtener las subcategorías actualmente asociadas con el insumo en la base de datos
               obtenerSubcategoriasExistentes = text("""
                    SELECT subcategoria_id FROM insumos_subcategoria WHERE insumo_id = :insumo_id
                """)
               subcategorias_existentess = [row[0] for row in db.execute(obtenerSubcategoriasExistentes, {'insumo_id': insumo_ID}).fetchall()]
               print("son las Ssubcategorias existentes", subcategorias_existentess)

               subcategorias_seleccionadas = sorted([int(subcat) for subcat in subcategorias_seleccionadass])
               subcategorias_existentes = sorted([int(subcat) for subcat in subcategorias_existentess])

               for subcategoria_id in subcategorias_seleccionadas:
                    # Verificar si la subcategoría ya está asociada con el insumo
                    obtenerInsumoSub = text("""
                        SELECT * FROM insumos_subcategoria 
                        WHERE insumo_id = :insumo_id AND subcategoria_id = :subcategoria_id
                    """)
                    if db.execute(obtenerInsumoSub, {'insumo_id': insumo_ID, 'subcategoria_id': subcategoria_id}).rowcount == 0:
                        # Insertar la relación si no existe
                        insertarInsumoSub = text("""
                            INSERT INTO insumos_subcategoria (subcategoria_id, insumo_id) 
                            VALUES (:subcategoria_id, :insumo_id)
                        """)
                        db.execute(insertarInsumoSub, {"subcategoria_id": subcategoria_id, "insumo_id": insumo_ID})
                
               if sorted(subcategorias_seleccionadas) == sorted(subcategorias_existentes):
                   print("No hay cambios en las subcategorías")

               else:
                    print((subcategorias_existentes))
                    print((subcategorias_seleccionadas))
                    print("Hay cambios en las subcategorías")
                    # Encontrar los números que están en subcategorias_existentes pero no en subcategorias_seleccionadas
                    diferencias = [subcat for subcat in subcategorias_existentes if subcat not in subcategorias_seleccionadas]

                    print("Subcategorías a eliminar:", diferencias)

                    for subcategoria_id in diferencias:
                        eliminarInsumoSub = text("""
                            DELETE FROM insumos_subcategoria 
                            WHERE insumo_id = :insumo_id AND subcategoria_id = :subcategoria_id
                        """)
                        db.execute(eliminarInsumoSub, {"insumo_id": insumo_ID, "subcategoria_id": subcategoria_id})
                        print(f"Eliminando subcategoría con ID: {subcategoria_id}") 
            
               db.commit()
               db.close()
           else:
               flash("Ha ocurrido un error", 'error', '¡Error!')
               return redirect(url_for('insumos'))

       
       flash(('Los datos han sido editados con éxito.', 'success', '¡Éxito!'))
       return redirect(url_for('insumos'))

@app.route('/agregarSubcategoriaInsumos', methods=["POST"])
@login_required
@ruta_permitida
def agregarSubcategoriaInsumos():
    nombreSub = request.form.get('nombreSub')
    descripcion = request.form.get('descripcion')
    idCat = request.form.get('idCat')
    obtenerSub = text("SELECT * FROM subcategorias WHERE subcategoria=:subcategoria")
    
    if db.execute(obtenerSub, {'subcategoria': nombreSub}).rowcount > 0:
           flash(('Ya existe una subcategoria con ese nombre', 'error', '¡Error!'))
           return redirect(url_for('subCategorias'))
    else:
           insertarSub = text("INSERT INTO subcategorias (categoria_id, subcategoria, descripcion) VALUES (:categoria_id, :subcategoria, :descripcion)")
    db.execute(insertarSub, {"categoria_id": idCat, "subcategoria": nombreSub, "descripcion": descripcion})
    db.commit()
    db.close()
    return jsonify({"success": True, "message": "La subcategoría ha sido agregada con éxito."})
    # return flash(('La subcategoría ha sido agregada con éxito.', 'success', '¡Éxito!'))
       

@app.route('/plantas', methods=["GET", "POST"])
@login_required
@ruta_permitida
def plantas():
    if request.method == "GET":
        id_planta = request.args.get("id_editar_planta")

        obtenerSubcategorias = text("SELECT * FROM subcategorias INNER JOIN categorias ON subcategorias.categoria_id = categorias.id WHERE categorias.categoria LIKE '%Plantas%'")
        subcategorias = db.execute(obtenerSubcategorias).fetchall()

        obtenerEntornos = text("SELECT * FROM entornos_ideales")
        entornos = db.execute(obtenerEntornos).fetchall()

        obtenerAgua = text("SELECT * FROM requerimientos_agua")
        agua = db.execute(obtenerAgua).fetchall()

        obtenerTipoSuelo = text("SELECT * FROM tipos_suelos")
        suelos = db.execute(obtenerTipoSuelo).fetchall()

        obtenerTemporada = text("SELECT * FROM temporadas_plantacion")
        temporada = db.execute(obtenerTemporada).fetchall()

        obtenerInfo = text("""SELECT 
    plantas.id AS id, 
    plantas.nombre AS nombre,
    plantas.imagen_url AS imagen_url,
    plantas.descripcion AS descripcion,
    
    STRING_AGG(DISTINCT subcategorias.subcategoria, ', ') AS subcategoria,
    STRING_AGG(DISTINCT subcategorias.id::text, ', ') AS id_subcategoria,
                           
    entornos_ideales.entorno AS entorno,
    entornos_ideales.id AS id_entorno,
    
    requerimientos_agua.requerimiento_agua AS agua,
    requerimientos_agua.id AS id_agua,
    
    tipos_suelos.tipo_suelo AS suelo,
    tipos_suelos.id AS id_suelo,
    
    temporadas_plantacion.temporada AS temporada,
    temporadas_plantacion.id AS id_temporada,
    
    plantas.precio_venta AS precio_venta
    
FROM 
    plantas
JOIN 
    plantas_subcategoria ON plantas.id = plantas_subcategoria.planta_id
JOIN 
    subcategorias ON plantas_subcategoria.subcategoria_id = subcategorias.id
JOIN 
    entornos_ideales ON plantas.entorno_ideal_id = entornos_ideales.id
JOIN 
    requerimientos_agua ON plantas.requerimiento_agua_id = requerimientos_agua.id
JOIN 
    tipos_suelos ON plantas.tipo_suelo_id = tipos_suelos.id
JOIN 
    temporadas_plantacion ON plantas.temporada_plantacion_id = temporadas_plantacion.id

GROUP BY 
    plantas.id, 
    plantas.nombre, 
    plantas.descripcion, 
    plantas.imagen_url, 
    entornos_ideales.id, 
    entornos_ideales.entorno, 
    requerimientos_agua.id, 
    requerimientos_agua.requerimiento_agua, 
    tipos_suelos.id, 
    tipos_suelos.tipo_suelo, 
    temporadas_plantacion.id, 
    temporadas_plantacion.temporada, 
    plantas.precio_venta;""")
        
        infoPlantas = db.execute(obtenerInfo).fetchall()

        return render_template('plantas.html', InfoPlanta = infoPlantas, Subcategorias = subcategorias, Entornos = entornos, Agua = agua, Suelos = suelos, Temporada = temporada)
    else:
        nombrePlanta = request.form.get('nombrePlanta')
        descripcion = request.form.get('descripcion')
        precio = request.form.get('precio')
        subcategoria = request.form.getlist('idSub')
        entorno = request.form.get('idEntorno')
        agua = request.form.get('idAgua')
        suelo = request.form.get('idSuelo')
        temporada = request.form.get('idTemporada')

        if not nombrePlanta:
            flash(('Ingrese el nombre', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
        if not descripcion:
            flash(('Ingrese la descripcion', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
        if not precio:
            flash(('Ingrese el precio', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
        
        precioverificar = float(precio)

        if precioverificar < 0:
            flash(('El precio no puede ser negativo', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
        if precioverificar == 0:
            flash(('El precio no puede estar en cero. verifique su entrada', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
        
        if not subcategoria:
            flash(('Seleccione la subcategoria', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
        if not entorno:
            flash(('Seleccione el entorno ideal', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
        if not agua:
            flash(('Seleccione el requeeimiento de agua', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
        if not suelo:
            flash(('Seleccione el tipo de suelo ', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
        if not temporada:
            flash(('Seleccione la temporada', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
        
        obtenerPlantas = text("SELECT * FROM plantas WHERE nombre=:nombre")
        if db.execute(obtenerPlantas, {'nombre': nombrePlanta}).rowcount > 0:
            flash(('La planta ya existe', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
        else:
            insertarPlanta = text("INSERT INTO plantas (nombre, descripcion, entorno_ideal_id, requerimiento_agua_id, tipo_suelo_id, temporada_plantacion_id, precio_venta) VALUES (:nombre, :descripcion, :entorno_ideal_id, :requerimiento_agua_id, :tipo_suelo_id, :temporada_plantacion_id, :precio_venta)")
            db.execute(insertarPlanta, {'nombre': nombrePlanta, 'descripcion': descripcion, 'entorno_ideal_id':entorno, 'requerimiento_agua_id': agua, 'tipo_suelo_id': suelo, 'temporada_plantacion_id': temporada, 'precio_venta': precio})

            plantaId = db.execute(text("SELECT * FROM plantas ORDER BY id DESC LIMIT 1")).fetchone()[0]

            for sub_id in subcategoria:
                insertarPlantasSub = text("INSERT INTO plantas_subcategoria (subcategoria_id, planta_id) VALUES (:subcategoria_id, :planta_id)")
                db.execute(insertarPlantasSub, {'subcategoria_id': int(sub_id), 'planta_id': plantaId})
            db.commit()
            db.close()
        flash(('La planta se ha agregado correctamente', 'success', '¡Exito!'))
        return redirect(url_for('plantas'))

@app.route('/eliminarPlanta', methods=["POST"])
@login_required
@ruta_permitida
def eliminarPlanta():
    idPlanta = request.form.get('id_eliminar')

    queryEliminarPlanta = text("UPDATE plantas SET estado = 'false' WHERE id = :idPlanta")
    db.execute(queryEliminarPlanta, {"idPlanta": idPlanta})
    db.commit()
    db.close()
    flash(('La planta se ha sido eliminado con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('plantas'))   

@app.route('/proveedores', methods=["GET", "POST"])
@login_required
@ruta_permitida
def proveedores():
    if request.method == "POST":
        nombreProveedor = request.form.get('nombre')
        correoProveedor = request.form.get('correoProveedor')
        telefonoProveedor = request.form.get('numeroTelefono')
        direccionProveedor = request.form.get('direccion')

        if not nombreProveedor:
            flash(('Ingrese el nombre', 'error', '¡Error!'))
            return redirect(url_for('proveedores'))
        if not correoProveedor:
            flash(('Ingrese el correo electronico', 'error', '¡Error!'))
            return redirect(url_for('proveedores'))
        if not telefonoProveedor:
            flash(('Ingrese el telefono', 'error', '¡Error!'))
            return redirect(url_for('proveedores'))
        if not direccionProveedor:
            flash(('Ingrese la direccion', 'error', '¡Error!'))
            return redirect(url_for('proveedores'))
        
        obtenerProveedores = text("SELECT * FROM proveedores WHERE correo_electronico=:correo_electronico")
        if db.execute(obtenerProveedores, {'correo_electronico': correoProveedor}).rowcount > 0:
            flash(('El proveedor ya existe', 'error', '¡Error!'))
            return redirect(url_for('proveedores'))
        else:
            insertarProveedor = text("INSERT INTO proveedores (nombre_proveedor, correo_electronico, telefono, direccion, estado) VALUES (:nombre_proveedor, :correo_proveedor, :telefono, :direccion, :estado)")
            db.execute(insertarProveedor, {"nombre_proveedor": nombreProveedor, "correo_proveedor": correoProveedor, "telefono": telefonoProveedor, "direccion": direccionProveedor, "estado": 'true'})
        
            db.commit()
            db.close()
        flash(('El proveedor se ha agregado correctamente', 'success', '¡Exito!'))
        return redirect(url_for('proveedores'))
    else:
        obtenerProveedores = text("SELECT * FROM proveedores WHERE estado = 'true' ORDER BY id ASC")
        proveedores = db.execute(obtenerProveedores).fetchall()
        return render_template('proveedores.html', Proveedores = proveedores)

@app.route('/bajaProveedor', methods=["GET", "POST"])
@login_required
@ruta_permitida
def bajaProveedor():
    idProveedor = request.form.get('id_baja')
    eliminarProveedor = text("UPDATE proveedores SET estado = 'false' WHERE id = :id")
    db.execute(eliminarProveedor, {"id": idProveedor})
    db.commit()
    db.close()
    flash(('El proveedor se ha eliminado con éxito.', 'success', '¡Éxito'))
    return redirect(url_for('proveedores'))

@app.route('/editarProveedores', methods=["GET", "POST"])
@login_required
def editarProveedores():
    idProveedor = request.form.get('id_editar')
    nombre_editar = request.form.get('nombre_editar')
    correo_editar = request.form.get('correo_editar')
    telefono_editar = request.form.get('telefono_editar')
    direccion_editar = request.form.get('direccion_editar')

    if not idProveedor:
        flash(('No está recibiendo el id', 'error', '¡Error!'))
        return redirect(url_for('proveedores'))
    if not nombre_editar:
        flash(('Ingrese el nombre', 'error', '¡Error!'))
        return redirect(url_for('proveedores'))
    if not correo_editar:
        flash(('Ingrese un correo electronico', 'error', '¡Error!'))
        return redirect(url_for('proveedores'))
    if not telefono_editar:
        flash(('Ingrese un numero', 'error', '¡Error!'))
        return redirect(url_for('proveedores'))
    if not direccion_editar:
        flash(('Ingrese la direccion', 'error', '¡Error!'))
        return redirect(url_for('proveedores'))
    
    # VALIDANDO SI HAY UNA CATEGORIA CON ESE NOMBRE
    validandoProveedor = text("SELECT * FROM proveedores WHERE correo_electronico=:correo_electronico AND id!=:id")
    if db.execute(validandoProveedor, {'correo_electronico': correo_editar, 'id': idProveedor}).rowcount > 0:
        flash(('Ya existe un proveedor con ese correo', 'error', '¡Error!'))
        return redirect(url_for('proveedores'))

    else:
        obtenerProveedor = text("SELECT nombre_proveedor FROM proveedores WHERE id=:id")

        if db.execute(obtenerProveedor, {'id': idProveedor}).rowcount > 0:
            editarProveedor = text("UPDATE proveedores SET nombre_proveedor=:nombre_proveedor, correo_electronico=:correo_electronico, telefono=:telefono, direccion=:direccion WHERE id =:id")
            db.execute(editarProveedor, {"id":idProveedor, "nombre_proveedor":nombre_editar, "correo_electronico":correo_editar, "telefono":telefono_editar, "direccion": direccion_editar})
            db.commit()
            db.close()
        else:
            flash("Ha ocurrido un error", 'error', '¡Error!')
            return redirect(url_for('proveedores'))

    flash(('El proveedor ha sido editado con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('proveedores'))

@socketio.on("addImgPlanta")
def agregarImgPlanta(data):
    print(data)
    planta = data['idPlan']
    imagen = data['url']
    print(f"{planta} id de la planta" )
    print(f"{imagen} imagen de la comunidad")
    query = text("UPDATE plantas SET imagen_url = :imagen WHERE id =:id")
    db.execute(query,{"imagen": imagen, "id": planta})
    db.commit()
    db.close()


@socketio.on("addLogoEmpresa")
def agregarLogoEmpresa(data):
    print(data)
    imagen = data['url']
    print(f"{imagen} imagen de la empresa")
    query = text("UPDATE configuracion_sistema SET logo_empresa_url = :imagen")
    db.execute(query,{"imagen": imagen})
    db.commit()
    db.close()

@app.route('/editarPlantas', methods=["POST"])
@login_required
def editarplantas():
    if request.method == "POST":
       
       planta_ID = request.form.get('id_editar_planta')
       plantas_editar = request.form.get('nombrePlanta_editar')
       descripcioPlanta_editar = request.form.get('descripcion_editar')
       subcatplanta_editar = request.form.getlist('idSubcategoria_editar')
       identorno_editar = request.form.get('idEntorno_editar')
       idagua_editar = request.form.get('idAgua_editar')
       idSuelo_editar = request.form.get('idSuelo_editar')
       idTemporada_editar = request.form.get('idTemporada_editar')
       precio_editar = request.form.get('precio_editar')

       # Validaciones
       if not planta_ID:
           flash(('Falta el ID de la planta a editar', 'error', '¡Error!'))
           return redirect(url_for('plantas'))
       if not plantas_editar:
           flash(('Ingrese el nombre de la planta', 'error', '¡Error!'))
           return redirect(url_for('plantas'))
       if not descripcioPlanta_editar:
           flash(('Ingrese la descripción de la planta', 'error', '¡Error!'))
           return redirect(url_for('plantas'))
       if not precio_editar:
           flash(('Ingrese el precio de la planta', 'error', '¡Error!'))
           return redirect(url_for('plantas'))

       precio_editarv = float(precio_editar)
       if precio_editarv < 0:
            flash(('El precio no puede ser negativo', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
       
       if precio_editarv == 0:
            flash(('El precio no puede estar en cero. verifique su entrada', 'error', '¡Error!'))   
            return redirect(url_for('plantas'))
      
       if not subcatplanta_editar:
           flash(('Seleccione al menos una subcategoría', 'error', '¡Error!'))
           return redirect(url_for('plantas'))
      
       if not identorno_editar:
           flash(('Seleccione un entorno ideal', 'error', '¡Error!'))
           return redirect(url_for('plantas'))
       if not idagua_editar:
           flash(('Seleccione el requerimiento de agua', 'error', '¡Error!'))
           return redirect(url_for('plantas'))
       if not idSuelo_editar:
           flash(('Seleccione el tipo de suelo', 'error', '¡Error!'))
           return redirect(url_for('plantas'))
       if not idTemporada_editar:
           flash(('Seleccione la temporada adecuada', 'error', '¡Error!'))
           return redirect(url_for('plantas'))

       
       # VALIDANDO SI EXISTE UNA PLANTA CON ESE ID
       obtenerPlanta = text("SELECT * FROM plantas WHERE nombre=:nombre AND id!=:id")
       if db.execute(obtenerPlanta, {'id': planta_ID, 'nombre': plantas_editar}).rowcount > 0:
           flash("Ya existe una planta con ese nombre", 'error', '¡Error!')
           return redirect(url_for('plantas'))
       else:
           # VALIDANDO SI HAY UNA SUBCATEGORIA CON ESE NOMBRE
           # VALIDANDO SI EXISTE UN planta CON ESE ID
           obtenerPlanta = text("SELECT * FROM plantas WHERE id=:id")
           if db.execute(obtenerPlanta, {'id': planta_ID}).rowcount > 0:
               editarPlanta = text("UPDATE plantas SET nombre=:nombre, descripcion=:descripcion, entorno_ideal_id=:entorno, requerimiento_agua_id=:agua, tipo_suelo_id=:suelo, temporada_plantacion_id=:temporada, precio_venta=:precio WHERE id =:id")
               db.execute(editarPlanta, {"id":planta_ID, "nombre":plantas_editar, "descripcion":descripcioPlanta_editar, "entorno": identorno_editar, "agua": idagua_editar, "suelo": idSuelo_editar, "temporada": idTemporada_editar, "precio": precio_editar})
               db.commit()
               db.close()

               subcategorias_seleccionadass = subcatplanta_editar
               print(subcategorias_seleccionadass)

               obtenerSubcatPlanta = text("SELECT subcategoria_id FROM plantas_subcategoria WHERE planta_id=:planta_id")
               subcategoriasPlantas_existentess = [row[0] for row in db.execute(obtenerSubcatPlanta, {'planta_id': planta_ID}).fetchall()]
               print("estas son las subcategorias existentes", subcategoriasPlantas_existentess)

               subcategorias_seleccionadas = sorted([int(subcat) for subcat in subcategorias_seleccionadass])
               subcategorias_existentes = sorted([int(subcat) for subcat in subcategoriasPlantas_existentess])
            
               for subcat in subcategorias_seleccionadas:
                   obtenerPlanta = text("SELECT * FROM plantas_subcategoria WHERE subcategoria_id=:subcategoria_id AND planta_id=:planta_id")
                   if db.execute(obtenerPlanta, {"subcategoria_id": subcat, "planta_id": planta_ID}).rowcount == 0:
                       insertarSubcategoria = text("INSERT INTO plantas_subcategoria (subcategoria_id, planta_id) VALUES (:subcategoria_id, :planta_id)")
                       db.execute(insertarSubcategoria, {"subcategoria_id": subcat, "planta_id": planta_ID})
                       db.commit()
                       db.close()
               
               if sorted(subcategorias_seleccionadas) == sorted(subcategorias_existentes):
                   print("No hay cambios en las subcategorías")

               else:
                    print((subcategorias_existentes))
                    print((subcategorias_seleccionadas))
                    print("Hay cambios en las subcategorías")
                    # Encontrar los números que están en subcategorias_existentes pero no en subcategorias_seleccionadas
                    diferencias = [subcat for subcat in subcategorias_existentes if subcat not in subcategorias_seleccionadas]
                    print("Subcategorías a eliminar:", diferencias)
                    for subcategoria_id in diferencias:
                        eliminarPlantaSub = text("""
                            DELETE FROM plantas_subcategoria 
                            WHERE planta_id = :planta_id AND subcategoria_id = :subcategoria_id
                        """)
                        db.execute(eliminarPlantaSub, {"planta_id": planta_ID, "subcategoria_id": subcategoria_id})
                        print(f"Eliminando subcategoría con ID: {subcategoria_id}")
                       
               db.commit()
               db.close()
           else:
               flash("Ha ocurrido un error", 'error', '¡Error!')
               return redirect(url_for('plantas'))

       
       flash(('Los datos han sido editados con éxito.', 'success', '¡Éxito!'))
       return redirect(url_for('plantas'))
    
@app.route('/ventas', methods=["GET", "POST"])
@login_required
@ruta_permitida
def ventas():
    if request.method == 'GET':
        ObtenerSubcat = text("SELECT * FROM subcategorias")
        ObtenerVentas = text("SELECT id, nombre_cliente AS nombre, fecha_venta AS fecha, total, nota, estado FROM ventas")
        obtenerTiposPago = text("SELECT * FROM tipos_pagos")
        obtenerTipoCliente = text("SELECT * FROM cliente_categoria")
        obtenerColores = text("SELECT * FROM colores")
        obtenerMedidas = text("SELECT * FROM medidas")
        ObtenerUnidades = text('SELECT * FROM unidades_medidas')
        unidades = db.execute(ObtenerUnidades).fetchall()

        tipoCliente = db.execute(obtenerTipoCliente).fetchall()
        colores = db.execute(obtenerColores).fetchall()
        medidas = db.execute(obtenerMedidas).fetchall()
        tiposPago = db.execute(obtenerTiposPago).fetchall()
        infoSubcat = db.execute(ObtenerSubcat).fetchall()
        infoVentas = db.execute(ObtenerVentas).fetchall()
        return render_template('ventas.html', InfoSubcat = infoSubcat, InfoVentas = infoVentas, tipospago = tiposPago, colores = colores, medidas = medidas, tipocliente = tipoCliente, unidades=unidades)
    else:
        cliente = request.form.get('nombreCliente')
        cliente_categoria = request.form.get('tipoCliente-select')
        fecha_actual = datetime.now()
        fecha_formateada = fecha_actual.strftime('%Y-%m-%d')
        total = request.form.get('total')
        nota = request.form.get('nota-venta')
        tipoPago = request.form.get('tipoPago-select')

        print(request.form)  # Esto te mostrará todos los datos que llegan del formulario


        # Obtener id_movimiento
        ObtenerMovimiento = text('SELECT id FROM tipo_movimientos WHERE tipo_movimiento=:tipo_movimiento')
        movimientoId = db.execute(ObtenerMovimiento, {"tipo_movimiento": "Venta"}).fetchone()[0]

        productos = []
        index = 0
        while True:
            id = request.form.get(f'productos[{index}][id]')
            tipo = request.form.get(f'productos[{index}][tipo]')
            producto = request.form.get(f'productos[{index}][nombre]')
            cantidad = request.form.get(f'productos[{index}][cantidad]')
            precio = request.form.get(f'productos[{index}][precio]')

            if not producto:  # Termina cuando no encuentra más productos
                break
            productos.append({
                'id': int(id),
                'tipo': tipo,
                'producto': producto,
                'cantidad': int(cantidad),
                'precio': float(precio)
            })
            index += 1

        print(productos)

        if not cliente:
            flash(('Ingrese el nombre del cliente', 'error', '¡Error!'))
            return redirect(url_for('ventas'))
        if not productos:
            flash(('Ingrese al menos un producto', 'error', '¡Error!'))
            return redirect(url_for('ventas'))
        if not total:
            flash(('Ingrese el total', 'error', '¡Error!'))
            return redirect(url_for('ventas'))
        
        insertarVenta = text("""INSERT INTO ventas (nombre_cliente, usuario_id, id_cliente_categoria, id_tipo_pago, fecha_venta,    nota, total, estado) 
        VALUES (:nombre_cliente, :usuario_id, :id_cliente_categoria, :id_tipo_pago, :fecha_venta, :nota,:total, :estado)""")
        db.execute(insertarVenta, {"nombre_cliente": cliente, "usuario_id": session["user_id"], "id_cliente_categoria": 
            cliente_categoria, "id_tipo_pago": tipoPago ,"fecha_venta": fecha_formateada, "nota": nota, "total": 
            total, "estado": 'true'})


        for producto in productos:
            if producto['tipo'] == 'planta':
                planta_id = producto['id']
                insumo_id = None
            elif producto['tipo'] == 'insumo':
                planta_id = None
                insumo_id = producto['id']

            insertarKardex = text("""INSERT INTO movimientos_kardex (planta_id, insumo_id, cantidad, tipo_movimiento_id, precio_unitario, fecha_movimiento, nota) 
            VALUES (:planta_id, :insumo_id, :cantidad, :tipo_movimiento_id, :precio_unitario,:fecha_movimiento, :nota)""")
            db.execute(insertarKardex, {"planta_id": planta_id, "insumo_id": insumo_id, "cantidad": producto['cantidad'], "tipo_movimiento_id": movimientoId, "precio_unitario": producto['precio'], 
            "fecha_movimiento": fecha_formateada, "nota": nota})

        ventaId = db.execute(text("SELECT * FROM ventas ORDER BY id DESC LIMIT 1")).fetchone()[0]
        kardexId = db.execute(text("SELECT * FROM movimientos_kardex ORDER BY id DESC LIMIT 1")).fetchone()[0]

        for producto in productos:
            if producto['tipo'] == 'planta':
                planta_id = producto['id']
                insumo_id = None
            elif producto['tipo'] == 'insumo':
                planta_id = None
                insumo_id = producto['id']

            subtotal = (producto['cantidad'] * producto['precio'])
            insertarProductos = text("""INSERT INTO detalle_ventas (planta_id, insumo_id, venta_id, kardex_id, cantidad, precio_unitario, subtotal) VALUES 
            (:planta_id, :insumo_id, :venta_id, :kardex_id, :cantidad, :precio_unitario, :subtotal)""")
            db.execute(insertarProductos, {"planta_id": planta_id, "insumo_id": insumo_id, "venta_id": ventaId, 
                "kardex_id": kardexId, "cantidad": producto['cantidad'], "precio_unitario": producto['precio'], 
                "subtotal": subtotal})

        for producto in productos:
            stock_query = text("""
                    SELECT id, cantidad
                    FROM stock 
                    WHERE 
                        (planta_id = :planta_id OR :planta_id IS NULL)
                        AND 
                        (insumo_id = :insumo_id OR :insumo_id IS NULL)
            """)
            stockInfo = db.execute(
                stock_query, 
                {
                    "planta_id": producto['id'] if producto['tipo'] == 'planta' else None,
                    "insumo_id": producto['id'] if producto['tipo'] == 'insumo' else None
                }
            ).mappings().fetchone()
        
            stock_cantidad = int(stockInfo['cantidad'])
            nuevaCantidad = stock_cantidad - int(producto['cantidad'])

            if stockInfo['id']:
                actualizar_stock = text("""
                    UPDATE stock 
                        SET cantidad = :cantidad, 
                            kardex_id = :kardex_id,
                            estado = CASE WHEN :cantidad <= 0 THEN false ELSE true END
                        WHERE id = :id
                """)
                db.execute(
                    actualizar_stock, 
                    {
                        "cantidad": nuevaCantidad, 
                        "kardex_id": kardexId, 
                        "id": stockInfo['id']
                    }
                )

        db.commit()
        db.close()
        flash(('La Venta se ha realizado correctamente', 'success', '¡Exito!'))
        return redirect(url_for('ventas'))

@app.route('/anularVenta', methods=['POST'])
@login_required
def anularVenta():
    idVenta = request.form.get('id_anular')

    ActualizarVenta = text("UPDATE ventas SET estado=:estado WHERE id=:id")
    db.execute(ActualizarVenta, {"id": idVenta, "estado": 'false'})
    db.commit()
    flash(('La venta se ha anulado correctamente', 'success', '¡Exito!'))
    return redirect(url_for('ventas'))

@app.route('/get_products', methods=["POST"])
def get_products():
    subcategoria = request.json.get('subcategoria', '')
    # print(subcategoria)

    ObtenerProd = text("""
        SELECT
            stock.id AS id,
            stock.cantidad AS cantidad_disponible,
            plantas.id AS planta_id,
            plantas.nombre AS nombre_planta,
            plantas.precio_venta AS precio_planta,
            plantas.imagen_url AS imagen_planta,
            subcategorias.subcategoria AS subcategoria,
            insumos.id AS insumo_id,
            insumos.nombre AS nombre_insumo,
            insumos.imagen_url AS imagen_insumo,
            insumos.precio_venta AS precio_insumo
        FROM
            stock
        LEFT JOIN
            plantas ON stock.planta_id = plantas.id
        LEFT JOIN
            insumos ON stock.insumo_id = insumos.id
        LEFT JOIN
            plantas_subcategoria ON plantas.id = plantas_subcategoria.planta_id
        LEFT JOIN
            insumos_subcategoria ON insumos.id = insumos_subcategoria.insumo_id
        LEFT JOIN
            subcategorias ON 
                (plantas_subcategoria.subcategoria_id = subcategorias.id OR 
                insumos_subcategoria.subcategoria_id = subcategorias.id)
        LEFT JOIN
            categorias ON subcategorias.categoria_id = categorias.id
        WHERE
            subcategorias.id = :subcategoria
        ORDER BY 
            stock.id,
            plantas.id,
            plantas.nombre,
            plantas.precio_venta,
            subcategorias.subcategoria,
            insumos.id,
            insumos.nombre,
            insumos.precio_venta,
            stock.cantidad,
            plantas.imagen_url,
            insumos.imagen_url
            ;
    """)

    infoProd = db.execute(ObtenerProd, {'subcategoria': subcategoria}).fetchall()
    # print (infoProd)
    productos = [
    {
        'id': prod.id,
        'idProd': prod.planta_id if prod.planta_id is not None else prod.insumo_id, 
        'nombre': prod.nombre_planta if prod.nombre_planta else prod.nombre_insumo,
        'precio': prod.precio_planta if prod.precio_planta is not None else prod.precio_insumo,
        'cantidad': prod.cantidad_disponible,
        'tipo': 'planta' if prod.planta_id is not None else 'insumo',
        'imagen': prod.imagen_planta if prod.imagen_planta is not None else prod.imagen_insumo,
    }
    for prod in infoProd
]

    # print(productos)
    return jsonify(productos)


@app.route("/get_all_products", methods=["GET"])
def get_all_products():

    ObtenerAllProd = text("""
           SELECT
                stock.id AS id,
                stock.cantidad AS cantidad_disponible,
                plantas.id AS planta_id,
                plantas.nombre AS nombre_planta,
                plantas.precio_venta AS precio_planta,
                plantas.imagen_url AS imagen_planta,
                subcategorias.subcategoria AS subcategoria,
                insumos.id AS insumo_id,
                insumos.nombre AS nombre_insumo,
                insumos.imagen_url AS imagen_insumo,
                insumos.precio_venta AS precio_insumo
            FROM
                stock
            LEFT JOIN
                plantas ON stock.planta_id = plantas.id
            LEFT JOIN
                insumos ON stock.insumo_id = insumos.id
            LEFT JOIN
                plantas_subcategoria ON plantas.id = plantas_subcategoria.planta_id
            LEFT JOIN
                insumos_subcategoria ON insumos.id = insumos_subcategoria.insumo_id
            LEFT JOIN
                subcategorias ON
                    (plantas_subcategoria.subcategoria_id = subcategorias.id OR
                    insumos_subcategoria.subcategoria_id = subcategorias.id)
            LEFT JOIN
                categorias ON subcategorias.categoria_id = categorias.id
            WHERE
            stock.estado = 'true'
            ORDER BY
                stock.id,
                plantas.id,
                plantas.nombre,
                plantas.precio_venta,
                subcategorias.subcategoria,
                insumos.id,
                insumos.nombre,
                insumos.precio_venta,
                stock.cantidad,
                plantas.imagen_url,
                insumos.imagen_url
                ;
        """)
    
    infoProd = db.execute(ObtenerAllProd).fetchall()
    # print (infoProd)
    allProductos = [
    {
        'id': prod.id,
        'idProd': prod.planta_id if prod.planta_id is not None else prod.insumo_id, 
        'nombre': prod.nombre_planta if prod.nombre_planta else prod.nombre_insumo,
        'precio': prod.precio_planta if prod.precio_planta is not None else prod.precio_insumo,
        'cantidad': prod.cantidad_disponible,
        'tipo': 'planta' if prod.planta_id is not None else 'insumo',
        'imagen': prod.imagen_planta if prod.imagen_planta is not None else prod.imagen_insumo,
    }
    for prod in infoProd
]
    
    return jsonify(allProductos)
        

@app.route('/compras', methods=['GET', 'POST'])
@login_required
@ruta_permitida
def compras():
    if request.method == 'GET':
        ObtenerSubcat = text("SELECT * FROM subcategorias")
        subcategorias = db.execute(ObtenerSubcat).fetchall()
        ObtenerProveedores = text('SELECT * FROM proveedores')
        proveedores = db.execute(ObtenerProveedores).fetchall()

        ObtenerUnidades = text('SELECT * FROM unidades_medidas')
        unidades = db.execute(ObtenerUnidades).fetchall()

        obtenerTiposPago = text("SELECT * FROM tipos_pagos")
        obtenerColores = text("SELECT * FROM colores")
        obtenerMedidas = text("SELECT * FROM medidas")
        ObtenerCompras = text("""SELECT 
    compras.id,
    i.nombre ,
    proveedores.nombre_proveedor,
    d.cantidad,
    compras.fecha_compra,
    compras.total
FROM 
    compras
INNER JOIN 
    detalle_compra AS d ON compras.id = d.compra_id
INNER JOIN 
    insumos AS i ON d.insumo_id = i.id
LEFT JOIN 
    proveedores ON compras.proveedor_id = proveedores.id;
""")


        colores = db.execute(obtenerColores).fetchall()
        medidas = db.execute(obtenerMedidas).fetchall()
        tiposPago = db.execute(obtenerTiposPago).fetchall()
        compras = db.execute(ObtenerCompras).fetchall()
        return render_template('compras.html', Subcategorias = subcategorias, Proveedores = proveedores, Compras = compras, colores = colores, medidas = medidas, tipospago = tiposPago, unidades = unidades)
    else:
        proveedorId = request.form.get('proveedor-select')
        fecha_actual = datetime.now()
        fecha_formateada = fecha_actual.strftime('%Y-%m-%d')
        total = request.form.get('total')
        nota = request.form.get('nota-compra')
        tipoPago = request.form.get('tipoPago-select')

        productos = []
        index = 0
        while True:
            id = request.form.get(f'productos[{index}][id]')
            tipo = request.form.get(f'productos[{index}][tipo]')
            producto = request.form.get(f'productos[{index}][nombre]')
            cantidad = request.form.get(f'productos[{index}][cantidad]')
            precio = request.form.get(f'productos[{index}][precio]')

            if not producto:  # Termina cuando no encuentra más productos
                break
            productos.append({
                'id': int(id),
                'tipo': tipo,
                'producto': producto,
                'cantidad': int(cantidad),
                'precio': float(precio)
            })
            index += 1
        
        if not proveedorId:
            flash(('Ingrese el proveedor', 'error', '¡Error!'))
            return redirect(url_for('compras'))
        
        if not productos:
            flash(('Ingrese productos', 'error', '¡Error!'))
            return redirect(url_for('compras'))
        if not total:
            flash(('Ingrese total', 'error', '¡Error!'))
            return redirect(url_for('compras'))
       
        # Insertar datos en la base de datos

        insertarCompra = text("INSERT INTO compras (proveedor_id, fecha_compra, total, usuario_id, nota, id_tipo_pago) VALUES (:proveedor_id, :fecha_compra, :total, :usuario_id, :nota, :id_tipo_pago)")
        db.execute(insertarCompra, {"proveedor_id": proveedorId, "fecha_compra": fecha_formateada, "total": total, "usuario_id": session["user_id"], "nota": nota , "id_tipo_pago": tipoPago})

        for producto in productos:
            if producto['tipo'] == 'planta':
                planta_id = producto['id']
                insumo_id = None
            elif producto['tipo'] == 'insumo':
                planta_id = None
                insumo_id = producto['id']

            insertarKardex = text("INSERT INTO movimientos_kardex (planta_id, insumo_id, cantidad, tipo_movimiento_id, precio_unitario, fecha_movimiento, nota) VALUES (:planta_id, :insumo_id, :cantidad, :tipo_movimiento_id, :precio_unitario,:fecha_movimiento, :nota)")
            db.execute(insertarKardex, {"planta_id": planta_id, "insumo_id": insumo_id, "cantidad": producto['cantidad'], "tipo_movimiento_id": '1', "precio_unitario": producto['precio'], "fecha_movimiento": fecha_formateada, "nota": nota})

        compraId = db.execute(text("SELECT * FROM compras ORDER BY id DESC LIMIT 1")).fetchone()[0]
        kardexId = db.execute(text("SELECT * FROM movimientos_kardex ORDER BY id DESC LIMIT 1")).fetchone()[0]

        for producto in productos:
            if producto['tipo'] == 'planta':
                planta_id = producto['id']
                insumo_id = None
            elif producto['tipo'] == 'insumo':
                planta_id = None
                insumo_id = producto['id']

            subtotal = (producto['precio'] * producto['cantidad'])

            insertarProductos = text("INSERT INTO detalle_compra (compra_id, planta_id, insumo_id, kardex_id, cantidad, precio_unitario, subtotal) VALUES (:compra_id, :planta_id, :insumo_id, :kardex_id, :cantidad, :precio_unitario, :subtotal)")
            db.execute(insertarProductos, {"compra_id": compraId, "planta_id": planta_id, "insumo_id": insumo_id, "kardex_id": kardexId, "cantidad": producto['cantidad'], "precio_unitario": producto['precio'], "subtotal":subtotal})

        for producto in productos:
            stock_query = text("""
                    SELECT id, cantidad
                    FROM stock 
                    WHERE 
                        (planta_id = :planta_id OR :planta_id IS NULL)
                        AND 
                        (insumo_id = :insumo_id OR :insumo_id IS NULL)
            """)
            stockInfo = db.execute(
                stock_query, 
                {
                    "planta_id": producto['id'] if producto['tipo'] == 'planta' else None,
                    "insumo_id": producto['id'] if producto['tipo'] == 'insumo' else None
                }
            ).mappings().fetchone()
        
            stock_cantidad = int(stockInfo['cantidad'])
            nuevaCantidad = stock_cantidad + int(producto['cantidad'])

            if stockInfo['id']:
                actualizar_stock = text("""
                    UPDATE stock 
                    SET cantidad = :cantidad, 
                            kardex_id = :kardex_id,
                            estado = CASE WHEN :cantidad <= 0 THEN false ELSE true END
                        WHERE id = :id
                """)
                db.execute(
                    actualizar_stock, 
                    {
                        "cantidad": nuevaCantidad, 
                        "kardex_id": kardexId,
                        "id": stockInfo['id']
                    }
                )

        db.commit()
        flash(('La compra se ha realizado correctamente', 'success', '¡Exito!'))
        return redirect(url_for('compras'))
    
@app.route('/cambiarContraseña', methods=['POST'])
@login_required
def cambiarContraseña():
    idUsuario = request.form.get('id_usuario_contraseña')
    nuevaContraseña = request.form.get('nuevaContraseña')
    hashed_contraseña = generate_password_hash(nuevaContraseña)
    if not idUsuario:
        flash(('Error al cambiar contraseña', 'danger', 'Error'))
        return redirect(url_for('cambiarContraseña'))

    obtenerUsuario = text("SELECT * FROM usuarios WHERE id=:id")
    if db.execute(obtenerUsuario, {'id': idUsuario}).rowcount > 0:
        actualizarContraseña = text('UPDATE usuarios SET clave=:clave where id=:id')
        db.execute(actualizarContraseña, {'clave': hashed_contraseña, 'id': idUsuario})
        db.commit()
        flash(('La contraseña se ha actualizado correctamente', 'success', '¡Exito!'))
    return redirect(url_for('usuarios'))

@app.route('/listaDeseos', methods=["GET", "POST"])
def listaDeseos():
    if request.method == "GET":
        return render_template("listaDeseos.html")
    else:
        productoId = request.form.get('productoId')
        tipo = request.form.get('tipo')
        usuarioId = session["user_id"]
        fecha_actual = datetime.now()
        fecha_formateada = fecha_actual.strftime('%Y-%m-%d')

        if not productoId:
            flash(('No se recibio del Id del producto', 'error', '¡Error!'))


        if tipo == 'planta':
            planta_id = productoId
            insumo_id = None
        elif tipo == 'insumo':
            planta_id = None
            insumo_id = productoId

        obtenerListaDeseo = text('''SELECT * FROM listas_deseo WHERE usuario_id=:usuario_id AND (
          (planta_id = :planta_id AND :planta_id IS NOT NULL) 
          OR 
          (insumo_id = :insumo_id AND :insumo_id IS NOT NULL)
      )''')
        if db.execute(obtenerListaDeseo, {'usuario_id': usuarioId, 'planta_id': planta_id, 'insumo_id':insumo_id}).rowcount > 0:
            flash(('El producto ya ha sido agregado a la lista!', 'error', '¡Error!'))
            return redirect(url_for('catalogo'))
        else:
            insertarLista = text("""INSERT INTO listas_deseo (
	                        usuario_id, planta_id, insumo_id, fecha)
	                        VALUES (:usuario_id, :planta_id, :insumo_id, :fecha);""")
            db.execute(insertarLista, {'usuario_id': usuarioId, 'planta_id': planta_id, 'insumo_id': insumo_id, 'fecha': fecha_formateada})
            db.commit()
            flash(('Producto agregado a la lista de deseos!', 'success', '¡Exito!'))
        return redirect(url_for('catalogo'))

@app.route('/devoluciones', methods=["GET", "POST"])
@login_required

def devoluciones():
    if request.method == "GET":
        ObtenerMovimientos = text("SELECT * FROM tipo_movimientos WHERE tipo_movimiento = 'Devolución' OR tipo_movimiento = 'Devolucion por daños'")
        movimientos = db.execute(ObtenerMovimientos).fetchall()
        return render_template("devoluciones.html", Movimientos=movimientos)
    else:
        datos_formulario = request.form.to_dict(flat=False)
        print(datos_formulario)
        productos = []

        # Procesa los datos dinámicos enviados
        for key, values in datos_formulario.items():
            if key.startswith('productos'):
                # Extrae índices y campos
                index = key.split('[')[1].split(']')[0]  # Obtiene el índice del producto
                field = key.split('[')[2].split(']')[0]  # Obtiene el nombre del campo

                # Asegúrate de que el índice exista en la lista
                while len(productos) <= int(index):
                    productos.append({})

                productos[int(index)][field] = values[0]  # Asocia el campo al producto

        idVenta = request.form.get('idVenta')
        idMovimiento = int(request.form.get('movimiento-select'))
        tipoDevolucion = request.form.get('tipoDev-select')
        fecha = datetime.now()
        total = request.form.get('totalDev')
        nota = request.form.get('nota-devolucion')
        usuarioId = session["user_id"]

        # print(idVenta, idMovimiento, fecha, total, nota, productos)
        if not idVenta:
            flash(('No se ha seleccionado una venta para devolver!', 'error', '¡Error!'))
            return redirect(url_for('devoluciones'))
        if not idMovimiento:
            flash(('No se ha seleccionado un movimiento para devolver!', 'error', '¡Error!'))
            return redirect(url_for('devoluciones'))
        if not fecha:
            flash(('No se ha seleccionado una fecha para la devolución!', 'error', '¡Error!'))
            return redirect(url_for('devoluciones'))
        if not total:
            flash(('No se ha ingresado el total de la devolución!', 'error', '¡Error!'))
            return redirect(url_for('devoluciones'))
        if not nota:
            flash(('No se ha ingresado una nota para la devolución!', 'error', '¡Error!'))
            return redirect(url_for('devoluciones'))
        
        insertarDevolucion = text("INSERT INTO devoluciones (venta_id, motivo, fecha_devolucion, total) VALUES (:venta_id, :motivo, :fecha_devolucion, :total)")
        db.execute(insertarDevolucion, {"venta_id": idVenta, "motivo": nota, "fecha_devolucion": fecha, "total": total})

        for producto in productos:
            if producto['tipo'] == 'planta':
                planta_id = producto['idProduc']
                insumo_id = None
            elif producto['tipo'] == 'insumo':
                planta_id = None
                insumo_id = producto['idProduc']

            insertarKardex = text("INSERT INTO movimientos_kardex (planta_id, insumo_id, cantidad, tipo_movimiento_id, precio_unitario, fecha_movimiento, nota) VALUES (:planta_id, :insumo_id, :cantidad, :tipo_movimiento_id, :precio_unitario,:fecha_movimiento, :nota)")
            db.execute(insertarKardex, {"planta_id": planta_id, "insumo_id": insumo_id, "cantidad": producto['cantidad'], "tipo_movimiento_id": 5, "precio_unitario": producto['precio'], "fecha_movimiento": fecha, "nota": nota})

        devolucionId = db.execute(text("SELECT * FROM devoluciones ORDER BY id DESC LIMIT 1")).fetchone()[0]
        kardexId = db.execute(text("SELECT * FROM movimientos_kardex ORDER BY id DESC LIMIT 1")).fetchone()[0]

        for producto in productos:
            if producto['tipo'] == 'planta':
                planta_id = producto['idProduc']
                insumo_id = None
            elif producto['tipo'] == 'insumo':
                planta_id = None
                insumo_id = producto['idProduc']

            insertarDetalle = text("INSERT INTO detalle_devoluciones (devolucion_id, planta_id, insumo_id, kardex_id, cantidad, precio_unitario, subtotal) VALUES (:devolucion_id, :planta_id, :insumo_id, :kardex_id, :cantidad, :precio_unitario, :subtotal)")
            db.execute(insertarDetalle, {"devolucion_id": devolucionId, "planta_id": planta_id, "insumo_id": insumo_id, "kardex_id": kardexId, "cantidad": producto['cantidad'], "precio_unitario": producto['precio'], "subtotal":producto['subtotal']})
        
        for producto in productos:
            stock_query = text("""
                    SELECT id, cantidad
                    FROM stock 
                    WHERE 
                        (planta_id = :planta_id OR :planta_id IS NULL)
                        AND 
                        (insumo_id = :insumo_id OR :insumo_id IS NULL)
            """)
            stockInfo = db.execute(
                stock_query, 
                {
                    "planta_id": producto['idProduc'] if producto['tipo'] == 'planta' else None,
                    "insumo_id": producto['idProduc'] if producto['tipo'] == 'insumo' else None
                }
            ).mappings().fetchone()
        
            stock_cantidad = int(stockInfo['cantidad'])
            nuevaCantidad = stock_cantidad + int(producto['cantidad'])

            if stockInfo['id']:
                actualizar_stock = text("""
                    UPDATE stock 
                    SET cantidad=:cantidad, kardex_id=:kardex_id    
                    WHERE id=:id
                """)
                db.execute(
                    actualizar_stock, 
                    {
                        "cantidad": nuevaCantidad, 
                        "kardex_id": kardexId, 
                        "id": stockInfo['id']
                    }
                )
        for producto in productos:

            dañados = int(producto.get('dañados', 0))

            if producto['tipo'] == 'planta':
                planta_id = producto['idProduc']
                insumo_id = None
            elif producto['tipo'] == 'insumo':
                planta_id = None
                insumo_id = producto['idProduc']

            if (idMovimiento == 6 and dañados > 0):
                insertarKardex = text("INSERT INTO movimientos_kardex (planta_id, insumo_id, cantidad, tipo_movimiento_id, precio_unitario, fecha_movimiento, nota) VALUES (:planta_id, :insumo_id, :cantidad, :tipo_movimiento_id, :precio_unitario,:fecha_movimiento, :nota)")
                db.execute(insertarKardex, {"planta_id": planta_id, "insumo_id": insumo_id, "cantidad": producto['dañados'], "tipo_movimiento_id": idMovimiento, "precio_unitario": producto['precio'], "fecha_movimiento": fecha, "nota": nota})

                kardexId = db.execute(text("SELECT * FROM movimientos_kardex ORDER BY id DESC LIMIT 1")).fetchone()[0]
                stock_query = text("""
                        SELECT id, cantidad
                        FROM stock 
                        WHERE 
                            (planta_id = :planta_id OR :planta_id IS NULL)
                            AND 
                            (insumo_id = :insumo_id OR :insumo_id IS NULL)
                """)
                stockInfo = db.execute(
                    stock_query, 
                    {
                        "planta_id": producto['idProduc'] if producto['tipo'] == 'planta' else None,
                        "insumo_id": producto['idProduc'] if producto['tipo'] == 'insumo' else None
                    }
                ).mappings().fetchone()
                stock_cantidad = int(stockInfo['cantidad'])
                nuevaCantidad = stock_cantidad - int(producto['dañados'])
                if stockInfo['id']:
                    actualizar_stock = text("""
                        UPDATE stock 
                        SET cantidad=:cantidad, kardex_id=:kardex_id    
                        WHERE id=:id
                    """)
                    db.execute(
                        actualizar_stock, 
                        {
                            "cantidad": nuevaCantidad, 
                            "kardex_id": kardexId, 
                            "id": stockInfo['id']
                        }
                    )

                # Lógica adicional según tipo de devolución
        if tipoDevolucion == "1":
            # Inserta el reembolso en la tabla de gastos
            insertarGasto = text("INSERT INTO gastos (monto, fecha, descripcion) VALUES (:monto, :fecha, :motivo)")
            db.execute(insertarGasto, {"monto": total, "fecha": fecha, "motivo": f"Reposición por devolución {idVenta}"})
        
        elif tipoDevolucion == "2":
            ObtenerVenta = text('SELECT * FROM ventas WHERE id=:id')
            venta = db.execute(ObtenerVenta, {'id': idVenta}).mappings().fetchone()

            insertarVenta = text("INSERT INTO ventas (nombre_cliente, usuario_id, id_cliente_categoria, id_tipo_pago, fecha_venta, nota, total, estado) VALUES (:nombre_cliente, :usuario_id, :id_cliente_categoria, :id_tipo_pago, :fecha_venta, :nota,:total, :estado)")
            db.execute(insertarVenta, {"nombre_cliente": venta["nombre_cliente"], "usuario_id": session["user_id"], "id_cliente_categoria": venta["id_cliente_categoria"], "id_tipo_pago": 1 ,"fecha_venta": fecha, "nota": f"Reposición por devolución {idVenta}", "total": 0, "estado": 'true'})


            for producto in productos:
                if producto['tipo'] == 'planta':
                    planta_id = producto['idProduc']
                    insumo_id = None
                elif producto['tipo'] == 'insumo':
                    planta_id = None
                    insumo_id = producto['idProduc']

                insertarKardex = text("INSERT INTO movimientos_kardex (planta_id, insumo_id, cantidad, tipo_movimiento_id, precio_unitario, fecha_movimiento, nota) VALUES (:planta_id, :insumo_id, :cantidad, :tipo_movimiento_id, :precio_unitario,:fecha_movimiento, :nota)")
                db.execute(insertarKardex, {"planta_id": planta_id, "insumo_id": insumo_id, "cantidad": producto['cantidad'], "tipo_movimiento_id": '2', "precio_unitario": producto['precio'], "fecha_movimiento": fecha, "nota": f"Reposición por devolución {idVenta}"})

            ventaId = db.execute(text("SELECT * FROM ventas ORDER BY id DESC LIMIT 1")).fetchone()[0]
            kardexId = db.execute(text("SELECT * FROM movimientos_kardex ORDER BY id DESC LIMIT 1")).fetchone()[0]

            for producto in productos:
                if producto['tipo'] == 'planta':
                    planta_id = producto['idProduc']
                    insumo_id = None
                elif producto['tipo'] == 'insumo':
                    planta_id = None
                    insumo_id = producto['idProduc']

                insertarProductos = text("INSERT INTO detalle_ventas (planta_id, insumo_id, venta_id, kardex_id, cantidad, precio_unitario, subtotal) VALUES (:planta_id, :insumo_id, :venta_id, :kardex_id, :cantidad, :precio_unitario, :subtotal)")
                db.execute(insertarProductos, {"planta_id": planta_id, "insumo_id": insumo_id, "venta_id": ventaId, "kardex_id": kardexId, "cantidad": producto['cantidad'], "precio_unitario": producto['precio'], "subtotal": 0})

            for producto in productos:
                stock_query = text("""
                        SELECT id, cantidad
                        FROM stock 
                        WHERE 
                            (planta_id = :planta_id OR :planta_id IS NULL)
                            AND 
                            (insumo_id = :insumo_id OR :insumo_id IS NULL)
                """)
                stockInfo = db.execute(
                    stock_query, 
                    {
                        "planta_id": producto['idProduc'] if producto['tipo'] == 'planta' else None,
                        "insumo_id": producto['idProduc'] if producto['tipo'] == 'insumo' else None
                    }
                ).mappings().fetchone()

                stock_cantidad = int(stockInfo['cantidad'])
                nuevaCantidad = stock_cantidad - int(producto['cantidad'])

                if stockInfo['id']:
                    actualizar_stock = text("""
                        UPDATE stock 
                            SET cantidad = :cantidad, 
                                kardex_id = :kardex_id,
                                estado = CASE WHEN :cantidad <= 0 THEN false ELSE true END
                            WHERE id = :id
                    """)
                    db.execute(
                        actualizar_stock, 
                        {
                            "cantidad": nuevaCantidad, 
                            "kardex_id": kardexId, 
                            "id": stockInfo['id']
                        }
                    )

        db.commit()
        flash(('La devolucion se ha realizado correctamente', 'success', '¡Exito!'))
        return redirect(url_for('devoluciones'))
    
@app.route('/obtener_ventas', methods=["POST"])
def obtener_ventas():
    ventaId = request.json.get('idVenta', '')
    # print(subcategoria)

    ObtenerVenta = text("""
                SELECT 
            detalle_ventas.id AS idDetalleVenta,
            detalle_ventas.planta_id AS plantaId,
            plantas.nombre AS nombrePlanta,
            detalle_ventas.insumo_id AS insumoID,
            insumos.nombre AS nombreInsumo,
            detalle_ventas.venta_id AS ventaId, 
            detalle_ventas.kardex_id AS kardexId, 
            detalle_ventas.cantidad AS cantidad,
            detalle_ventas.precio_unitario AS precio
        FROM public.detalle_ventas
        LEFT JOIN plantas 
            ON detalle_ventas.planta_id = plantas.id
        LEFT JOIN insumos 
            ON detalle_ventas.insumo_id = insumos.id
        WHERE detalle_ventas.venta_id = :venta_id
          AND NOT EXISTS (
              SELECT 1
              FROM public.devoluciones
              WHERE devoluciones.venta_id = detalle_ventas.venta_id
          );
        
    """)
    
    infoVenta = db.execute(ObtenerVenta, {'venta_id': ventaId}).mappings().all()
    # print(infoVenta)
    # print (infoProd)
    detalleVenta = [
    {
        'id': info.iddetalleventa,
        'idProd': info.plantaid if info.plantaid is not None else info.insumoid, 
        'nombre': info.nombreplanta if info.nombreplanta else info.nombreinsumo,
        'precio': info.precio,
        'cantidad': info.cantidad,
        'tipo': 'planta' if info.plantaid is not None else 'insumo',
    }
    for info in infoVenta
]

    # print(productos)
    return jsonify(detalleVenta)

@app.route('/catalogo', methods=["GET", "POST"])
@login_required
# @ruta_permitida
def catalogo():
    if request.method == "GET":
        
        #mostrar los productos en las cards en general y filtrar por categoria pero todas
        
        id_categoria = request.args.get("categoriaSeleccionada")

        obtenerCategorias = text("SELECT c.id, c.categoria FROM categorias as c ORDER BY c.id ASC")
        categorias = db.execute(obtenerCategorias).fetchall()

        #obtener los productos en lista de deseo por cliente
        usuarioID = session["user_id"]
        obtenerListaDeseo = text(""" SELECT
    COALESCE(p.id, i.id) AS id,
    COALESCE(p.nombre, i.nombre) AS nombre_producto,
    COALESCE(p.precio_venta, i.precio_venta) AS precio_producto,
    CASE 
        WHEN l.planta_id IS NOT NULL THEN 'planta'
        WHEN l.insumo_id IS NOT NULL THEN 'insumo'
    END AS tipo_producto,
    l.fecha AS fecha_agregado
FROM 
    listas_deseo AS l
LEFT JOIN 
    plantas AS p ON l.planta_id = p.id
LEFT JOIN 
    insumos AS i ON l.insumo_id = i.id
WHERE 
    l.usuario_id = :id;""")
        listaDeseos = db.execute(obtenerListaDeseo,{"id":usuarioID}).fetchall()


        return render_template("catalogo.html",categorias=categorias, listadeseos=listaDeseos)
    return render_template('catalogo.html')

@app.route("/vaciarListaDeseo", methods=["POST"])
def varciarListaDeseo():
    # Eliminar todos los productos de la lista de deseos
    idUsuario = session["user_id"]

    queryEliminarListaDeseo = text("DELETE FROM listas_deseo WHERE usuario_id = :idUsuario")
    db.execute(queryEliminarListaDeseo, {"idUsuario": idUsuario})
    db.commit()
    flash(('Lista de deseos vaciada', 'success', '¡Éxito!'))
    return redirect(url_for('catalogo'))

@app.route("/eliminarProductoLD", methods=["POST"])
def eliminarProductoLD():
    idProducto = request.form.get("id_eliminar")
    tipo = request.form.get("tipo")  # Se debe enviar el tipo ('planta' o 'insumo') desde el formulario
    print(idProducto, tipo)

    if not idProducto or not tipo:
        flash(('Error al eliminar el producto. Datos incompletos.', 'error', '¡Error!'))
        return redirect(url_for('catalogo'))

    # Construir la consulta dependiendo del tipo de producto
    if tipo == "planta":
        queryEliminarProducto = text("DELETE FROM listas_deseo WHERE planta_id = :idProducto")
    elif tipo == "insumo":
        queryEliminarProducto = text("DELETE FROM listas_deseo WHERE insumo_id = :idProducto")
    else:
        flash(('Tipo de producto desconocido.', 'error', '¡Error!'))
        return redirect(url_for('catalogo'))

    # Ejecutar la consulta
    db.execute(queryEliminarProducto, {"idProducto": idProducto})
    db.commit()
    flash(('Producto eliminado de la lista de deseos', 'success', '¡Éxito!'))
    return redirect(url_for('catalogo'))

@app.route("/obtener_subcategorias", methods=["POST"])
def obtener_subcategorias():
    id_categoria = request.json.get('categoria','')
    print(id_categoria)

    obtenerSubcategorias = text("SELECT s.id, s.subcategoria FROM subcategorias as s INNER JOIN categorias as c ON s.categoria_id = c.id WHERE c.id = :id ORDER BY c.id ASC")

    subcategoriasObtenidas = db.execute(obtenerSubcategorias, {"id": id_categoria}).fetchall()

    subcategorias = [
        {'id': subcategoria[0], 'subcategoria': subcategoria[1]}
        for subcategoria in subcategoriasObtenidas
    ]

    return jsonify(subcategorias)

#---------------- rutas para buscar info en cada search
@app.route('/usuarios_json', methods=["GET"])
def usuarios_json():
    print("Usuarios JSON")
    # Obtener usuarios con rol 1 o 2
    obtenerUsuarios = text("""
        SELECT u.id, u.nombre_completo, u.correo, r.rol, u.rol_id
        FROM usuarios u
        INNER JOIN roles r ON r.id = u.rol_id
        WHERE u.rol_id = 1 OR u.rol_id = 2 AND estado = 'true'
        ORDER BY u.id ASC
    """)
    usuarios = db.execute(obtenerUsuarios).fetchall()

    # Convertir los resultados a un formato que se pueda convertir a JSON
    usuarios_json = [
        {'id': usuario[0], 'nombre_completo': usuario[1], 'correo': usuario[2], 'rol': usuario[3], 'rol_id': usuario[4]}
        for usuario in usuarios
    ]

    return jsonify(usuarios_json)  # Enviar los usuarios como respuesta JSON

@app.route('/generar_json_categorias', methods=["GET"])
def generar_json_categorias():
    print("entro a generar json categorias")
    categoriasquery = text("SELECT c.id, c.categoria, c.descripcion FROM categorias as c WHERE estado = 'true' ORDER BY c.id ASC")
    categorias = db.execute(categoriasquery).fetchall()

    categorias_json = [{"id": categoria[0], "categoria": categoria[1], "descripcion": categoria[2]} for categoria in categorias]
    return jsonify(categorias_json)

@app.route('/generar_json_subcategorias', methods=["GET"])
def generar_json_subcategorias():
    print("entro a generar json subcategorias")
    subcategoriasquery = text("SELECT s.id, s.subcategoria, c.categoria, s.descripcion, c.id FROM subcategorias as s INNER JOIN categorias as c ON s.categoria_id = c.id WHERE s.estado = 'true' ORDER BY s.id ASC")
    subcategorias = db.execute(subcategoriasquery).fetchall()

    subcategorias_json = [{"id": subcategoria[0], "subcategoria": subcategoria[1], "categoria": subcategoria[2], "descripcion": subcategoria[3], "id_categoria": subcategoria[4]} for subcategoria in subcategorias]
    return jsonify(subcategorias_json)

@app.route('/generar_json_proveedores', methods=["GET"])
def generar_json_proveedores():
    print("entro a generar json proveedores")
    proveedoresquery = text("SELECT * FROM proveedores WHERE estado = 'true' ORDER BY id ASC")
    proveedores = db.execute(proveedoresquery).fetchall()

    proveedores_json = [{"id": proveedor[0], "nombre_proveedor": proveedor[1], "correo_electronico": proveedor[2], "telefono": proveedor[3], "direccion": proveedor[4]} for proveedor in proveedores]
    return jsonify(proveedores_json)

@app.route('/generar_json_plantas', methods=["GET"])
def generar_json_plantas():
    print("entro a generar json plantas")
    plantasquery = text("""SELECT 
    plantas.id AS id, 
    plantas.nombre AS nombre,
    plantas.imagen_url AS imagen_url,
    plantas.descripcion AS descripcion,
    
    STRING_AGG(DISTINCT subcategorias.subcategoria, ', ') AS subcategoria,
    STRING_AGG(DISTINCT subcategorias.id::text, ', ') AS id_subcategoria,
    
    entornos_ideales.entorno AS entorno,
    entornos_ideales.id AS id_entorno,
    
    requerimientos_agua.requerimiento_agua AS agua,
    requerimientos_agua.id AS id_agua,
    
    tipos_suelos.tipo_suelo AS suelo,
    tipos_suelos.id AS id_suelo,
    
    temporadas_plantacion.temporada AS temporada,
    temporadas_plantacion.id AS id_temporada,
    
    plantas.precio_venta AS precio_venta
    
FROM 
    plantas
JOIN 
    plantas_subcategoria ON plantas.id = plantas_subcategoria.planta_id
JOIN 
    subcategorias ON plantas_subcategoria.subcategoria_id = subcategorias.id
JOIN 
    entornos_ideales ON plantas.entorno_ideal_id = entornos_ideales.id
JOIN 
    requerimientos_agua ON plantas.requerimiento_agua_id = requerimientos_agua.id
JOIN 
    tipos_suelos ON plantas.tipo_suelo_id = tipos_suelos.id
JOIN 
    temporadas_plantacion ON plantas.temporada_plantacion_id = temporadas_plantacion.id
                        
WHERE plantas.estado = 'true'

GROUP BY 
    plantas.id, 
    plantas.nombre, 
    plantas.descripcion, 
    plantas.imagen_url, 
    entornos_ideales.id, 
    entornos_ideales.entorno, 
    requerimientos_agua.id, 
    requerimientos_agua.requerimiento_agua, 
    tipos_suelos.id, 
    tipos_suelos.tipo_suelo, 
    temporadas_plantacion.id, 
    temporadas_plantacion.temporada, 
    plantas.precio_venta;""")
    plantas = db.execute(plantasquery).fetchall()

    plantas_json = [
           
           { 'id': planta[0],
        'nombre': planta[1],
        'imagen_url': planta[2],
        'descripcion': planta[3],
        'subcategoria': planta[4],
        'id_subcategoria': planta[5],  # Agregar este campo para los IDs de subcategorías
        'entorno': planta[6],
        'id_entorno': planta[7],
        'agua': planta[8],
        'id_agua': planta[9],
        'suelo': planta[10],
        'id_suelo': planta[11],
        'temporada': planta[12],
        'id_temporada': planta[13],
        'precio_venta': planta[14]
    }
    for planta in plantas
    ]
    return jsonify(plantas_json)

@app.route('/generar_json_insumos', methods=['GET'])
def generar_json_insumos():
    print("entro a generar json insumos")
    insumosquery = text(""" SELECT i.id,
                               i.nombre, 
                              ap.aplicacion,
                               ap.id,
                               i.descripcion,
                               cp.composicion,
                               cp.id,
                               i.frecuencia_aplicacion,
                               i.compatibilidad,
                               i.precauciones,
                               STRING_AGG(DISTINCT sub.subcategoria, ', ') AS subcategoria,
                               STRING_AGG(DISTINCT sub.id::text, ', ') AS sub_id,  -- Concatenar subcategorias id
                               unidad.unidad_medida,
                               unidad.id,
                               i.fecha_vencimiento,
                               i.precio_venta,
                               i.imagen_url 
                              FROM insumos i
                              INNER JOIN insumos_subcategoria s ON i.id = s.insumo_id 
                              INNER JOIN subcategorias sub ON sub.id = s.subcategoria_id
                              INNER JOIN composiciones_principales cp ON i.composicion_principal_id = cp.id
                              INNER JOIN insumos_unidades iu ON i.id = iu.insumo_id
                              INNER JOIN unidades_medidas unidad ON unidad.id = iu.unidad_medida_id
                              INNER JOIN aplicaciones_insumos api ON api.insumo_id = i.id
                              INNER JOIN aplicaciones ap ON ap.id = api.aplicacion_id 
                              WHERE i.estado = 'true'
                               GROUP BY 
                              i.id, 
                              i.nombre, 
                              ap.aplicacion, 
                              ap.id, 
                              i.descripcion, 
                              cp.composicion, 
                              cp.id, 
                              i.frecuencia_aplicacion, 
                              i.compatibilidad, 
                              i.precauciones,
                              unidad.unidad_medida, 
                              unidad.id,
                              i.fecha_vencimiento, 
                              i.precio_venta, 
                              i.imagen_url
                              ORDER BY i.id ASC; 
                              """)
  
    insumos = db.execute(insumosquery).fetchall()
# Asegurarse de formatear correctamente la fecha de vencimiento
    insumos_json = [
    {
        'id': insumo[0],
        'nombre': insumo[1],
        'aplicacion': insumo[2],
        'id_aplicacion': insumo[3],
        'descripcion': insumo[4],
        'composicion': insumo[5],
        'id_composicion': insumo[6],
        'frecuencia_aplicacion': insumo[7],
        'compatibilidad': insumo[8],
        'precauciones': insumo[9],
        'subcategoria': insumo[10],
        'id_subcategoria': insumo[11],  # IDs de subcategorías concatenadas
        'unidad_medida': insumo[12],
        'id_unidad_medida': insumo[13],
        'fecha_vencimiento': insumo[14], 
        'precio_venta': insumo[15],
        'imagen_url': insumo[16],
    }
    for insumo in insumos
    ]

    return jsonify(insumos_json)

@app.route('/generar_inventario_info', methods=["GET"])
def inventario_info():
    query = text("""
              
              SELECT 
    COALESCE(p.id, i.id) AS producto_id, 
    COALESCE(p.nombre, i.nombre) AS nombre_producto,
    COALESCE(p.precio_venta, i.precio_venta) AS precio_venta,
    COALESCE(p.imagen_url, i.imagen_url) AS imagen_url,
    inv.cantidad,
    CASE
        WHEN p.id IS NOT NULL THEN 'planta'
        WHEN i.id IS NOT NULL THEN 'insumo'
    END AS tipo_producto,
    COALESCE(u.unidad_medida, 'N/A') AS unidad_medida
        FROM stock as inv
        LEFT JOIN plantas as p ON p.id = inv.planta_id
        LEFT JOIN insumos as i ON i.id = inv.insumo_id
        LEFT JOIN insumos_unidades AS iu ON iu.insumo_id = i.id
        LEFT JOIN unidades_medidas AS u ON u.id = iu.id 
        INNER JOIN movimientos_kardex as mk ON mk.id = inv.kardex_id
              """)
    
    productos = db.execute(query).fetchall()

    # Convertir los resultados en un diccionario para jsonify
    resultado = [
        {
            "producto_id": prod.producto_id,
            "nombre_producto": prod.nombre_producto,
            "precio_venta": prod.precio_venta,
            "imagen_url": prod.imagen_url,
            "cantidad": prod.cantidad,
            "tipo_producto": prod.tipo_producto,
            "unidad_medida": prod.unidad_medida,
        }
        for prod in productos
    ]

    return jsonify(resultado)

@app.route('/generar_json_lista_deseo', methods=["GET"])
def generar_json_lista_deseo():
    print("entro a generar json lista de deseos")
    listaDeseoquery = text("""SELECT DISTINCT u.id, u.nombre_completo, u.correo, l.fecha
FROM usuarios AS u
INNER JOIN listas_deseo AS l ON u.id = l.usuario_id;
""")
    listaDeseo = db.execute(listaDeseoquery, {'id': session["user_id"]}).fetchall()

   # Convertir los resultados en un diccionario {mes: total_ventas}
    listaDeseoJson = [
        {'id': listaDeseo[0],
        'usuario_nombre': listaDeseo[1],
        'correo': listaDeseo[2],
        'fecha': listaDeseo[3]
    }
    for listaDeseo in listaDeseo
    ]

    return jsonify(listaDeseoJson)

@app.route("/generar_json_ventas", methods=["GET"])
def generar_json_ventas():
    print("entro a generar json ventas")
    ventasquery = text("""SELECT 
    v.id, 
    v.nombre_cliente AS nombre, 
    v.fecha_venta AS fecha, 
    v.total
FROM 
    ventas AS v
""")
    ventas = db.execute(ventasquery).fetchall()

    # Convertir los resultados en un diccionario {mes: total_ventas}
    ventasJson = [
        {'id': venta[0],
        'nombre': venta[1],
        'fecha': venta[2],
        'total': venta[3]
    }
    for venta in ventas
    ]   

    return jsonify(ventasJson)

@app.route("/generar_json_compras", methods=["GET"])
def generar_json_compras():
    print("entro a generar json compras")
    comprasquery = text("""SELECT 
    compras.id,
    i.nombre ,
    proveedores.nombre_proveedor,
    d.cantidad,
    compras.fecha_compra,
    compras.total
FROM 
    compras
INNER JOIN 
    detalle_compra AS d ON compras.id = d.compra_id
INNER JOIN 
    insumos AS i ON d.insumo_id = i.id
LEFT JOIN 
    proveedores ON compras.proveedor_id = proveedores.id;""")
    comprainfo = db.execute(comprasquery).fetchall()
    # Convertir los resultados en un diccionario {mes: total_ventas}
    comprasJson = [
        {'id': compra[0],
        'nombre': compra[1],
        'nombre_proveedor': compra[2],
        'cantidad': compra[3],
        'fecha_compra': compra[4],
        'total': compra[5]
    }
    for compra in comprainfo
    ]       
    return jsonify(comprasJson)

@app.route("/generar_json_gastos", methods=["GET"])
def generar_json_gastos():
    print("entro a generar json gastos")
    gastosquery = text("""SELECT 
    g.id, 
    g.monto,
    g.fecha,
    g.descripcion
FROM 
    gastos g
""")
    gastos = db.execute(gastosquery).fetchall()

    # Convertir los resultados en un diccionario {mes: total_ventas}
    gastosJson = [
        {'id': gasto[0],
        'monto': gasto[1],
        'fecha': gasto[2],
        'descripcion': gasto[3]
    }
    for gasto in gastos
    ]   

    return jsonify(gastosJson)

@app.route('/produccion', methods=["GET", "POST"])
@login_required
def produccion():
   
    if request.method == 'POST':
        
        idPlanta = request.form.get("id_planta_produccion")
        tipoMovimiento = 4
        precio = request.form.get("precioPlanta")
        nota = request.form.get("nota")
        cantidad = request.form.get("cantidad")
        fechaactual = datetime.now().date()

        if not nota or not cantidad:
            flash(('Verifique los campos, estan vacios', "error"))
            return redirect(url_for("inventario")) 
        
        
        ObtenerPlantaStock = text('SELECT * FROM stock WHERE planta_id=:id')
        infoStock = db.execute(ObtenerPlantaStock,{"id":idPlanta}).mappings().fetchone()


        nuevaCantidad = int(infoStock['cantidad']) + int(cantidad)
        print(infoStock['id'])
        
        insertarPlantaquery = text("INSERT INTO movimientos_kardex (planta_id, cantidad, tipo_movimiento_id, precio_unitario, fecha_movimiento, nota) VALUES (:planta_id, :cantidad, :tipo_movimiento_id, :precio_unitario,:fecha_movimiento, :nota)")
        db.execute(insertarPlantaquery, {"planta_id": idPlanta, "cantidad": cantidad, "tipo_movimiento_id": tipoMovimiento, "precio_unitario": precio, "fecha_movimiento": fechaactual, "nota": nota})
        
        kardexId = db.execute(text("SELECT * FROM movimientos_kardex ORDER BY id DESC LIMIT 1")).fetchone()[0]

        actualizar_stock = text("""
                    UPDATE stock 
                    SET cantidad = :cantidad, 
                            kardex_id = :kardex_id,
                            estado = CASE WHEN :cantidad <= 0 THEN false ELSE true END
                        WHERE id = :id
                """)
        db.execute(
            actualizar_stock, 
            {
                "cantidad": nuevaCantidad, 
                "kardex_id": kardexId, 
                "id": infoStock['id']
            }
        )
        db.commit()

        flash(('Se ha actualizado el stock correctamente', 'success'))
        return redirect(url_for("inventario"))
    
    return redirect(url_for('inventario'))

@app.route('/insumosproduccion', methods=["POST"])
@login_required
def insumosproduccion():
    if request.method == 'POST':
        idInsumo = request.form.get('id_producto_baja')
        print(idInsumo)
        cantidad = request.form.get('cantidad')
        print(cantidad)
        fechaactual = datetime.now().date()
        precio = request.form.get('precioPlanta')
        nota = request.form.get('nota')

        if not nota or not cantidad:
            flash(('Verifique los campos, estan vacios', "error"))
            return redirect(url_for("inventario")) 

        
        ObtenerInsumoStock = text('SELECT * FROM stock WHERE insumo_id=:id')
        infoStock = db.execute(ObtenerInsumoStock,{"id":idInsumo}).mappings().fetchone()

        ObtenerMovimiento = text('SELECT * FROM tipo_movimientos WHERE tipo_movimiento=:tipo_movimiento')
        infoMovimiento = db.execute(ObtenerMovimiento, {"tipo_movimiento": 'Salida a producción'}).mappings().fetchone()

        cantidadStock = int(infoStock["cantidad"])
        nuevaCantidad = cantidadStock - int(cantidad)
        print(infoStock['cantidad'])
        
        insertarPlantaquery = text("INSERT INTO movimientos_kardex (insumo_id, cantidad, tipo_movimiento_id, precio_unitario, fecha_movimiento, nota) VALUES (:insumo_id, :cantidad, :tipo_movimiento_id, :precio_unitario,:fecha_movimiento, :nota)")
        db.execute(insertarPlantaquery, {"insumo_id": idInsumo, "cantidad": cantidad, "tipo_movimiento_id": infoMovimiento["id"], "precio_unitario": precio, "fecha_movimiento": fechaactual, "nota": nota})
        
        kardexId = db.execute(text("SELECT * FROM movimientos_kardex ORDER BY id DESC LIMIT 1")).fetchone()[0]

        actualizar_stock = text("""
                    UPDATE stock 
                    SET cantidad = :cantidad, 
                            kardex_id = :kardex_id,
                            estado = CASE WHEN :cantidad <= 0 THEN false ELSE true END
                        WHERE id = :id
                """)
        db.execute(
            actualizar_stock, 
            {
                "cantidad": nuevaCantidad, 
                "kardex_id": kardexId, 
                "id": infoStock['id']
            }
        )
        db.commit()

        flash(('Se ha actualizado el stock correctamente', 'success'))
        return redirect(url_for("inventario"))
    
    return redirect(url_for('inventario'))

@app.route('/bajaproductos', methods=["GET", "POST"])
@login_required
def bajaproductos():
    if request.method == 'POST':
        
        idProducto = request.form.get("id_producto_baja")
        tipoMovimiento = 8
        precio = request.form.get("precioPlanta")
        nota = request.form.get("nota")
        cantidad = request.form.get("cantidad")
        tipo = request.form.get('tipo_producto_baja')
        fechaactual = datetime.now().date()

        if not nota or not cantidad:
            flash(('Verifique los campos, estan vacios', "error"))
            return redirect(url_for("inventario")) 
        
        if (tipo == 'planta'):
            id_planta = idProducto
            id_insumo = None
        else:
            id_planta = None
            id_insumo = idProducto

        ObtenerPlantaStock = text('SELECT * FROM stock WHERE planta_id=:id OR insumo_id=:insumo_id')
        infoStock = db.execute(ObtenerPlantaStock,{"id":id_planta, "insumo_id": id_insumo}).mappings().fetchone()


        nuevaCantidad = int(infoStock['cantidad']) - int(cantidad)
        
        insertarPlantaquery = text("INSERT INTO movimientos_kardex (planta_id, insumo_id, cantidad, tipo_movimiento_id, precio_unitario, fecha_movimiento, nota) VALUES (:planta_id, :insumo_id, :cantidad, :tipo_movimiento_id, :precio_unitario,:fecha_movimiento, :nota)")
        db.execute(insertarPlantaquery, {"planta_id": id_planta, "insumo_id": id_insumo, "cantidad": cantidad, "tipo_movimiento_id": tipoMovimiento, "precio_unitario": precio, "fecha_movimiento": fechaactual, "nota": nota})
        
        kardexId = db.execute(text("SELECT * FROM movimientos_kardex ORDER BY id DESC LIMIT 1")).fetchone()[0]

        actualizar_stock = text("""
                    UPDATE stock 
                    SET cantidad = :cantidad, 
                            kardex_id = :kardex_id,
                            estado = CASE WHEN :cantidad <= 0 THEN false ELSE true END
                        WHERE id = :id
                """)
        db.execute(
            actualizar_stock, 
            {
                "cantidad": nuevaCantidad, 
                "kardex_id": kardexId, 
                "id": infoStock['id']
            }
        )
        db.commit()

        flash(('Se ha actualizado el stock correctamente', 'success'))
        return redirect(url_for("inventario"))
    
    return redirect(url_for('inventario'))

@app.route('/agregar_produccion', methods=["GET", "POST"])
@login_required
def agregar_produccion():
   
    if request.method == 'POST':
        
        idProducto = request.form.get("id_planta_produccion")
        print(idProducto)
        tipoProducto = request.form.get("tipo_producto")
        print(tipoProducto)
        tipoMovimiento = 4
        nota = request.form.get("nota")
        cantidad = request.form.get("cantidad")
        fechaactual = datetime.now().date()

        if not nota or not cantidad:
            flash(('Verifique los campos, estan vacios', "error"))
            return redirect(url_for("inventario")) 
        if not cantidad:
            flash("Ingrese cantidad", "error")
            return redirect(url_for("inventario"))

         # Determinar si el producto es planta o insumo
        if (tipoProducto == 'Planta'):
            id_planta = idProducto
            id_insumo = None
        else:
            id_planta = None
            id_insumo = idProducto

        print("planta", id_planta)
        print("insumo", id_insumo)
        # Consulta para obtener el precio y tipo del producto
        productos_query = text("""
            SELECT precio_venta, 'Planta' AS tipo_producto
            FROM plantas
            WHERE id = :id_planta
            UNION
            SELECT precio_venta, 'Insumo' AS tipo_producto
            FROM insumos
            WHERE id = :id_insumo
        """)

        # Ejecutar la consulta
        producto = db.execute(productos_query, {'id_planta': id_planta, 'id_insumo': id_insumo}).fetchone()

        if producto:
            precio_venta = producto[0]        
        else:
            precio_venta = 0

        print (f"precio de la compra: {precio_venta}")

        
        insertarPlantaquery = text("INSERT INTO movimientos_kardex (planta_id,insumo_id, cantidad, tipo_movimiento_id, precio_unitario, fecha_movimiento, nota) VALUES (:planta_id, :insumo_id, :cantidad, :tipo_movimiento_id, :precio_unitario,:fecha_movimiento, :nota)")
        db.execute(insertarPlantaquery, {"planta_id": id_planta, "insumo_id": id_insumo, "cantidad": cantidad, "tipo_movimiento_id": tipoMovimiento, "precio_unitario": precio_venta, "fecha_movimiento": fechaactual, "nota": nota})

        # Obtener el precio del producto
        kardexId = db.execute(text("SELECT * FROM movimientos_kardex ORDER BY id DESC LIMIT 1")).fetchone()[0]

        insertarInventarioquery = text("INSERT INTO stock (planta_id, insumo_id, cantidad, kardex_id, estado) VALUES (:planta_id, :insumo_id, :cantidad, :kardex_id, :estado)")
        db.execute(insertarInventarioquery, {"planta_id": id_planta, "insumo_id": id_insumo, "cantidad": cantidad, "kardex_id": kardexId, "estado": 'true'})

        db.commit()
        flash(('Se ha actualizado el stock correctamente', 'success'))
        return redirect(url_for("inventario"))
        
    
    return redirect(url_for('inventario'))

@app.route('/configuracion', methods=['GET', 'POST'])
@login_required
@ruta_permitida
def configuracion():
    if request.method == 'GET':
        ObtenerConfiguracion = text('SELECT * FROM configuracion_sistema')
        configuracion = db.execute(ObtenerConfiguracion).fetchone()


        return render_template('configuracion.html', Configuracion = configuracion)
    else:
        nombreSistema = request.form.get('nombre-sistema')
        direccionSistema = request.form.get('direccion-sistema')
        emailSistema = request.form.get('email-sistema')
        telefonoSistema = request.form.get('telefono-sistema')
        numeroRuc = request.form.get('numero-ruc')
        facebookLink = request.form.get('facebook')
        instagramLink = request.form.get('instagram')
        tiktokLink = request.form.get('tiktok')
        whatsapp = request.form.get('whatsApp')

        if not nombreSistema:
            flash(('Ingrese el nombre del sistema', "error"))
            return redirect(url_for("configuracion"))
        if not direccionSistema:
            flash(('Ingrese la direccion del sistema', "error"))
            return redirect(url_for("configuracion"))
        if not emailSistema:
            flash(('Ingrese el correo del sistema', "error"))
            return redirect(url_for("configuracion"))
        if not telefonoSistema:
            flash(('Ingrese el telefono del sistema', "error"))
            return redirect(url_for("configuracion"))
        if not numeroRuc:
            flash(('Ingrese el numero ruc del sistema', "error"))
            return redirect(url_for("configuracion"))
        if not facebookLink:
            flash(('Ingrese el link de facebook del sistema', "error"))
            return redirect(url_for("configuracion"))
        if not instagramLink:
            flash(('Ingrese el link de instagram del sistema', "error"))
            return redirect(url_for("configuracion"))
        if not tiktokLink:
            flash(('Ingrese el link de tiktok del sistema', "error"))
            return redirect(url_for("configuracion"))
        if not whatsapp:
            flash(('Ingrese el link de whatsapp del sistema', "error"))
            return redirect(url_for("configuracion"))
        
        actualizarInfo = text('UPDATE configuracion_sistema SET nombre_empresa=:nombre_empresa, direccion=:direccion, telefono=:telefono, email=:email, "numero_ruc"=:numero_ruc, link_facebook=:link_facebook, link_instagram=:link_instagram, link_tiktok=:link_tiktok, link_whatsapp=:link_whatsapp')
        db.execute(actualizarInfo, {"nombre_empresa":nombreSistema, "direccion":direccionSistema, "telefono":telefonoSistema, "email":emailSistema, "numero_ruc": numeroRuc, "link_facebook": facebookLink, "link_instagram":instagramLink, "link_tiktok": tiktokLink, "link_whatsapp":whatsapp})
        db.commit()
        flash(('Configuracion actualizada con exito', "success"))
        return redirect(url_for("configuracion"))

@app.route("/inventario", methods=["GET", "POST"])
@login_required
@ruta_permitida
def inventario():
    if request.method == "GET":
        producto_id = request.args.get("producto_id")

        mostrarInventario = text("""SELECT 
    COALESCE(p.id, i.id) AS producto_id, 
    COALESCE(p.nombre, i.nombre) AS nombre_producto,
    COALESCE(p.precio_venta, i.precio_venta) AS precio_venta,
    COALESCE(p.imagen_url, i.imagen_url) AS imagen_url,
    inv.cantidad,
    COALESCE(u.unidad_medida, 'N/A') AS unidad_medida
        FROM stock as inv
        LEFT JOIN plantas as p ON p.id = inv.planta_id
        LEFT JOIN insumos as i ON i.id = inv.insumo_id
        LEFT JOIN insumos_unidades AS iu ON iu.insumo_id = i.id
        LEFT JOIN unidades_medidas AS u ON u.id = iu.id 
        INNER JOIN movimientos_kardex as mk ON mk.id = inv.kardex_id""")
        infoInventario = db.execute(mostrarInventario).fetchall()
        
        tiposmovimientosquery = text("""SELECT id, tipo_movimiento from tipo_movimientos WHERE tipo_movimiento = 'Producción'""")
        tiposmovimientos = db.execute(tiposmovimientosquery).fetchall()

        productosquery = text("""
        SELECT p.id, p.nombre, p.precio_venta, 'Planta' AS tipo
        FROM plantas p
        LEFT JOIN stock s ON p.id = s.planta_id
        WHERE s.planta_id IS NULL

        UNION

        SELECT i.id, i.nombre, i.precio_venta, 'Insumo' AS tipo
        FROM insumos i
        LEFT JOIN stock s ON i.id = s.insumo_id
        WHERE s.insumo_id IS NULL
        """)
        productossinagregar = db.execute(productosquery).fetchall()

        return render_template("inventario.html", infoInventario=infoInventario,movimientos=tiposmovimientos, productossinagregar=productossinagregar)

@app.route('/logout')
def logout():
    # Limpiar todos los datos de sesión
    session.clear()
    return redirect('/') 


@app.route('/reportes/mayores-ventas', methods=['GET'])
@login_required
def mayores_ventas():
    # Asegúrate de que Ventas sea la tabla base
    ventas = db.query(
        func.coalesce(Plantas.nombre, Insumos.nombre).label('producto'),
        func.sum(Detalle_ventas.cantidad).label('total_cantidad'),
        func.sum(Detalle_ventas.subtotal).label('total_precio')
    ).select_from(Ventas) \
     .join(Detalle_ventas, Detalle_ventas.venta_id == Ventas.id) \
     .outerjoin(Plantas, Detalle_ventas.planta_id == Plantas.id) \
     .outerjoin(Insumos, Detalle_ventas.insumo_id == Insumos.id) \
     .group_by(func.coalesce(Plantas.nombre, Insumos.nombre)) \
     .order_by(func.sum(Detalle_ventas.subtotal).desc()) \
     .limit(10).all()

    # Construir el JSON
    reporte = []
    for venta in ventas:
        reporte.append({
            "producto": venta.producto,
            "total_cantidad": venta.total_cantidad,
            "total_precio": venta.total_precio
        })

    return jsonify(reporte)


@app.route('/reportes/ventas-por-mes', methods=['GET'])
@login_required
def ventas_por_mes():
    # Crear la lista de meses (1-12)
    meses = list(range(1, 13))

    # Consultar las ventas agrupadas por mes
    ventas = db.query(
        func.extract('month', Ventas.fecha_venta).label('mes'),
        func.sum(Ventas.total).label('total_ventas')
    ).group_by(func.extract('month', Ventas.fecha_venta)).all()

    # Convertir los resultados en un diccionario {mes: total_ventas}
    ventas_dict = {int(mes): total for mes, total in ventas}

    # Crear la respuesta con todos los meses, rellenando con 0 si no hay ventas
    reporte = []
    for mes in meses:
        reporte.append({
            "mes": mes,
            "total_ventas": ventas_dict.get(mes, 0)  # Si el mes no tiene datos, usa 0
        })

    return jsonify(reporte)


@app.route('/reportes/ventas-por-insumos', methods=['GET'])
@login_required
def ventas_por_insumos():
    # Consultar las ventas agrupadas por insumos
    ventas = db.query(
        Insumos.nombre.label('insumo'),
        func.sum(Detalle_ventas.subtotal).label('total_ventas')
    ).join(Detalle_ventas, Detalle_ventas.insumo_id == Insumos.id) \
     .join(Ventas, Ventas.id == Detalle_ventas.venta_id) \
     .group_by(Insumos.nombre) \
     .order_by(func.sum(Detalle_ventas.subtotal).desc()) \
     .all()

    # Crear la respuesta JSON
    reporte = [{"insumo": venta.insumo, "total_ventas": venta.total_ventas} for venta in ventas]

    return jsonify(reporte)

@app.route('/reportes/tendencia-ventas-diarias', methods=['GET'])
@login_required
def tendencia_ventas_diarias():
    # Calcular la fecha de inicio y fin de la semana actual
    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())  # Lunes de la semana actual
    end_of_week = start_of_week + timedelta(days=6)         # Domingo de la semana actual

    # Consultar las ventas agrupadas por día dentro de la semana actual
    ventas = db.query(
        func.date(Ventas.fecha_venta).label('dia'),
        func.sum(Ventas.total).label('total_ventas')
    ).filter(Ventas.fecha_venta >= start_of_week, Ventas.fecha_venta <= end_of_week) \
     .group_by(func.date(Ventas.fecha_venta)) \
     .order_by(func.date(Ventas.fecha_venta)) \
     .all()

    # Crear la respuesta JSON
    reporte = [{"dia": venta.dia.strftime('%Y-%m-%d'), "total_ventas": venta.total_ventas} for venta in ventas]

    return jsonify(reporte)
    
@app.route('/reportes/resumen-diario', methods=['GET'])
@login_required
def resumen_diario():
    # Calcular la fecha de inicio y fin de la semana actual
    today = datetime.now()
    start_of_week = today - timedelta(days=today.weekday())  # Lunes de la semana actual
    end_of_week = start_of_week + timedelta(days=6)         # Domingo de la semana actual

    # Subconsulta para ingresos por tipo de pago (efectivo y tarjeta)
    ingresos_por_tipo = db.query(
        func.date(Ventas.fecha_venta).label('dia'),
        tipos_pagos.tipo_pago.label('tipo_pago'),
        func.sum(Ventas.total).label('total_ingreso')
    ).join(tipos_pagos, Ventas.id_tipo_pago == tipos_pagos.id) \
     .filter(Ventas.fecha_venta >= start_of_week, Ventas.fecha_venta <= end_of_week) \
     .group_by(func.date(Ventas.fecha_venta), tipos_pagos.tipo_pago)

    # Subconsulta para gastos diarios
    gastos_diarios = db.query(
        func.date(Gastos.fecha).label('dia'),
        func.sum(Gastos.monto).label('total_gastos')
    ).filter(Gastos.fecha >= start_of_week, Gastos.fecha <= end_of_week) \
     .group_by(func.date(Gastos.fecha))

    # Combinar resultados en una estructura
    ingresos = ingresos_por_tipo.all()
    gastos = gastos_diarios.all()

    # Crear un diccionario para organizar los resultados
    reporte = {}
    for ingreso in ingresos:
        dia = ingreso.dia.strftime('%Y-%m-%d')
        if dia not in reporte:
            reporte[dia] = {"efectivo": 0, "tarjeta": 0, "gastos": 0}
        if ingreso.tipo_pago.lower() == "efectivo":
            reporte[dia]["efectivo"] += ingreso.total_ingreso
        elif ingreso.tipo_pago.lower() == "tarjeta":
            reporte[dia]["tarjeta"] += ingreso.total_ingreso

    for gasto in gastos:
        dia = gasto.dia.strftime('%Y-%m-%d')
        if dia not in reporte:
            reporte[dia] = {"efectivo": 0, "tarjeta": 0, "gastos": 0}
        reporte[dia]["gastos"] += gasto.total_gastos

    # Convertir el reporte a una lista ordenada por día
    reporte_ordenado = [
        {"dia": dia, "efectivo": valores["efectivo"], "tarjeta": valores["tarjeta"], "gastos": valores["gastos"]}
        for dia, valores in sorted(reporte.items())
    ]

    return jsonify(reporte_ordenado)



@app.route('/Reportes/Ventas', methods=['GET', 'POST'])
@login_required
def reportes_ventas():
    return render_template("reportes_ventas.html")


@app.route('/listaDAdmin', methods=['GET'])
@login_required
def lista_dadmin():
    #selecciona la lista de deseo por usuarios
    lista_deseo_query = text("""SELECT DISTINCT u.id, u.nombre_completo, u.correo, l.fecha
FROM usuarios AS u
INNER JOIN listas_deseo AS l ON u.id = l.usuario_id;
""")
    lista_deseo = db.execute(lista_deseo_query).fetchall()

    #modal ventas info
    ObtenerSubcat = text("SELECT * FROM subcategorias")
    # ObtenerVentas = text("SELECT id, nombre_cliente AS nombre, fecha_venta AS fecha, total, nota, estado FROM ventas")
    obtenerTiposPago = text("SELECT * FROM tipos_pagos")
    obtenerTipoCliente = text("SELECT * FROM cliente_categoria")
    obtenerColores = text("SELECT * FROM colores")
    obtenerMedidas = text("SELECT * FROM medidas")
    ObtenerUnidades = text('SELECT * FROM unidades_medidas')
    unidades = db.execute(ObtenerUnidades).fetchall()

    tipoCliente = db.execute(obtenerTipoCliente).fetchall()
    colores = db.execute(obtenerColores).fetchall()
    medidas = db.execute(obtenerMedidas).fetchall()
    tiposPago = db.execute(obtenerTiposPago).fetchall()
    infoSubcat = db.execute(ObtenerSubcat).fetchall()
    # infoVentas = db.execute(ObtenerVentas).fetchall()
    return render_template("listaDAdmin.html", Lista_deseo = lista_deseo, infoSubcat = infoSubcat, tipospago = tiposPago, colores = colores, medidas = medidas, tipocliente = tipoCliente, unidades=unidades)

@app.route('/verDetallesListaDeseo', methods=['POST'])
@login_required
def verDetallesListaDeseo():
    data = request.get_json()
    idListaDeseo = data.get('id_anular')
    detalleListaDeseo = text("""
        SELECT 
            l.lista_deseo_id, 
			COALESCE(p.id, i.id) AS producto_id, 
            COALESCE(p.nombre, i.nombre) AS producto_nombre, 
            COALESCE(p.precio_venta, i.precio_venta) AS precio_venta,
            u.nombre_completo AS usuario_nombre,
            u.correo AS correo,
			CASE
                WHEN p.id IS NOT NULL THEN 'planta'
                WHEN i.id IS NOT NULL THEN 'insumo'
            END AS tipo_producto
        FROM 
            listas_deseo AS l
        INNER JOIN 
            usuarios AS u ON l.usuario_id = u.id
        LEFT JOIN 
            plantas AS p ON l.planta_id = p.id
        LEFT JOIN 
            insumos AS i ON l.insumo_id = i.id
        WHERE 
            u.id = :id
    """)
    detalleListaDeseo = db.execute(detalleListaDeseo, {"id": idListaDeseo}).fetchall()

   # Convertir los resultados en una lista de diccionarios
    if detalleListaDeseo:
        detalles = []
        for row in detalleListaDeseo:
            detalles.append({
                "producto_id": row.producto_id,
                "tipo_producto": row.tipo_producto,
                "lista_deseo_id": row.lista_deseo_id,
                "producto_nombre": row.producto_nombre,
                "correo": row.correo,
                "precio_venta": row.precio_venta,
                "usuario_nombre": row.usuario_nombre
            })

        return jsonify(detalles)
    else:
        return jsonify({"error": "No se encontró la lista de deseos"}), 404
    

    
@app.route('/gastos', methods=['GET', 'POST'])
@login_required
def gastos():
    if request.method == 'GET':
        obtenerGastos = text("SELECT * FROM gastos")
        gastos = db.execute(obtenerGastos).fetchall()
        return render_template('gastos.html', gastos=gastos)
    else:
        monto = request.form.get('monto')
        descripcion = request.form.get('descripcion')
        fecha = datetime.now()

        insertarGasto = text("INSERT INTO gastos (monto, fecha, descripcion) VALUES (:monto, :fecha, :descripcion)")
        db.execute(insertarGasto, {"monto": monto, "fecha": fecha, "descripcion": descripcion})
        db.commit()
        db.close()
        flash(('Producto agregado a la lista de deseos!', 'success', '¡Exito!'))
        return redirect(url_for('gastos'))


@app.route("/inicio_catalogo", methods=["GET", "POST"])
def inicio_catalogo():
    return render_template("inicio_catalogo.html")

@app.route('/reportes_compras')
def reportes_compras():
    return render_template('reportes_compras.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
 
 