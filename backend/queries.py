"""
This module contains functions for querying the database.
"""
import os
import tempfile
import docker
from fastapi import HTTPException
import requests
from sql_executer import execute_sql
from common.status_codes import henvendelse_status_dict

QUERY_PATH = "./sql/queries/"


def query_inquiries(connection):
    """Query inquiries.

    Args:
        connection: The database connection.

    Returns:
        list: List of inquiries and their attributes.
    """
    result = execute_sql(
        connection=connection,
        # TODO Refactor file path system to a more flexible approach
        main_file_path=f"{QUERY_PATH}/inquiry/fetch_inquiries.sql",
        placeholders={
            "/*cable_measurements*/":
                f"{QUERY_PATH}/inquiry/fetch_number_of_measurements_per_inquiry.sql"
        },
    )

    result = [dict(row) for row in result.mappings()]

    for row in result:
        try:
            row["status_name"] = henvendelse_status_dict[row["status"]]
        except KeyError:
            row["status_name"] = "Unknown"

    return result


def query_boundary_geometry_by_inquiry(inquiry_id, connection):
    """Query boundary geometry by inquiry.

    Args:
        inquiry_id (int): The ID of the inquiry.
        connection: The database connection.

    Returns:
        list: List of boundary geometry related to the inquiry.
    """
    result = execute_sql(
        connection=connection,
        main_file_path=f"{
            QUERY_PATH}/geometry/fetch_boundary_geometry_by_inquiry.sql",
        params={"inquiry_id": inquiry_id},
    )

    return [dict(row) for row in result.mappings()]


def query_working_area_geometry_by_inquiry(inquiry_id, connection):
    """Query working area geometry by inquiry.

    Args:
        inquiry_id (int): The ID of the inquiry.
        connection: The database connection.

    Returns:
        list: List of working area geometry related to the inquiry.
    """
    result = execute_sql(
        connection=connection,
        main_file_path=f"{
            QUERY_PATH}/geometry/fetch_working_area_by_inquiry.sql",
        params={"inquiry_id": inquiry_id},
    )

    return [dict(row) for row in result.mappings()]


def query_measurement_geometry_by_inquiry(inquiry_id, connection):
    """Query measurement geometry by inquiry.

    Args:
        inquiry_id (int): The ID of the inquiry.
        connection: The database connection.

    Returns:
        list: List of measurement geometry related to the inquiry.
    """
    result = execute_sql(
        connection=connection,
        main_file_path=f"{
            QUERY_PATH}/geometry/fetch_measurement_geometry_by_inquiry.sql",
        params={"inquiry_id": inquiry_id},
    )

    return [dict(row) for row in result.mappings()]


def query_points_of_cables_by_inquiry(inquiry_id, connection):
    """Query the points of cables associated with a specific inquiry.

    Args:
        inquiry_id (int): The ID of the inquiry.
        connection: The database connection.

    Returns:
        list: List of points of cables.
    """
    result = execute_sql(
        connection=connection,
        main_file_path=f"{
            QUERY_PATH}/geometry/fetch_points_of_cables_by_inquiry.sql",
        params={"inquiry_id": inquiry_id},
    )

    return [dict(row) for row in result.mappings()]




def fetch_geotiff(bbox: str, width: float, height: float, logger) -> dict:
    """Fetch a GeoTIFF file based on the bounding box and dimensions.

    Args:
        bbox (str): Bounding box coordinates.
        width (float): Width of the GeoTIFF.
        height (float): Height of the GeoTIFF.
        logger (Logger): Logger instance.

    Returns:
        dict: Dictionary containing the file path of the fetched GeoTIFF.

    Raises:
        HTTPException: If the GeoTIFF fetch fails.
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
        "WIDTH": min(width, 2850),  # Hardcoded max due to limits on API
        "HEIGHT": min(height, 2850)  # Hardcoded max due to limits on API
    }
    response = requests.get(wcs_url, params=params, timeout=10)
    if response.status_code == 200:
        file_path = os.path.join(tempfile.gettempdir(), "terrain_model.tif")
        with open(file_path, "wb") as file:
            file.write(response.content)
        return {"file_path": file_path}

    logger.error(f"Failed to fetch terrain model: {response.text}")
    raise HTTPException(
        status_code=500, detail=f"Failed to fetch terrain model: {response.text}")


async def process_geotiff(file_path: str, logger) -> dict:
    """Process a GeoTIFF file to generate terrain tiles using Docker.

    Args:
        file_path (str): Path to the GeoTIFF file.
        logger (Logger): Logger instance.

    Returns:
        dict: Dictionary containing the URL to access the generated tiles.

    Raises:
        HTTPException: If the GeoTIFF processing fails.
    """
    try:
        if not os.path.exists(file_path):
            logger.error(f"GeoTIFF file not found at: {file_path}")
            raise HTTPException(
                status_code=404, detail="GeoTIFF file not found")

        output_dir = "C:/docker/terrain/output"
        os.makedirs(output_dir, exist_ok=True)

        client = docker.from_env()

        # Running the terrain creation command
        container1 = client.containers.run(
            "cesium-terrain-builder",
            f"ctb-tile -f Mesh -C -N -o /data/output /data/input/{
                os.path.basename(file_path)}",
            volumes={
                os.path.dirname(file_path): {"bind": "/data/input", "mode": "rw"},
                output_dir: {"bind": "/data/output", "mode": "rw"},
            },
            detach=True
        )
        result1 = container1.wait()
        logs1 = container1.logs().decode('utf-8')
        logger.info(f"Docker logs (terrain creation): {logs1}")
        if result1['StatusCode'] != 0:
            logger.error(f"Docker container exited with code {result1}")
            raise HTTPException(
                status_code=500, detail="Error during terrain tile generation")

        # Running the layer.json creation command
        container2 = client.containers.run(
            "cesium-terrain-builder",
            f"ctb-tile -f Mesh -C -N -l -o /data/output /data/input/{
                os.path.basename(file_path)}",
            volumes={
                os.path.dirname(file_path): {"bind": "/data/input", "mode": "rw"},
                output_dir: {"bind": "/data/output", "mode": "rw"},
            },
            detach=True
        )
        result2 = container2.wait()
        if result2['StatusCode'] != 0:
            logger.error(f"Docker container exited with code {result2}")
            raise HTTPException(
                status_code=500, detail="Error during layer.json generation")

        tile_path = os.path.join(output_dir, "layer.json")
        if os.path.exists(tile_path):
            return {"tileSetUrl": "http://localhost:8080/tilesets/output"}
        logger.error("Failed to generate terrain tiles: layer.json not found.")
        raise HTTPException(
            status_code=500, detail="Failed to generate terrain tiles")

    except Exception as e:
        logger.error(f"Error during terrain tile generation: {e}")
        raise HTTPException(
            status_code=500, detail=f"Error processing GeoTIFF: {e}") from e


def query_images_by_inquiry_id(inquiry_id, logger, connection):
    """Query images related to a specific inquiry.

    Args:
        inquiry_id (int): The ID of the inquiry.
        connection: The database connection.

    Returns:
        list: List of images related to the inquiry.
    """
    try:
        result = execute_sql(
            connection=connection,
            main_file_path=f"{QUERY_PATH}/fetch_images_by_inquiry_id.sql",
            params={"inquiry_id": inquiry_id},
        )
        logger.info(f"main file path: {
                    QUERY_PATH}/fetch_images_by_inquiry_id.sql")
        images = [dict(row) for row in result.mappings()]
        logger.info(f"Fetched images for inquiry {inquiry_id}: {
                    images}")  # Log fetched images
        return images
    except Exception as e:
        logger.error(f"Error querying images for inquiry {inquiry_id}: {e}")
        raise HTTPException(
            status_code=500, detail="Internal Server Error, Can't get images by inquiry id") from e


def query_update_views(connection):
    """Query measurement geometry by inquiry.

    Args:
        inquiry_id (int): The ID of the inquiry.
        connection: The database connection.

    Returns:
        list: List of measurement geometry related to the inquiry.
    """
    result = execute_sql(
        connection=connection,
        main_file_path=f"{
            QUERY_PATH}update_queries/refresh_materialized_views.sql",
        params={},
    )
    return result
