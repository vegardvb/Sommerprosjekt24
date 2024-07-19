import logging
import os
import sys

# Imports the root directory to the path in order to import project modules
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, project_root)

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware

# Database services
from database import get_db
from queries import *

# Base models
from models.geojson_models import FeatureCollection


# FastAPI instance
app = FastAPI()

# Configuration
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


@app.get("/")
def read_root():
    """Home endpoint for the FastAPI application.

    Returns:
        dict: A greeting message.
    """
    return {"Hello": "World"}


# * GET Requests
@app.get("/inquiries")
def get_inquiries(connection=Depends(get_db)):
    """Endpoint which returns all inquiries with registered measurements.

    Returns:
        list: Array containing JSON objects with the details 
        of all inquiries with registered measurements.
    """
    result = query_inquiries(connection)
    return result


@app.get("/geometries/area/boundary/inquiry/{inquiry_id}")
def get_area_geometry_by_inquiery(inquiry_id: int, connection=Depends(get_db)):
    """
    Endpoint for retrieving the boundary geometry by the given inquiery id. \n

    **Args**:
    \n *inquiry_id (int)*: The id of the inquiery to sort by.

    **Returns**:
    \n *Array<JSON>*: Array containing a JSON object which holds the area geometry for the inquiry.

    """
    result = query_boundary_geometry_by_inquiry(inquiry_id, connection)

    if DEBUG:
        for row in result:
            print(f"{row} | Type: {type(row)} ")

    return result


@app.get("/geometries/area/working_area/inquiry/{inquiry_id}")
def get_working_area_geometry_by_inquiry(inquiry_id: int, connection=Depends(get_db)):
    """
    Endpoint for the geometry of the working area by given inquiery id. \n

    Args:
        inquiry_id (int): The ID of the inquiry to sort by.

    Returns:
        list: Array containing a JSON object with the area geometry for the inquiry.
    """
    result = query_working_area_geometry_by_inquiry(inquiry_id, connection)

    if DEBUG:
        for row in result:
            print(f"{row} | Type: {type(row)} ")

    return result


@app.get("/geometries/measurements/inquiry/{inquiry_id}")
def get_geometry_by_inquiry(inquiry_id: int, connection=Depends(get_db)):
    """Endpoint which returns all measurements related to a specified inquiry by its inquiry ID.

    Args:
        inquiry_id (int): The ID of the inquiry to filter by.

    Returns:
        list: Array containing a JSON object with the geojson 
        for all the geometry related to the inquiry.
    """
    result = query_measurement_geometry_by_inquiry(inquiry_id, connection)
    return result


@app.get("/geometries/measurements/cable_points/inquiry/{inquiry_id}")
def get_measurement_geometry_by_inquiry(inquiry_id: int, connection=Depends(get_db)):
    """Endpoint for fetching the points cable measurements are made up of, by the given inquiry ID.

    Args:
        inquiry_id (int): The ID of the inquiry to filter by.

    Returns:
        list: Array of JSON objects containing the geojson 
        for each cable measurement as a FeatureCollection.
    """
    result = query_points_of_cables_by_inquiry(inquiry_id, connection)
    return result

@app.get("/fetch-geotiff")
def fetch_geotiff_endpoint(bbox: str, width: float, height: float):
    """Fetch GeoTIFF based on bounding box and dimensions."""
    return fetch_geotiff(bbox, width, height, logger)


@app.get("/process-geotiff")
async def process_geotiff_endpoint(file_path: str):
    """Process GeoTIFF to generate terrain tiles."""
    return await process_geotiff(file_path, logger)

    


# * POST Requests
@app.post("/geometries/features/")
def get_measurement_geometry_by_inquiery(
    feature_colleciton: FeatureCollection, connection=Depends(get_db)
):
    """
    Endpoint for updating a given a collection of Features.
    """

    # result = query_points_of_cables_by_inquiry(inquiry_id, connection)

    if DEBUG:
        for row in result:
            print(f"{row} | Type: {type(row)} ")

    return result
