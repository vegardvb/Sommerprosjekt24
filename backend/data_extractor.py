import psycopg2
from psycopg2 import OperationalError


# Establishes a connection to the database
def create_connection(db_name, db_user, db_password, db_host, db_port):
    connection = None
    try:
        connection = psycopg2.connect(
            database=db_name,
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port,
        )
        print("Connection to PostgreSQL DB successful")
    except OperationalError as e:
        print(f"The error '{e}' occurred")
    return connection


# Exectutes the given query
def execute_query(connection, query, debug=False):
    connection.autocommit = True
    cursor = connection.cursor()
    try:
        cursor.execute(query)
        print("Query executed successfully")
        dataset = cursor.fetchall()

        if debug:
            for data in dataset:
                print(data)

    except OperationalError as e:
        print(f"The error '{e}' occurred")
