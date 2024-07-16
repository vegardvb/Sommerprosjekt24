import logging
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import requests
import docker
import os
import tempfile

from database import get_db
from queries import *

DEBUG = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI()

origins = [
    "http://localhost:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    Returns:
        Dictonary: A Dictonary of inquiries attribuites
    """
    result = query_inquiries(connection)
    if DEBUG:
        for row in result:
            logger.debug(f"{row} | Type: {type(row)} ")
    return result

@app.get("/geometries/inquiry/{inquiry_id}")
def get_geometry_by_inquiry(inquiry_id: int, connection=Depends(get_db)):
    """Endpoint which returns a portion of all inquiries from the database.

    Returns:
        Dictonary: A Dictonary of inquiries attribuites
    """
    result = query_geometry_by_inquiry(inquiry_id, connection)
    if DEBUG:
        for row in result:
            logger.debug(f"{row} | Type: {type(row)} ")
    return result

@app.get("/cable_measurements/inquiry/{inquiry_id}")
def get_cable_measurements_by_inquiery(inquiry_id: int, connection=Depends(get_db)):
    """
    Endpoint for querying cable measurements by given inquiry id. \n
    Args:
        inquiry_id (int): The id of the inquiry to sort by.

    Returns:
        Dictonary: A Dictionary of cable measurements attribuites in the following format: \n
    """
    result = query_cable_measurements_by_inquiry(inquiry_id, connection)
    if DEBUG:
        for row in result:
            logger.debug(f"{row} | Type: {type(row)} ")
    return result

@app.get("/fetch-geotiff")
def fetch_geotiff_endpoint(bbox: str, width: float, height: float):
    return fetch_geotiff(bbox, width, height, logger)

@app.get("/process-geotiff")
async def process_geotiff_endpoint(file_path: str):
    return await process_geotiff(file_path, logger)