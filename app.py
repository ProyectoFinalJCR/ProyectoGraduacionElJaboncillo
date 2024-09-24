import os

from flask import Flask, render_template, redirect, request
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
        userEmail = request.form.get('userEmail')
        userPassword = request.form.get('userPassword')


@app.route('/register', methods=["GET", "POST"])
def registrarse():
    if request.method == "GET":
        return render_template('registrarse.html')
    else:
        userName = request.form.get('userName')
        userEmail = request.form.get('email')
        userPassword = request.form.get('password')
        userConfirmPassword = request.form.get('confirm_password')

        if not userName:
            return render_template("registrarse.html", error_msg = "El nombre de usuario es requerido")
        elif not userEmail:
            return render_template("registrarse.html", error_msg = "El correo electrónico es requerido")
        elif not userPassword:
            return render_template("registrarse.html", error_msg = "Campo contraseña es requerido")
        elif not userConfirmPassword:
            return render_template("registrarse.html", error_msg = "Campo confirmar la contraseña es requerido")
        elif userPassword != userConfirmPassword:
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
            return redirect("/")

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

# @app.route('/layout')
# def layout():
#     return render_template('layout.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
 
 