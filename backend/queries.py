from sqlalchemy import text
from sql_executer import execute_query
from status_codes import henvendelse_status_dict

"""
This script serves as a collection of frequently used queries that extracts data from the database.

"""
# TODO Refactor file path system to a more flexible approach
QUERY_PATH = "./sql/queries/"


def query_inquiries(connection):
    """A method for querying inquiriesS.

    Args:
        Connection: A connection to the database to execute the query.
    Returns:
        Dictonary : A dictonary containing the inquiries and its attributes.
    """
    # connection.execute(text("SET search_path TO analytics_cable_measurement_inquiries"))
    result = execute_query(
        connection=connection,
        # TODO Refactor file path system to a more flexible approach
        main_file_path=f"{QUERY_PATH}/inquiry/fetch_inquiries.sql",
        subquery_files={
            "/*cable_measurements*/": f"{QUERY_PATH}/inquiry/fetch_number_of_measurements_per_inquiry.sql"
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


def query_boundary_geometry_by_inquiry(inquiry_id, connection):
    """A method for querying boundary geometry by inquiry.

    Args:
        inquiry_id (int): The id of the inquiry to query.
        connection (Connection):  A connection to the database to execute the query.

    Returns:
        Dictonary : A dictonary containing the geometry and its related inquiry.
    """
    result = execute_query(
        connection=connection,
        main_file_path=f"{QUERY_PATH}/geometry/fetch_boundary_geometry_by_inquiry.sql",
        params={"inquiry_id": inquiry_id},
    )

    return [dict(row) for row in result.mappings()]


def query_working_area_geometry_by_inquiry(inquiry_id, connection):
    """A method for querying working area geometry by inquiry.

    Args:
        inquiry_id (int): The id of the inquiry to query.
        connection (Connection):  A connection to the database to execute the query.

    Returns:
        Dictonary : A dictonary containing the geometry and its related inquiry.
    """
    result = execute_query(
        connection=connection,
        main_file_path=f"{QUERY_PATH}/geometry/fetch_working_area_by_inquiry.sql",
        params={"inquiry_id": inquiry_id},
    )

    return [dict(row) for row in result.mappings()]


def query_measurement_geometry_by_inquiry(inquiry_id, connection):
    """A method for querying the geometry for the working area by inquiry.

    Args:
        inquiry_id (int): The id of the inquiry to query.
        connection (Connection):  A connection to the database to execute the query.
    Returns:
        Dictonary : A dictonary containing the geometry and its related inquiry.
    """
    result = execute_query(
        connection=connection,
        main_file_path=f"{QUERY_PATH}/geometry/fetch_measurement_geometry_by_inquiry.sql",
        params={"inquiry_id": inquiry_id},
    )

    return [dict(row) for row in result.mappings()]


def query_points_of_cables_by_inquiry(inquiry_id, connection):
    """
    Query the points of cables associated with a specific inquiry.

    Args:
        inquiry_id (int): The ID of the inquiry.
        connection: The database connection object.

    Returns:
        list: A list of dictionaries representing the points of cables.

    """
    result = execute_query(
        connection=connection,
        main_file_path=f"{QUERY_PATH}/geometry/fetch_points_of_cables_by_inquiry.sql",
        params={"inquiry_id": inquiry_id},
    )

    return [dict(row) for row in result.mappings()]
