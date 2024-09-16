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


@app.route('/')
def index():
    return render_template('iniciar_sesion.html')

@app.route('/layout')
def plantilla():
    return render_template('layout.html')

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
 
 