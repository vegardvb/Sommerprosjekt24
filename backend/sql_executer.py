from sqlalchemy import text


def __load_sql__(path, subqueries=None):
    """Loads a query from a file.

    Args:
        path (String): The path to the file

    Returns:
        File : The query file in byte form.
    """
    with open(path, "r") as file:
        query = file.read()

    return query


def execute_sql(connection, main_file_path, placeholders=None, params=None):
    """Method for executing sql from a file based upon the specified parameters and
    placeholders.

    Args:
        connection (Connection): A connection to the database to execute the query.
        main_file_path (String): The relative path to the main query file.
        placeholders (Dictonary<placeholder, Path> , optional): A dictonary containing the placeholder and path
        params (Dictonary<String, Any>, optional): A dictonary containing the parameters and their
        name to be injected into the query file. Defaults to None.

    Returns:
        Dictonary<String,Any> : A dictonary contining the name and value of the query for each row and column.
    """
    statement = __load_sql__(main_file_path)
    if placeholders is not None:
        for placeholder, placeholder_path in placeholders.items():
            placeholder_statement = __load_sql__(placeholder_path)
            statement = statement.replace(placeholder, placeholder_statement)

    return connection.execute(text(statement), params)
