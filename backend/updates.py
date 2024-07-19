from sql_executer import execute_sql


def query_inquiries(connection):
    """A method for querying inquiriesS.

    Args:
        Connection: A connection to the database to execute the query.
    Returns:
        Dictonary : A dictonary containing the inquiries and its attributes.
    """
    result = execute_sql(
        connection=connection,
        # TODO Refactor file path system to a more flexible approach
        main_file_path=f"{QUERY_PATH}/inquiry/fetch_inquiries.sql",
        placeholders={
            "/*cable_measurements*/": f"{QUERY_PATH}/inquiry/fetch_number_of_measurements_per_inquiry.sql"
        },
    )
