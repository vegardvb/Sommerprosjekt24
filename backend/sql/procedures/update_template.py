"""
This module provides a function to generate a dynamic SQL update statement.
"""


def generate_update_sql(table_name, update_params, condition_params):
    """
    Generates a dynamic SQL update statement with parameter placeholders to prevent SQL injection.
    This function should be used with parameterized queries.

    Args:
        table_name (str): The name of the database table. 
            Must be a valid table name and not user-controlled.
        update_params (dict): Key-value pairs where keys are column names 
            and values are their new values.
            The keys should be valid column names and not user-controlled.
        condition_params (dict): Key-value pairs for the WHERE clause conditions. 
            Supports basic equality conditions.
            The keys should be valid column names and not user-controlled.

    Returns:
        str: An SQL update statement.

    Raises:
        ValueError: If any of the inputs are invalid or empty.
    """
    if not table_name or not update_params or not condition_params:
        raise ValueError(
            "Table name, update parameters, and condition parameters must not be empty.")

    set_clause = ", ".join([f"{key} = :{key}" for key in update_params.keys()])
    where_clause = " AND ".join(
        [f"{key} = :{key}" for key in condition_params.keys()])
    sql_statement = f"UPDATE {table_name} SET {
        set_clause} WHERE {where_clause};"
    return sql_statement
