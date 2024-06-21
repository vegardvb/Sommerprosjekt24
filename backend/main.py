from fastapi import FastAPI
from database import db
from queries import *

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
def get_measurement(cable_measurement_id: int, DEBUG: bool = False):
    """Endpoint for querying the cable measurements table.

    Args:
        cable_measurement_id (int): The id of the cable measurement to query.
        DEBUG (bool, optional): Boolean to apply debugging statements. Defaults to False.

    Returns:
        Dictonary: A dictonary containing the cable measurements and its attribuites from the database.
    """
    result = query_cable_measurements(db, cable_measurement_id)

    if DEBUG:
        for row in result:
            print(f"{row} | Type: {type(row)} ")

    return result


@app.get("/inqueries/")
def get_inquieries():
    """Endpoint for querying the inquieries table.

    Returns:
        Dictonary: A dictornary containing the inquieries and its attribuites from the database.
    """

    result = query_inquieries(db)

    for row in result:
        print(f"{row} | Type: {type(row)} ")

    return result
