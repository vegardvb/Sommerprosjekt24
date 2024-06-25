from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    JSON,
    VARCHAR,
)
from sqlalchemy.orm import relationship
from database import Base

""" 
This class serves as a model with relevant data for the table "ledningsmaaling_innmaaling" in the database.
"""


class CableMeasurement(Base):
    __tablename__ = "ledningsmaaling_innmaaling"
    id = Column(Integer, primary_key=True)
    navn = Column(String)
    henvendelse_ledningsmaaling_id = Column(Integer)
    opprettet_dato = Column(DateTime)
    meta_data = Column(JSON)
    geojson = Column(JSON)


"""
This class serves as a model with relevant data for the table "kommune" in the database.
"""


class Municipality(Base):
    __tablename__ = "kommune"
    id = Column(Integer, primary_key=True)
    navn = Column(String)


"""
This class serves as a model with relevant data for the table "poststed" in the database.
"""


class PostalTown(Base):
    __tablename__ = "poststed"
    id = Column(Integer, primary_key=True)
    navn = Column(String)


"""
This class serves as a model with relevant data for the table "henvendelse" in the database.
"""


class Inquiry(Base):
    __tablename__ = "henvendelse"
    id = Column(Integer, primary_key=True)
    navn = Column(VARCHAR(500))
    gateadresse = Column(VARCHAR(255))
    status = Column(Integer)
    kommune_id = Column(Integer)
    poststed_id = Column(Integer)
    organisasjon_id = Column(Integer)
    behandlingsfrist = Column(DateTime)
    kunde_epost = Column(VARCHAR(250))
    byggherre_navn = Column(VARCHAR(200))
