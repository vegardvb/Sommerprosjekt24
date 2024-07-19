from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import requests

from database import get_db
from queries import *

DEBUG = False

# FastAPI instance
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
            print(f"{row} | Type: {type(row)} ")

    return result


@app.get("/geometries/inquiry/{inquiry_id}")
def get_geometry_by_inquiry(inquiry_id, connection=Depends(get_db)):
    """Endpoint which returns the area_geometry for a given inquiry id.

    **Returns**:
        Dictonary: A Dictonary of the inquiry geometry attribuites
    """
    result = query_area_geometry_by_inquiry(inquiry_id, connection)

    if DEBUG:
        for row in result:
            print(f"{row} | Type: {type(row)} ")

    return result


@app.get("/geometries/measurements/inquiry/{inquiry_id}")
def get_measurement_geometry_by_inquiery(inquiry_id: int, connection=Depends(get_db)):
    """
    Endpoint for measurement geometry by given inquiery id. \n

    **Args**:
        inquiry_id (int): The id of the inquiery to sort by.

    **Returns**:
        Dictonary: A Dictonary of measurement geometry attributes

    """
    result = query_measurement_geometry_by_inquiry(inquiry_id, connection)

    if DEBUG:
        for row in result:
            print(f"{row} | Type: {type(row)} ")

    return result


@app.get("/terrain")
def get_terrain(bbox: str, width: int, height: int):
    """
    Endpoint to fetch the terrain model GeoTIFF file from the WCS service based on the provided bounding box and resolution.

    Args:
        bbox (str): Bounding box coordinates in the format "minX,minY,maxX,maxY".
        width (int): Width of the bounding box.
        height (int): Height of the bounding box.
        response_crs (str): The coordinate reference system of the response GeoTIFF.

    Returns:
        FileResponse: The GeoTIFF file containing the terrain model.
    """
    wcs_url = "https://wcs.geonorge.no/skwms1/wcs.hoyde-dtm-nhm-25833"
    params = {
        "SERVICE": "WCS",
        "VERSION": "1.0.0",
        "REQUEST": "GetCoverage",
        "FORMAT": "GeoTIFF",
        "COVERAGE": "nhm_dtm_topo_25833",
        "BBOX": bbox,
        "CRS": "EPSG:25833",
        "RESPONSE_CRS": "EPSG:4326",
        "WIDTH": width,
        "HEIGHT": height,
    }
    response = requests.get(wcs_url, params=params)

    if response.status_code == 200:
        file_path = "terrain_model.tif"
        with open(file_path, "wb") as file:
            file.write(response.content)
        return FileResponse(file_path)
    else:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch terrain model: {response.text}"
        )
