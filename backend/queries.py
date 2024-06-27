from sqlalchemy import text
from status_codes import HenvendelseStatus_dict, PaavisningstatusLedningsmaaling_dict

"""
This script serves as a collection of frequently used queries that extracts data from the database.

"""

QUERY_PATH = "./sql/queries/"


<<<<<<< HEAD
def load_query(path, subqueries=None):
    """Loads a query from a file.
=======
class Table(Enum):
    CABLE_MEASUREMENT = "ledningsmaaling_innmaaling"
    CABLE_MEASUREMENT_INQUIERY = "henvendelse_ledningsmaaling"
    INQUIERY = "henvendelse"
    MUNICIPALITY = "kommune"
    ORGANIZATION = "organisasjon"
    GEOMETRY = "geometri"


"""
A collection of queries that retrieve data from the database.
"""


def query_cable_measurements(cursor, cable_measurement_id: int, limit: int = 3):
    """
    A method for querying the cable measurements table with the specified attribuites.
>>>>>>> 8d470b7577a04fb179b19c702f43030dd18a0175

    Args:
        path (String): The path to the file

    Returns:
        File : The query file in byte form.
    """
    with open(path, "r") as file:
        query = file.read()

<<<<<<< HEAD
    return query
=======
    cursor.execute(query)

    return cursor.fetchall()
>>>>>>> 8d470b7577a04fb179b19c702f43030dd18a0175


def execute_query(connection, main_file_path, subquery_files=None, params=None):
    """Method for executing a query from a file based upon the specified parameters and
    subqueries.

    Args:
        connection (Connection): A connection to the database to execute the query.
        main_file_path (String): The relative path to the main query file.
        subquery_files: (Dictonary<placeholder, Path> , optional): A dictonary containing the placeholder and path
        for the subquery. Defaults to None.
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
    result = execute_query(
        connection=connection,
        main_file_path=f"{QUERY_PATH}/fetch_inquiries.sql",
    )

    # Transform the result to a list of dictionaries
    result = [dict(row) for row in result.mappings()]

    # Maps status code to status name
    try:
        for row in result:
            row["status_name"] = HenvendelseStatus_dict[row["status"]]
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
