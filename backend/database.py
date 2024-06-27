<<<<<<< HEAD
from sqlalchemy import ResultProxy, create_engine
=======
from psycopg2 import connect
from psycopg2.extras import RealDictCursor
>>>>>>> 8d470b7577a04fb179b19c702f43030dd18a0175

# Enviroment varaibles
from dotenv import load_dotenv
import os

# Load the enviroment variables
load_dotenv()

# Database credentials
db_name = os.getenv("DB_NAME")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")

# Create connection to database
DATABASE_URL = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

<<<<<<< HEAD
# Engine for executing queries
engine = create_engine(DATABASE_URL, echo=True, future=True)


def get_db():
    """Establishes a connection to the database.

    Yields:
        Connection : High-level API for interacting with the database.
    """
    with engine.connect() as connection:
        # Set the default options for results
        connection = connection.execution_options(mapper=ResultProxy.mappings)
        yield connection
=======
# Cursor for executing queries as dictionaries
db = connenction.cursor(cursor_factory=RealDictCursor)
# e.g: "print(row['id'], row['name'])"
>>>>>>> 8d470b7577a04fb179b19c702f43030dd18a0175
