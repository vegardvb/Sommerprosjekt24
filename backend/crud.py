from sqlalchemy.orm import Session
import models

"""
A collection of queries that retrieve data from the database.
"""


def get_cable_measurement(db: Session, cable_measurement_id: int):
    """
    Returns the cable measurement with the given id

    """
    return (
        db.query(models.CableMeasurement)
        .filter(models.CableMeasurement.id == cable_measurement_id)
        .first()
    )


def get_inquiries(db: Session):
    """
    Returns a subset of inquiries in the database
    """
    return db.query(models.Inquiry).all()
