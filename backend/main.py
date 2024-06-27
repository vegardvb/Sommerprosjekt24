from fastapi import FastAPI
from fastapi.params import Depends
from database import get_db
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


@app.get("/inquiries")
def get_inquiries(connection=Depends(get_db)):
    """Endpoint which returns a portion of all inquiries from the database.

    **Returns**:
        Dictonary: A Dictonary of inquiries attribuites
    """
    result = query_inquiries(connection)

    if DEBUG:
        for row in result:
            print(f"{row} | Type: {type(row)} ")

    return result


@app.get("/geometries/inquiry/{inquiry_id}")
def get_geometry_by_inquiry(inquiry_id, connection=Depends(get_db)):
    """Endpoint which returns a portion of all inquiries from the database.

    **Returns**:
        Dictonary: A Dictonary of inquiries attribuites
    """
    result = query_geometry_by_inquiry(inquiry_id, connection)

    if DEBUG:
        for row in result:
            print(f"{row} | Type: {type(row)} ")

    return result


@app.get("/cable_measurements/inquiry/{inquery_id}")
def get_cable_measurements_by_inquiery(inquery_id: int, connection=Depends(get_db)):
    """
    Endpoint for querying cable measurements by given inquiery id. \n
    **Args**:
        inquery_id (int): The id of the inquiery to sort by.

    **Returns**:
        Dictonary: A Dictonary of cable measurements attribuites in the following format: \n

    """
    result = query_cable_measurements_by_inquiry(inquery_id, connection)

    if DEBUG:
        for row in result:
            print(f"{row} | Type: {type(row)} ")

    return result
