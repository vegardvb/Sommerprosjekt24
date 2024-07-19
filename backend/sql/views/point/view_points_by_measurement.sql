CREATE
OR REPLACE VIEW points_by_measurement AS
SELECT
    measurement.id AS point_measurement_id
FROM
    "Measurement" AS measurement
WHERE
    measurement.id NOT IN (
        SELECT
            cable_measurement_id
        FROM
            cables_by_measurement
    )
ORDER BY
    measurement.id;