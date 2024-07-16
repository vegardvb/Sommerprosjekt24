from sqlalchemy import text
from status_codes import henvendelse_status_dict

import requests
import os
import tempfile
import docker
from fastapi import HTTPException

"""
This script serves as a collection of frequently used queries that extracts data from the database.

"""

QUERY_PATH = "./sql/queries/"


def load_query(path, subqueries=None):
    # TODO Refactor Cohesion
    """Loads a query from a file.

    Args:
        path (String): The path to the file

    Returns:
        File : The query file in byte form.
    """
    with open(path, "r") as file:
        query = file.read()

    return query


def execute_query(connection, main_file_path, subquery_files=None, params=None):
    # TODO Refactor Cohesion
    """Method for executing a query from a file based upon the specified parameters and
    subqueries.

    Args:
        connection (Connection): A connection to the database to execute the query.
        main_file_path (String): The relative path to the main query file.
        subquery_files (Dictonary<placeholder, Path> , optional): A dictonary containing the placeholder and path
        for the subquery. Defaults to None.
        params (Dictonary<String, Any>, optional): A dictonary containing the parameters and their
        name to be injected into the query file. Defaults to None.
        subquery_files (Dictonary<String, String>, optional): A dictonary containing the placeholder and path


    Returns:
        Dictonary<String,Any> : A dictonary contining the name and value of the query for each row and column.
    """
    main_query = load_query(main_file_path)
    if subquery_files is not None:
        for placeholder, subquery_path in subquery_files.items():
            subquery_text = load_query(subquery_path)
            main_query = main_query.replace(placeholder, subquery_text)

    return connection.execute(text(main_query), params)


def query_inquiries(connection):
    """A method for querying inquiriesS.

    Args:
        Connection: A connection to the database to execute the query.
    Returns:
        Dictonary : A dictonary containing the inquiries and its attributes.
    """
    result = execute_query(
        connection=connection,
        main_file_path=f"{QUERY_PATH}/fetch_inquiries.sql",
        subquery_files={
            "/*cable_measurements*/": f"{QUERY_PATH}/fetch_number_of_cable_measurements_by_inquiry.sql"
        },
    )

    # Transform the result to a list of dictionaries
    result = [dict(row) for row in result.mappings()]

    # Maps status code to status name in inquiry
    for row in result:
        try:
            row["status_name"] = henvendelse_status_dict[row["status"]]
        except KeyError as e:
            row["status_name"] = "Unknown"

    return result


def query_geometry_by_inquiry(inquiry_id, connection):
    """A method for querying geometry by inquiry.

    Args:
        inquiry_id (int): The id of the inquiry to query.
        connection (Connection):  A connection to the database to execute the query.

    Returns:
        Dictonary : A dictonary containing the geometry and its related inquiry.
    """
    result = execute_query(
        connection=connection,
        main_file_path=f"{QUERY_PATH}/fetch_geometry_by_inquiry.sql",
        params={"inquiry_id": inquiry_id},
    )

    return [dict(row) for row in result.mappings()]


def query_cable_measurements_by_inquiry(inquiry_id, connection):
    """A method for querying cable measurements by inquiry.

    Args:
        inquiry_id (int): The id of the inquiry to query.
        connection (Connection):  A connection to the database to execute the query.
    Returns:
        Dictonary : A dictonary containing the geometry and its related inquiry.
    """
    result = execute_query(
        connection=connection,
        main_file_path=f"{QUERY_PATH}/fetch_cable_measurements_by_inquiry.sql",
        params={"inquiry_id": inquiry_id},
    )

    return [dict(row) for row in result.mappings()]


def fetch_geotiff(bbox: str, width: float, height: float, logger) -> dict:
    """
    Fetches a GeoTIFF file from the provided WCS service based on the bounding box and dimensions.

    Args:
        bbox (str): The bounding box coordinates.
        width (float): The width of the GeoTIFF.
        height (float): The height of the GeoTIFF.
        logger (Logger): The logger instance for logging information and errors.

    Returns:
        dict: A dictionary containing the file path of the fetched GeoTIFF.

    Raises:
        HTTPException: If the GeoTIFF fetch fails.
    """
    # logger.info(f"Received parameters - bbox: {bbox}, width: {width}, height: {height}")
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
        # logger.info("GeoTIFF file fetched and saved successfully at: " + file_path)
        return {"file_path": file_path}
    else:
        logger.error(f"Failed to fetch terrain model: {response.text}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch terrain model: {response.text}")


async def process_geotiff(file_path: str, logger) -> dict:
    """
    Processes a GeoTIFF file to generate terrain tiles using Docker containers.

    Args:
        file_path (str): The path to the GeoTIFF file.
        logger (Logger): The logger instance for logging information and errors.

    Returns:
        dict: A dictionary containing the URL to access the generated tiles.

    Raises:
        HTTPException: If the GeoTIFF processing fails.
    """
    try:
        if not os.path.exists(file_path):
            logger.error(f"GeoTIFF file not found at: {file_path}")
            raise HTTPException(status_code=404, detail="GeoTIFF file not found")

        # logger.info(f"Processing GeoTIFF file at: {file_path}")

        output_dir = "C:/docker/terrain/output"
        os.makedirs(output_dir, exist_ok=True)

        client = docker.from_env()

        # Running the terrain creation command
        container1 = client.containers.run(
            "vegardvb/cesium-terrain-builder",
            f"ctb-tile -f Mesh -C -N -o /data/output /data/input/{os.path.basename(file_path)}",
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
            raise HTTPException(status_code=500, detail="Error during terrain tile generation")

        # Running the layer.json creation command
        container2 = client.containers.run(
            "vegardvb/cesium-terrain-builder",
            f"ctb-tile -f Mesh -C -N -l -o /data/output /data/input/{os.path.basename(file_path)}",
            volumes={
                os.path.dirname(file_path): {"bind": "/data/input", "mode": "rw"},
                output_dir: {"bind": "/data/output", "mode": "rw"},
            },
            detach=True
        )
        result2 = container2.wait()
        logs2 = container2.logs().decode('utf-8')
        # logger.info(f"Docker logs (layer.json creation): {logs2}")
        if result2['StatusCode'] != 0:
            logger.error(f"Docker container exited with code {result2}")
            raise HTTPException(status_code=500, detail="Error during layer.json generation")

        # logger.info("Terrain tiles generated successfully using Docker.")

        tile_path = os.path.join(output_dir, "layer.json")
        if os.path.exists(tile_path):
            # logger.info(f"Serving tiles at: http://localhost:8080/tilesets/output")
            return {"tilesetUrl": "http://localhost:8080/tilesets/output"}
        else:
            logger.error("Failed to generate terrain tiles: layer.json not found.")
            raise HTTPException(status_code=500, detail="Failed to generate terrain tiles")

    except Exception as e:
        logger.error(f"Error during terrain tile generation: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing GeoTIFF: {e}")