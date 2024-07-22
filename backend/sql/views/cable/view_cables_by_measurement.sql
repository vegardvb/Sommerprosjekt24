CREATE VIEW "Cables_by_Measurement" AS
SELECT measurement.id AS cable_measurement_id
FROM
    "Point" point
    INNER JOIN "Measurement_Point" link ON link.point_id = point.id
    INNER JOIN "Measurement" measurement ON measurement.id = link.measurement_id
GROUP BY
    measurement.id
HAVING
    COUNT(point.id) > 1
ORDER BY measurement.id;