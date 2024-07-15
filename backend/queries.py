from sqlalchemy import text
from status_codes import henvendelse_status_dict
from status_codes import henvendelse_status_dict

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
        params (Dictonary<String, Any>, optional): A dictonary containing the parameters and their
        name to be injected into the query file. Defaults to None.

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
    connection.execute(text("SET search_path TO analytics_cable_measurement_inquiries"))
    result = execute_query(
        connection=connection,
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
    # TODO Refactor schema declaration
    connection.execute(text("SET search_path TO analytics_cable_measurement_inquiries"))
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
    # TODO Refactor schema declaration
    connection.execute(text("SET search_path TO analytics_cable_measurement_inquiries"))
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
    connection.execute(text("SET search_path TO analytics_cable_measurement_inquiries"))
    result = execute_query(
        connection=connection,
        main_file_path=f"{QUERY_PATH}/geometry/fetch_measurement_geometry_by_inquiry.sql",
        params={"inquiry_id": inquiry_id},
    )

    return [dict(row) for row in result.mappings()]


def query_points_of_cables_by_inquiry(inquiry_id, connection):
    connection.execute(text("SET search_path TO analytics_cable_measurement_inquiries"))
    result = execute_query(
        connection=connection,
        main_file_path=f"{QUERY_PATH}/geometry/fetch_points_of_cables_by_inquiry.sql",
        params={"inquiry_id": inquiry_id},
    )

    return [dict(row) for row in result.mappings()]
