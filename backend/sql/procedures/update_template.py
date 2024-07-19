def generate_update_sql(table_name, update_params, condition_params):
    """
    Generates a dynamic SQL update statement.

    Args:
        table_name (str): The name of the database table.
        update_params (dict): Key-value pairs where keys are column names and values are their new values.
        condition_params (dict): Key-value pairs for the WHERE clause conditions.

    Returns:
        str: An SQL update statement.
    """
    set_clause = ", ".join([f"{key} = :{key}" for key in update_params.keys()])
    where_clause = " AND ".join([f"{key} = :{key}" for key in condition_params.keys()])
    sql_statement = f"UPDATE {table_name} SET {set_clause} WHERE {where_clause};"
    return sql_statement
