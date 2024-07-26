"""
This module contains the main code for the backend of the 3D visualization of cable network project.
"""

import logging
import json

import os
import sys
from queries import (
    query_images_by_inquiry_id,
    query_inquiries,
    query_boundary_geometry_by_inquiry,
    query_working_area_geometry_by_inquiry,
    query_measurement_geometry_by_inquiry,
    query_points_of_cables_by_inquiry,
    fetch_geotiff,
    process_geotiff,
    query_update_views
)
from database import get_db, get_db_public, ledningsmaaling_innmaaling_punkt
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select, update, func
from models.geojson_models import CoordinateUpdate
# Add the project root directory to the system path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, project_root)


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

# FastAPI instance
app = FastAPI()

# CORS configuration
origins = ["http://localhost:4200"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEBUG = False


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
def get_area_geometry_by_inquiry(inquiry_id: int, connection=Depends(get_db)):
    """Endpoint for retrieving the boundary geometry by the given inquiry ID.

    Args:
        inquiry_id (int): The ID of the inquiry to sort by.

    Returns:
        list: Array containing a JSON object with the area geometry for the inquiry.
    """
    result = query_boundary_geometry_by_inquiry(inquiry_id, connection)
    return result


@app.get("/geometries/area/working_area/inquiry/{inquiry_id}")
def get_working_area_geometry_by_inquiry(inquiry_id: int, connection=Depends(get_db)):
    """Endpoint for retrieving the working area geometry by the given inquiry ID.

    Args:
        inquiry_id (int): The ID of the inquiry to sort by.

    Returns:
        list: Array containing a JSON object with the working area geometry for the inquiry.
    """
    result = query_working_area_geometry_by_inquiry(inquiry_id, connection)
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


@app.get("/images/inquiry/{inquiry_id}")
def get_images_by_inquiry(inquiry_id: int, connection=Depends(get_db_public)):
    """Endpoint for retrieving images by the given inquiry ID.

    Args:
        inquiry_id (int): The ID of the inquiry to filter by.

    Returns:
        list: Array containing a JSON object with image details for the inquiry.
    """
    try:
        result = query_images_by_inquiry_id(inquiry_id, logger, connection)
        logger.info("API call to fetch images for inquiry %s",
                    inquiry_id)  # Log API call
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error("Unexpected error: %s", e)
        raise HTTPException(
            status_code=500, detail="Internal Server Error") from e


@app.put("/update-coordinates/{edited_point_id}")
def update_height(
    edited_point_id: int,
    coordinate_update: CoordinateUpdate,
    db: Session = Depends(get_db_public)
):
    """
    Update the height, coordinates (lat, lon), and geometry in the metadata of a specific item.


    Raises:
        HTTPException: If the item with the specified ID is not found.

    Returns:
        Dict[str, Optional[float]]: A dictionary containing a success message, 
            the updated ID, and the new values.
    """
    try:
        # Fetch the current metadata
        stmt = select(ledningsmaaling_innmaaling_punkt.c.metadata).where(
            ledningsmaaling_innmaaling_punkt.c.id == edited_point_id)
        current_data = db.execute(stmt).fetchone()

        if not current_data:
            raise HTTPException(status_code=404, detail="Item not found")

        # Access the metadata column from the result
        metadata = current_data[0]

        # Handle the case where metadata is already a dictionary
        if isinstance(metadata, dict):
            metadata_dict = metadata
        else:
            # Assume metadata is a JSON string and convert it to a dict
            metadata_dict = json.loads(metadata) if metadata else {}

        # Update the height and coordinates in metadata
        metadata_dict['height'] = coordinate_update.hoyde
        metadata_dict['lat'] = coordinate_update.lat
        metadata_dict['lon'] = coordinate_update.lon

        # Convert metadata back to JSON string for storage
        updated_metadata = json.dumps(metadata_dict)

        # Create the new geometry point
        new_geom = func.ST_SetSRID(func.ST_MakePoint(
            coordinate_update.lon, coordinate_update.lat), 4326)

        # Create the update statement
        stmt = (
            update(ledningsmaaling_innmaaling_punkt)
            .where(ledningsmaaling_innmaaling_punkt.c.id == edited_point_id)
            .values(hoyde=coordinate_update.hoyde, metadata=updated_metadata, geom=new_geom)
        )

        # Execute the update statement
        result = db.execute(stmt)
        query_update_views(db)
        db.commit()

        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Item not found")

        return {"message": "Height, coordinates, and metadata updated successfully",
                "id": edited_point_id,
                "new_height": coordinate_update.hoyde,
                "new_lat": coordinate_update.lat,
                "new_lon": coordinate_update.lon}

    except HTTPException as e:
        raise e

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500, detail="An error occurred while updating the metadata") from e
