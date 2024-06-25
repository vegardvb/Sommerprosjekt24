from fastapi import Depends, FastAPI
from sqlalchemy.orm import Session
from crud import get_cable_measurement
import models

from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

db = SessionLocal()

# # Dependency
# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()


@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/cable_measurements/{cable_measurement_id}")
def get_measurement(cable_measurement_id: int):
    cables = get_cable_measurement(db, cable_measurement_id)
    return cables
