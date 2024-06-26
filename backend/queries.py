from database import db
import psycopg2
from enum import Enum

"""
This script serves as a collection of frequently used queries that extracts data from the database.

"""


"""
Collection of semantic enums corresponding to their respective tables in the database.
"""


class Table(Enum):
    CABLE_MEASUREMENT = "ledningsmaaling_innmaaling"
    CABLE_MEASUREMENT_INQUIERY = "henvendelse_ledningsmaaling"
    INQUIERY = "henvendelse"
    MUNICIPALITY = "kommune"
    ORGANIZATION = "organisasjon"
    GEOMETRY = "geometri"


"""
A collection of queries that retrieve data from the database.
"""


def query_cable_measurements(cursor, cable_measurement_id: int, limit: int = 3):
    """
    A method for querying the cable measurements table with the specified attribuites.

    Args:
        cursor (A Cursor object which allows Python code to execute PostgreSQL command in a database session.):
        limit (int, optional): A limit to limit the amount of returned values.Defaults to 50.
        cable_measurement_id (int): The id of the cable measurement to query.

    Returns:
        Dictonary : A dictonary containing the inquieries from the database.
    """
    query = f"SELECT * FROM {Table.CABLE_MEASUREMENT.value} WHERE id = {cable_measurement_id} LIMIT {limit}"

    cursor.execute(query)

    return cursor.fetchall()


def query_inquieries_with_details(cursor, limit: int = 50):
    """A method for querying inqueries.

    Args:
        cursor (A Cursor object which allows Python code to execute PostgreSQL command in a database session.):
        limit (int, optional): A limit to limit the amount of returned values.Defaults to 50.
    """

    query = f"""
select h.id,hl.id, h.navn , h.beskrivelse ,  o.navn , h.kunde_epost , k.navn , h.gateadresse , h.status , h.behandlingsfrist , h.fra_dato, h.til_dato  
from {Table.CABLE_MEASUREMENT_INQUIERY.value} hl
inner join {Table.INQUIERY.value} h ON h.id = hl.henvendelse_id
inner join {Table.ORGANIZATION.value} o ON o.id = h.organisasjon_id
inner join {Table.MUNICIPALITY.value} k ON k.id = h.kommune_id
limit {limit}
"""

    cursor.execute(query)
    return cursor.fetchall()


def query_cable_measurements_by_inquiery(cursor, inquiery_id, limit: int = 50):
    """A method for querying the cable measurements table with a corresponding inquiery id.

    Args:
        cursor (A Cursor object which allows Python code to execute PostgreSQL command in a database session.):
        limit (int, optional): A limit to limit the amount of returned values. Defaults to 50.
        inquiery_id (int): The id of the cable measurement to query.
    """

    query = f"""
select hl.id, li.id, li.navn, li.metadata, li.geojson,  st_asgeojson(geom)
from {Table.CABLE_MEASUREMENT.value} li
inner join {Table.CABLE_MEASUREMENT_INQUIERY.value} hl ON hl.id = li.henvendelse_ledningsmaaling_id
inner join {Table.GEOMETRY.value} g ON g.henvendelse_id = hl.henvendelse_id
inner join {Table.INQUIERY.value} h ON h.id = hl.henvendelse_id
limit {limit}
"""

    cursor.execute(query)
    return cursor.fetchall()