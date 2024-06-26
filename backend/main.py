from fastapi import FastAPI
from database import db
from queries import *

DEBUG = False

# FastAPI instance
app = FastAPI()


@app.get("/")
def read_root():
    """Home endpoint for the FastAPI application.

    Returns:
        String : A greeting.
    """
    return {"Hello": "World"}


@app.get("/cable_measurements/{cable_measurement_id}")
def get_measurement_by_cable_measurement_id(cable_measurement_id: int):
    """Endpoint which returns a cable measurement by its given id.

    **Args**:
        cable_measurement_id (int): The id of the cable measurement to query.
        DEBUG (bool, optional): Boolean to apply debugging statements. Defaults to False.

    **Returns**:
        Dictonary: A dictonary containing the cable measurements and its attribuites from the database.
    """
    result = query_cable_measurements(db, cable_measurement_id)

    if DEBUG:
        for row in result:
            print(f"{row} | Type: {type(row)} ")

    return result


@app.get("/inquiery")
def get_inquieries():
    """Endpoint which returns a portion of all inquieries from the database.

    **Returns**:
        Dictonary: A Dictonary of inquieries attribuites in the following format: \n
    """
    result = query_inquieries_with_details(db)

    if DEBUG:
        for row in result:
            print(f"{row} | Type: {type(row)} ")

    return result


@app.get("/cable_measurements/inquieries/{inquery_id}")
def get_cable_measurements_by_inquiery(inquery_id: int):
    """
    Endpoint for querying cable measurements by given inquiery id. \n
    **Args**:
        inquery_id (int): The id of the inquiery to sort by.

    **Returns**:
        Dictonary: A Dictonary of cable measurements attribuites in the following format: \n

    """

    result = query_cable_measurements_by_inquiery(db, inquery_id)

    if DEBUG:
        for row in result:
            print(f"{row} | Type: {type(row)} ")

    return result
