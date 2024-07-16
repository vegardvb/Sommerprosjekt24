from sqlalchemy import ResultProxy, create_engine, text
from sqlalchemy.orm import sessionmaker

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
SCHEMA = f"analytics_cable_measurement_inquiries"


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
        connection.execute(text(f"SET search_path TO {SCHEMA}"))
        yield connection
