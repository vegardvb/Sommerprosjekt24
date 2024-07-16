from sqlalchemy import text


def __load_query__(path, subqueries=None):
    """Loads a query from a file.

    Args:
        path (String): The path to the file

    Returns:
        File : The query file in byte form.
    """
    with open(path, "r") as file:
        query = file.read()

    return query


# TODO Refactor name
def execute_query(connection, main_file_path, subquery_files=None, params=None):
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
    main_query = __load_query__(main_file_path)
    if subquery_files is not None:
        for placeholder, subquery_path in subquery_files.items():
            subquery_text = __load_query__(subquery_path)
            main_query = main_query.replace(placeholder, subquery_text)

    return connection.execute(text(main_query), params)
