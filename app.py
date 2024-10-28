import os

from flask import Flask, jsonify, render_template, redirect, request, session, flash, url_for
from flask_session import Session
from sqlalchemy import create_engine, text
from sqlalchemy.orm import scoped_session, sessionmaker
from werkzeug.security import check_password_hash, generate_password_hash
from dotenv import load_dotenv
from functools import wraps

load_dotenv()

app = Flask(__name__)


# Configure session to use filesystem
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

#Set up database
engine = create_engine(os.getenv("DATABASE_URL"))
db = scoped_session(sessionmaker(bind=engine))


@app.route('/')
def index():
    return render_template('index.html')


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
                session["user_rol"] = selected_user[6]

                print(session["user_rol"])
                print(session["rol_id"])
                #verifica el rol del usuario para redirigirlo a su vista correspondiente
                if session["user_rol"] == 'CLIENTE':
                    return jsonify({"success": True, "redirect":"/catalogo"}), 200
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

            return redirect("/catalogo")

@app.route('/categorias', methods=["GET", "POST"])
def categorias():
    if request.method == "GET":
        obtenerCategorias = text("SELECT * FROM categorias order by id asc")
        rows = db.execute(obtenerCategorias).fetchall()

        return render_template('categorias.html', categorias=rows)
    
    else:
        categoria = request.form.get('nombre')
        descripcionCategoria = request.form.get('descripcion')

        obtenerCat = text("SELECT * FROM categorias WHERE categoria=:categoria")
        if db.execute(obtenerCat, {'categoria': categoria}).rowcount > 0:
            flash(('Ya existe una categoria con ese nombre', 'error', '¡Error!'))
            return redirect(url_for('categorias'))
        else:
            agregarCategoria = text("INSERT INTO categorias (categoria, descripcion) VALUES (:categoria, :descripcion)")
            db.execute(agregarCategoria, {"categoria": categoria, "descripcion": descripcionCategoria})
            
            db.commit()
        flash(('La categoria ha sido agregada con éxito.', 'success', '¡Éxito!'))
        return redirect(url_for('categorias'))
        
@app.route('/editarCategoria', methods=["POST"])
def editarCategoria():
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
        else:
            flash("Ha ocurrido un error", 'error', '¡Error!')
            return redirect(url_for('categorias'))

    flash(('La categoría ha sido editada con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('categorias'))

@app.route('/eliminarCategoria', methods=["GET", "POST"])
def eliminarCategoria():
    idCategoria = request.form.get('id_eliminar')
    query = text("SELECT COUNT(*) FROM subcategorias WHERE categoria_id = :categoria_id")
    resultado = db.execute(query, {'categoria_id': idCategoria}).scalar()

    if resultado > 0:
        flash(('No se puede eliminar la categoría porque tiene subcategorías asociadas.', 'error'))
        return redirect(url_for('categorias'))

    query = text("DELETE FROM categorias WHERE id = :id")
    db.execute(query, {"id": idCategoria})
    db.commit()
    flash(('La categoria ha sido eliminada con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('categorias'))


@app.route('/usuarios', methods =["GET","POST"])
def usuarios():
    if request.method == "GET":
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
        
        obtenerUser = text("SELECT * FROM usuarios WHERE correo =:correo")

        if db.execute(obtenerUser, {'correo': correo}).rowcount > 0:
            flash(('Ya existe un usuario con este correo', 'error', '¡Error!'))
            return redirect(url_for('usuarios'))
        else:
            insertar_usuario = text("INSERT INTO usuarios (nombre_completo, correo, clave, rol_id) VALUES (:userName, :userEmail, :userPassword, :idRol)")
            db.execute(insertar_usuario,{"userName":nombre_completo, "userEmail":correo, "userPassword": hashed_contraseña, "idRol":rol_id})
            db.commit()
            db.close()
            flash(('Usuario agregado con éxito.', 'success', '¡Éxito!'))
            return redirect("/usuarios")     


@app.route('/eliminarUsuarios', methods=["GET", "POST"])
def eliminarUsuarios():
    idUsuario = request.form.get('id_usuario')
    print(idUsuario)

    query = text("DELETE FROM usuarios WHERE id = :id")
    db.execute(query, {"id": idUsuario})
    db.commit()
    flash(('El usuario ha sido eliminado con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('usuarios'))

@app.route('/editarUsuario', methods=["POST"])
def editarUsuario():
    if request.method == "POST":
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
            else:
                flash("Ha ocurrido un error", 'error', '¡Error!')
                return redirect(url_for('usuarios'))

        
        flash(('Los datos han sido editados con éxito.', 'success', '¡Éxito!'))
        return redirect(url_for('usuarios'))

    
@app.route("/inicioAdmin", methods=["GET", "POST"])
def inicio():
    return render_template("inicio_admin.html")

@app.route("/subCategorias", methods=["GET", "POST"])
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
def eliminarSubcategoria():
    idSubcategoria = request.form.get('id_eliminar')

    query = text("DELETE FROM subcategorias WHERE id = :id")
    db.execute(query, {"id": idSubcategoria})
    db.commit()
    flash(('La subcategoría ha sido eliminada con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('subCategorias'))

@app.route('/editarSubcategoria', methods=["POST"])
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
        else:
            flash("Ha ocurrido un error", 'error', '¡Error!')
            return redirect(url_for('subCategorias'))

    flash(('La subcategoría ha sido editada con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('subCategorias'))

@app.route('/insumos', methods=["GET", "POST"])
def insumos():
    if request.method == "GET":
        obtenerComposicion = text("SELECT * FROM composiciones_principales")
        composicionP = db.execute(obtenerComposicion).fetchall()

        obtenerTipoInsumo = text("SELECT * FROM aplicaciones")
        tiposInsumo = db.execute(obtenerTipoInsumo).fetchall()
        
        obtenerSubcat = text("SELECT * FROM subcategorias")
        subcat = db.execute(obtenerSubcat).fetchall()
        #muestra la información de los insumos
        MostrarInsumos = text("SELECT i.id, i.nombre, i.tipo_insumo, i.descripcion, cp.composicion, i.frecuencia_aplicacion, i.compatibilidad, i.precauciones, sub.subcategoria FROM insumos i INNER JOIN insumos_subcategoria s ON i.id = s.insumo_id INNER JOIN subcategorias sub ON sub.id = s.subcategoria_id INNER JOIN composiciones_principales cp ON i.composicion_principal_id = cp.id")

        Insumos = db.execute(MostrarInsumos).fetchall()
        return render_template('insumos.html', Composicionp=composicionP, TiposInsumo = tiposInsumo, Subcat = subcat, insumos=Insumos)
    else:
        insumo = request.form.get('nombre_insumo')
        tipoInsumo = request.form.get('idtipoInsumo')
        descripcionInsumo = request.form.get('descripcion_insumo')
        subcatInsumo = request.form.get('idsubcat')
        composicionInsumo = request.form.get('idComposicionP')
        frecuenciaInsumo = request.form.get('frecuenciaAplicacion_insumo')
        compatibilidadInsumo = request.form.get('compatibilidad')
        precaucionesInsumo = request.form.get('precauciones')

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
        
        obtenerInsumo = text("SELECT * FROM insumos WHERE nombre=:insumo")
        if db.execute(obtenerInsumo, {'insumo': insumo}).rowcount > 0:
            flash(('Ya existe un insumo con ese nombre', 'error', '¡Error!'))
            return redirect(url_for('insumos'))
        else:
            insertarInsumo = text("INSERT INTO insumos (nombre, tipo_insumo, descripcion, composicion_principal_id, frecuencia_aplicacion, durabilidad, condiciones_almacenamiento_id, compatibilidad, precauciones) VALUES (:insumo, :tipoInsumo, :descripcionInsumo, :composicionInsumo, :frecuenciaInsumo, :durabilidadInsumo,:codiciones_almacenamiento_id ,:compatibilidadInsumo, :precaucionesInsumo)")
            db.execute(insertarInsumo, {"insumo": insumo, "tipoInsumo": tipoInsumo, "descripcionInsumo": descripcionInsumo, "composicionInsumo": composicionInsumo, "frecuenciaInsumo": frecuenciaInsumo, "compatibilidadInsumo": compatibilidadInsumo, "precaucionesInsumo": precaucionesInsumo})

            selectInsumoId = text("SELECT id FROM insumos WHERE nombre=:insumo")
            insumoId = db.execute(selectInsumoId, {'insumo': insumo}).fetchone()

            insertSubcatInsumo = text("INSERT INTO insumos_subcategoria (subcategoria_id, insumo_id) VALUES (:subcatInsumo, :insumoId)")
            db.execute(insertSubcatInsumo, {"subcatInsumo": subcatInsumo, "insumoId": insumoId[0]})

            db.commit()
        flash(('El insumo ha sido agregado con éxito.', 'success', '¡Éxito!'))
        return redirect(url_for('insumos'))



@app.route('/eliminarInsumo', methods=["GET", "POST"])
def eliminarInsumos():
    idInsumo = request.form.get('id_insumo')

    queryEliminarInsumo = text("DELETE FROM insumos_subcategoria WHERE insumo_id = :idInsumo")
    db.execute(queryEliminarInsumo, {"idInsumo": idInsumo})
    
    query = text("DELETE FROM insumos WHERE id = :id")
    db.execute(query, {"id": idInsumo})
    db.commit()
    flash(('El insumo se ha sido eliminado con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('insumos'))

@app.route('/editarinsumo', methods=["POST"])
def editarinsumo():
    if request.method == "POST":
       
       insumo_editar = request.form.get('insumo_editar')
       tipoInsumo_editar = request.form.get('idtipoInsumo_editar')
       descripcionInsumo_editar = request.form.get('descripcion_insumo_editar')
       subcatInsumo_editar = request.form.get('idsubcat_editar')
       composicionInsumo_editar = request.form.get('idComposicionP_editar')
       frecuenciaInsumo_editar = request.form.get('frecuenciaAplicacion_insumo_editar')
       aplicacionideal_editar = request.form.get("idaplicaIdeal_editar")
       durabilidadInsumo_editar = request.form.get('durabilidad_editar')
       compatibilidadInsumo_editar = request.form.get('compatibilidad_editar')
       precaucionesInsumo_editar = request.form.get('precauciones_editar')

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
       
       # VALIDANDO SI HAY UN insumo CON ESE NOMBRE
       obtenerInsumo = text("SELECT * FROM insumos WHERE nombre=:insumo")
       if db.execute(obtenerInsumo,{'insumo': insumo_editar}).rowcount > 0:
           flash(('Ya existe un insumo con ese nombre', 'error', '¡Error!'))
           return redirect(url_for('insumos'))
       else:
           # VALIDANDO SI EXISTE UN INSUMO CON ESE ID
           obtenerInsumo = text("SELECT nombre FROM insumos WHERE nombre=:nombre")
           if db.execute(obtenerInsumo, {'nombre': insumo_editar}).rowcount > 0:
               editarInsumo = text("UPDATE insumos SET nombre=:nombre, tipo_insumo=:tipoInsumo, descripcion=:descripcion, composicion_principal_id=:composicionInsumo, frecuencia_aplicacion=:frecuenciaInsumo, durabilidad=:durabilidadInsumo, condiciones_almacenamiento_id=:codiciones_almacenamiento_id, compatibilidad=:compatibilidadInsumo, precauciones=:precauciones WHERE id =:id")

               db.execute(editarInsumo, {"nombre":insumo_editar, "tipoInsumo":tipoInsumo_editar, "descripcion":descripcionInsumo_editar, "composicionInsumo":composicionInsumo_editar, "frecuenciaInsumo":frecuenciaInsumo_editar, "durabilidadInsumo":durabilidadInsumo_editar,"codiciones_almacenamiento_id": aplicacionideal_editar, "compatibilidadInsumo": compatibilidadInsumo_editar, "precaucionesInsumo": precaucionesInsumo_editar})
               db.commit()
           else:
               flash("Ha ocurrido un error", 'error', '¡Error!')
               return redirect(url_for('insumos'))

       
       flash(('Los datos han sido editados con éxito.', 'success', '¡Éxito!'))
       return redirect(url_for('insumos'))

@app.route('/plantas', methods=["GET", "POST"])
def plantas():
    if request.method == "GET":
        obtenerColores = text("SELECT * FROM colores")
        colores = db.execute(obtenerColores).fetchall()

        obtenerSubcategorias = text("SELECT * FROM subcategorias")
        subcategorias = db.execute(obtenerSubcategorias).fetchall()

        obtenerRangos = text("SELECT * FROM rangos")
        rangos = db.execute(obtenerRangos).fetchall()

        obtenerEntornos = text("SELECT * FROM entornos_ideales")
        entornos = db.execute(obtenerEntornos).fetchall()

        obtenerAgua = text("SELECT * FROM requerimientos_agua")
        agua = db.execute(obtenerAgua).fetchall()

        obtenerTipoSuelo = text("SELECT * FROM tipos_suelos")
        suelos = db.execute(obtenerTipoSuelo).fetchall()

        obtenerTemporada = text("SELECT * FROM temporadas_plantacion")
        temporada = db.execute(obtenerTemporada).fetchall()

        obtenerInfo = text("""
        SELECT plantas.id AS id, 
               plantas.nombre AS nombre, 
               plantas.descripcion AS descripcion, 
               subcategorias.subcategoria AS subcategoria, 
               colores.color AS color, 
               rangos.rango AS rango, 
               entornos_ideales.entorno AS entorno, 
               requerimientos_agua.requerimiento_agua AS agua, 
               tipos_suelos.tipo_suelo AS suelo, 
               temporadas_plantacion.temporada AS temporada  
        FROM plantas
        JOIN plantas_subcategoria ON plantas.id = plantas_subcategoria.planta_id
        JOIN subcategorias ON plantas_subcategoria.subcategoria_id = subcategorias.id
        JOIN colores_plantas ON plantas.id = colores_plantas.planta_id
        JOIN colores ON colores_plantas.color_id = colores.id
        JOIN rangos_medidas ON plantas.id = rangos_medidas.planta_id
        JOIN rangos ON rangos_medidas.rango_id = rangos.id
        JOIN entornos_ideales ON plantas.entorno_ideal_id = entornos_ideales.id
        JOIN requerimientos_agua ON plantas.requerimiento_agua_id = requerimientos_agua.id
        JOIN tipos_suelos ON plantas.tipo_suelo_id = tipos_suelos.id
        JOIN temporadas_plantacion ON plantas.temporada_plantacion_id = temporadas_plantacion.id
    """)
        infoPlantas = db.execute(obtenerInfo).fetchall()

        return render_template('plantas.html', InfoPlanta = infoPlantas, Colores = colores, Subcategorias = subcategorias, Rangos = rangos, Entornos = entornos, Agua = agua, Suelos = suelos, Temporada = temporada)
    else:
        nombrePlanta = request.form.get('nombrePlanta')
        descripcion = request.form.get('descripcion')
        color = request.form.get('idColor')
        subcategoria = request.form.get('idSub')
        rango = request.form.get('idRango')
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
        if not color:
            flash(('Seleccione el color', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
        if not subcategoria:
            flash(('Seleccione la subcategoria', 'error', '¡Error!'))
            return redirect(url_for('plantas'))
        if not rango:
            flash(('Seleccione el rango', 'error', '¡Error!'))
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
            insertarPlanta = text("INSERT INTO plantas (nombre, descripcion, entorno_ideal_id, requerimiento_agua_id, tipo_suelo_id, temporada_plantacion_id) VALUES (:nombre, :descripcion, :entorno_ideal_id, :requerimiento_agua_id, :tipo_suelo_id, :temporada_plantacion_id)")
            db.execute(insertarPlanta, {'nombre': nombrePlanta, 'descripcion': descripcion, 'entorno_ideal_id':entorno, 'requerimiento_agua_id': agua, 'tipo_suelo_id': suelo, 'temporada_plantacion_id': temporada})

            plantaId = db.execute(text("SELECT * FROM plantas ORDER BY id DESC LIMIT 1")).fetchone()[0]

            insertarPlantasSub = text("INSERT INTO plantas_subcategoria (subcategoria_id, planta_id) VALUES (:subcategoria_id, :planta_id)")
            db.execute(insertarPlantasSub, {'subcategoria_id': subcategoria, 'planta_id': plantaId})

            insertarColores = text("INSERT INTO colores_plantas (color_id, planta_id) VALUES (:color_id, :planta_id)")
            db.execute(insertarColores, {'color_id': color, 'planta_id': plantaId})

            insertarRangos = text("INSERT INTO rangos_medidas (rango_id, planta_id) VALUES (:rango_id, :planta_id)")
            db.execute(insertarRangos, {'rango_id': rango, 'planta_id': plantaId})

            db.commit()
        flash(('La planta se ha agregado correctamente', 'success', '¡Exito!'))
        return redirect(url_for('plantas'))

@app.route('/eliminarPlanta', methods=["POST"])
def eliminarPlanta():
    idPlanta = request.form.get('id_eliminar')

    eliminarPlantaSub = text("DELETE FROM plantas_subcategoria WHERE planta_id = :planta_id")
    db.execute(eliminarPlantaSub, {"planta_id": idPlanta})

    eliminarPlantaColor = text("DELETE FROM colores_plantas WHERE planta_id = :planta_id")
    db.execute(eliminarPlantaColor, {"planta_id": idPlanta})

    eliminarPlantaRango = text("DELETE FROM rangos_medidas WHERE planta_id = :planta_id")
    db.execute(eliminarPlantaRango, {"planta_id": idPlanta})
    
    eliminarPlanta = text("DELETE FROM plantas WHERE id = :id")
    db.execute(eliminarPlanta, {"id": idPlanta})
    db.commit()
    flash(('La planta se ha sido eliminado con éxito.', 'success', '¡Éxito!'))
    return redirect(url_for('plantas'))   


@app.route('/catalogo')
def catalogo():
    return render_template('catalogo.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
 
 