from fastapi import FastAPI
from database import db
from queries import *

# FastAPI instance
app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/cable_measurements/{cable_measurement_id}")
def get_measurement(cable_measurement_id: int):
    result = query_cable_measurements(db, cable_measurement_id)

    for row in result:
        print(f"{row} | Type: {type(row)} ")

    return result


@app.get("/inqueries/")
def get_inquieries():

    attributes = [
        "id, navn, gateadresse, status, kommune_id , post_sted_id, organiasjons_id, behandlingsfrist"
    ]

    result = query_inquieries(db)
    result = {k: result[k] for k in attributes}

    for row in result:
        print(f"{row} | Type: {type(row)} ")

    return result
