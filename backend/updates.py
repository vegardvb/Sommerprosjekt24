"""
This module contains functions for querying inquiries.
"""

from sql_executer import execute_sql
from backend.queries import QUERY_PATH


def query_inquiries(connection):
    """A method for querying inquiries.

    Args:
        connection: A connection to the database to execute the query.
    Returns:
        Dictionary: A dictionary containing the inquiries and their attributes.
    """
    result = execute_sql( # TODO: unused variable result
        connection=connection,
        # TODO Refactor file path system to a more flexible approach
        main_file_path=f"{QUERY_PATH}/inquiry/fetch_inquiries.sql",
        placeholders={
            "/*cable_measurements*/":
                f"{QUERY_PATH}/inquiry/fetch_number_of_measurements_per_inquiry.sql"
        },
    )
