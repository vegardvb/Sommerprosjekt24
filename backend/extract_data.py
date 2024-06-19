# Postgres connection
import psycopg2
from data_extractor import create_connection, execute_query

"""
This initialize necessary authentication and extract cable data from the database.

"""

# Enviroment varaibles
from dotenv import load_dotenv, dotenv_values
import os

# Load the enviroment variables
load_dotenv()

# Database credentials
db_name = os.getenv("DB_NAME")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")

# Database connection
connection = create_connection(db_name, db_user, db_password, db_host, db_port)

# Query
query = """ SELECT * FROM ledningsmaaling_innmaaling ORDER BY id LIMIT 1; """

results = execute_query(connection, query, True)

print(results)
