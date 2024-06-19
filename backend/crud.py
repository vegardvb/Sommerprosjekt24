from sqlalchemy.orm import Session

import models


def get_cable_measurement(db: Session, cable_measurement_id: int):
    return (
        db.query(models.CableMeasurement)
        .filter(models.CableMeasurement.id == cable_measurement_id)
        .first()
    )
