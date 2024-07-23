"""
This module provides functions for executing SQL queries.
"""

from sqlalchemy import text


def __load_sql__(path):
    """Loads a query from a file.

    Args:
        path (str): The path to the file.

    Returns:
        str: The query file content.
    """
    with open(path, "r", encoding="utf-8") as file:
        query = file.read()
    return query


def execute_sql(connection, main_file_path, placeholders=None, params=None):
    """Executes SQL from a file with specified parameters and placeholders.

    Args:
        connection (Connection): A connection to the database.
        main_file_path (str): The relative path to the main query file.
        placeholders (dict, optional): Dictionary containing the placeholder and path. Defaults to None.
        params (dict, optional): Dictionary containing the parameters and their name to be injected into the query file. Defaults to None.

    Returns:
        ResultProxy: The result of the query execution.
    """
    statement = __load_sql__(main_file_path)
    if placeholders is not None:
        for placeholder, placeholder_path in placeholders.items():
            placeholder_statement = __load_sql__(placeholder_path)
            statement = statement.replace(placeholder, placeholder_statement)

    return connection.execute(text(statement), params)
