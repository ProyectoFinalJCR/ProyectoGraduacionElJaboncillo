import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from models import *
from dotenv import load_dotenv

load_dotenv()

app=Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"]=os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATION"]=False

db.init_app (app)

def main():
    print(db)
    db.create_all()

if __name__ == "__main__":
    with app.app_context():
        main()  