import logging
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import requests
import docker
import os
import tempfile
from starlette.staticfiles import StaticFiles
from pathlib import Path

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
    logger.info("Root endpoint accessed.")
    return {"Hello": "World"}

@app.get("/inquiries")
def get_inquiries(connection=Depends(get_db)):
    logger.info("Fetching inquiries.")
    result = query_inquiries(connection)
    if DEBUG:
        for row in result:
            logger.debug(f"{row} | Type: {type(row)} ")
    return result

@app.get("/geometries/inquiry/{inquiry_id}")
def get_geometry_by_inquiry(inquiry_id: int, connection=Depends(get_db)):
    logger.info(f"Fetching geometries for inquiry ID: {inquiry_id}")
    result = query_geometry_by_inquiry(inquiry_id, connection)
    if DEBUG:
        for row in result:
            logger.debug(f"{row} | Type: {type(row)} ")
    return result

@app.get("/cable_measurements/inquiry/{inquiry_id}")
def get_cable_measurements_by_inquiery(inquiry_id: int, connection=Depends(get_db)):
    logger.info(f"Fetching cable measurements for inquiry ID: {inquiry_id}")
    result = query_cable_measurements_by_inquiry(inquiry_id, connection)
    if DEBUG:
        for row in result:
            logger.debug(f"{row} | Type: {type(row)} ")
    return result

@app.get("/fetch-geotiff")
def fetch_geotiff(bbox: str, width: float, height: float):
    logger.info(f"Received parameters - bbox: {bbox}, width: {width}, height: {height}")
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
        "HEIGHT": height
    }
    response = requests.get(wcs_url, params=params)

    if response.status_code == 200:
        file_path = os.path.join(tempfile.gettempdir(), "terrain_model.tif")
        with open(file_path, "wb") as file:
            file.write(response.content)
        logger.info("GeoTIFF file fetched and saved successfully at: " + file_path)
        return {"file_path": file_path}
    else:
        logger.error(f"Failed to fetch terrain model: {response.text}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch terrain model: {response.text}")

@app.get("/process-geotiff")
async def process_geotiff(file_path: str):
    try:
        if not os.path.exists(file_path):
            logger.error(f"GeoTIFF file not found at: {file_path}")
            raise HTTPException(status_code=404, detail="GeoTIFF file not found")

        logger.info(f"Processing GeoTIFF file at: {file_path}")

        output_dir = os.path.join(tempfile.gettempdir(), "output")
        os.makedirs(output_dir, exist_ok=True)

        client = docker.from_env()

        container1 = client.containers.run(
            "cesium-terrain-builder",
            f"ctb-tile -f Mesh -C -N -o /output /input/{os.path.basename(file_path)}",
            volumes={
                os.path.dirname(file_path): {"bind": "/input", "mode": "rw"},
                output_dir: {"bind": "/output", "mode": "rw"},
            },
            detach=True
        )
        result1 = container1.wait()
        logs1 = container1.logs().decode('utf-8')
        logger.info(f"Docker logs (terrain creation): {logs1}")
        if result1['StatusCode'] != 0:
            logger.error(f"Docker container exited with code {result1}")
            raise HTTPException(status_code=500, detail="Error during terrain tile generation")

        container2 = client.containers.run(
            "cesium-terrain-builder",
            f"ctb-tile -f Mesh -C -N -l -o /output /input/{os.path.basename(file_path)}",
            volumes={
                os.path.dirname(file_path): {"bind": "/input", "mode": "rw"},
                output_dir: {"bind": "/output", "mode": "rw"},
            },
            detach=True
        )
        result2 = container2.wait()
        logs2 = container2.logs().decode('utf-8')
        logger.info(f"Docker logs (layer.json creation): {logs2}")
        if result2['StatusCode'] != 0:
            logger.error(f"Docker container exited with code {result2}")
            raise HTTPException(status_code=500, detail="Error during layer.json generation")

        logger.info("Terrain tiles generated successfully using Docker.")
        
        tile_path = os.path.join(output_dir, "layer.json")
        if os.path.exists(tile_path):
            logger.info("Serving layer.json at: http://localhost:8000/output/layer.json")
            return {"layerUrl": "http://localhost:8000/output/layer.json"}
        else:
            logger.error("Failed to generate terrain tiles: layer.json not found.")
            raise HTTPException(status_code=500, detail="Failed to generate terrain tiles")

    except Exception as e:
        logger.error(f"Error during terrain tile generation: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing GeoTIFF: {e}")

# Serve static files
output_directory = os.path.join(tempfile.gettempdir(), "output")
os.makedirs(output_directory, exist_ok=True)
app.mount("/output", StaticFiles(directory=output_directory), name="output")