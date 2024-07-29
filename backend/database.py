"""
This module provides functionality for connecting to the database.
"""

import os
from sqlalchemy import (
    ResultProxy,
    create_engine,
    text,
    MetaData,
    Table,
    Column,
    Integer,
    String,
    Float,
    DateTime,
)
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database credentials
db_name = os.getenv("DB_NAME")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")

# Create connection to database
DATABASE_URL = f"postgresql://{db_user}:{
    db_password}@{db_host}:{db_port}/{db_name}"
SCHEMA = "analytics_cable_measurement_inquiries"
SCHEMA_PUBLIC = "public"

# Engine for executing queries
engine = create_engine(DATABASE_URL, echo=True, future=True)


def get_db():
    """Establishes a connection to the database within folder analytics_cable_measurement_inquiries.

    Yields:
        Connection: High-level API for interacting with the database.
    """
    with engine.connect() as connection:
        connection = connection.execution_options(mapper=ResultProxy.mappings)
        connection.execute(text(f"SET search_path TO {SCHEMA}"))
        yield connection


def get_db_public():
    """Establishes a connection to the database within folder public.

    Yields:
        Connection: High-level API for interacting with the database.
    """
    with engine.connect() as connection:
        connection = connection.execution_options(mapper=ResultProxy.mappings)
        connection.execute(text(f"SET search_path TO {SCHEMA_PUBLIC}"))
        yield connection


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
metadata = MetaData()

ledningsmaaling_innmaaling_punkt = Table(
    "ledningsmaaling_innmaaling_punkt",
    metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("navn", String),
    Column("bruker_id", Integer),
    Column("geom", String),
    Column("survey_geom", String),
    Column("noyaktighet_z", Float),
    Column("hoyde", Float),
    Column("tidspunkt", DateTime),
    Column("metadata", String),
)
metadata.create_all(bind=engine)
