import os

from flask import Flask, jsonify, render_template, redirect, request, session
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

        if not categoria:
            return("Ingrese la categoria")
    
        if not descripcionCategoria:
            return("Ingrese una descripcion")
        
        
        else:
            obtenerCat = text("SELECT * FROM categorias WHERE categoria=:categoria")

            if db.execute(obtenerCat, {'categoria': categoria}).rowcount > 0:
                return ("La categoria ya existe")
            else:
                agregarCategoria = text("INSERT INTO categorias (categoria, descripcion) VALUES (:categoria, :descripcion)")
                db.execute(agregarCategoria, {"categoria": categoria, "descripcion": descripcionCategoria})
                
                db.commit()
            return redirect(f"/categorias")
        
@app.route('/editarCategoria', methods=["POST"])
def editarCategoria():
    categoria = request.form.get('nombre_editar')
    descripcion = request.form.get('descripcion_editar')
    idCategoria = request.form.get('id_editar')
    print(categoria)
    print(descripcion)
    print(idCategoria)

    if not idCategoria:
        return("No esta recibiendo valores")
    if not categoria:
        return("Ingrese la categoria")
    
    if not descripcion:
        return("Ingrese una descripcion")
    
    else:
        obtenerCat = text("SELECT categoria FROM categorias WHERE id=:id")

        if db.execute(obtenerCat, {'id': idCategoria}).rowcount > 0:
            editarCategoria = text("UPDATE categorias SET categoria=:categoria, descripcion=:descripcion WHERE id =:id")
            db.execute(editarCategoria, {"id":idCategoria, "categoria":categoria, "descripcion":descripcion})
            db.commit()
        else:
            return ("La categoria no existe")

    return redirect(f"/categorias")

@app.route('/eliminarCategoria', methods=["GET", "POST"])
def eliminarCategoria():
    idCategoria = request.form.get('id_eliminar')
    print(idCategoria)

    query = text("DELETE FROM categorias WHERE id = :id")
    db.execute(query, {"id": idCategoria})
    db.commit()
    return redirect(f"/categorias")


@app.route('/usuarios', methods =["GET","POST"])
def usuarios():
    if request.method == "GET":
        obtenerUsuarios = text("SELECT * FROM usuarios as u INNER JOIN roles as r ON r.id = u.rol_id WHERE u.rol_id = 1 OR u.rol_id = 2 ")
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
            return "usuario ya existe"
        else:
            insertar_usuario = text("INSERT INTO usuarios (nombre_completo, correo, clave, rol_id) VALUES (:userName, :userEmail, :userPassword, :idRol)")
            db.execute(insertar_usuario,{"userName":nombre_completo, "userEmail":correo, "userPassword": hashed_contraseña, "idRol":rol_id})
            db.commit()
            db.close()
            return redirect("/usuarios")     


@app.route('/eliminarUsuarios', methods=["GET", "POST"])
def eliminarUsuarios():
    idUsuario = request.form.get('id_usuario')
    print(idUsuario)

    query = text("DELETE FROM usuarios WHERE id = :id")
    db.execute(query, {"id": idUsuario})
    db.commit()
    return redirect(f"/usuarios")


    
@app.route("/inicioAdmin", methods=["GET", "POST"])
def inicio():
    return render_template("inicio_admin.html")

@app.route("/subCategorias", methods=["GET", "POST"])
def subCategorias():
    if request.method == "GET":
        obtenerCategorias = text("SELECT * FROM categorias order by id asc")
        rows = db.execute(obtenerCategorias).fetchall()

        obtenerSubcategorias = text("SELECT subcategorias.id AS id, categorias.categoria AS categoria, subcategorias.subcategoria AS subcategoria, subcategorias.descripcion AS descripcion FROM subcategorias JOIN categorias ON subcategorias.categoria_id = categorias.id")
        rows2 = db.execute(obtenerSubcategorias).fetchall()
        return render_template("subcategorias.html", categorias=rows, subcategorias=rows2)
    else:
        nombreSub = request.form.get('nombreSub')
        descripcion = request.form.get('descripcion')
        idCat = request.form.get('idCat')

        obtenerSub = text("SELECT * FROM subcategorias WHERE subcategoria=:subcategoria")
        if db.execute(obtenerSub, {'subcategoria': nombreSub}).rowcount > 0:
            return ("subcategoria ya existe")
        else:
            insertarSub = text("INSERT INTO subcategorias (categoria_id, subcategoria, descripcion) VALUES (:categoria_id, :subcategoria, :descripcion)")
            db.execute(insertarSub, {"categoria_id": idCat, "subcategoria": nombreSub, "descripcion": descripcion})

            db.commit()
        return redirect(f"/subCategorias")
    
@app.route('/eliminarSubcategoria', methods=["GET", "POST"])
def eliminarSubcategoria():
    idSubcategoria = request.form.get('id_eliminar')

    query = text("DELETE FROM subcategorias WHERE id = :id")
    db.execute(query, {"id": idSubcategoria})
    db.commit()
    return redirect(f"/subCategorias")

@app.route('/editarSubcategoria', methods=["POST"])
def editarSubcategoria():
    subcategoria = request.form.get('nombreSub_editar')
    categoria = request.form.get('nombreCat_editar')
    descripcion = request.form.get('descripcion_editar')
    idSubcategoria = request.form.get('id_editar')
    print(categoria)
    print(subcategoria)
    print(descripcion)
    print(idSubcategoria)

    if not idSubcategoria:
        return("No esta recibiendo valores")
    if not subcategoria:
        return("Ingrese la subcategoria")
    if not categoria:
        return("Ingrese la categoria")
    if not descripcion:
        return("Ingrese una descripcion")
    
    else:
        obtenerSubcat = text("SELECT subcategoria FROM subcategorias WHERE id=:id")

        if db.execute(obtenerSubcat, {'id': idSubcategoria}).rowcount > 0:
            editarCategoria = text("UPDATE categorias SET categoria=:categoria, descripcion=:descripcion WHERE id =:id")
            db.execute(editarCategoria, {"id":idSubcategoria, "categoria":categoria, "descripcion":descripcion})
            db.commit()
        else:
            return ("La categoria no existe")

    return redirect(f"/subCategorias")

@app.route('/catalogo')
def catalogo():
    return render_template('catalogo.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
 
 