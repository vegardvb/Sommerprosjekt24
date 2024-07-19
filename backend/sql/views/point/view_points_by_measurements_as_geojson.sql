CREATE
OR REPLACE VIEW "Points_by_Measurement_as_GeoJSON" AS
SELECT
    measurement.id AS measurement_id,
    json_build_object (
        'type',
        'Feature',
        'properties',
        json_build_object ('point_id', point.id, 'metadata', point.metadata),
        'geometry',
        public.st_asgeojson (point.geom)
    ) AS point_geojson
FROM
    "Measurement" measurement
    INNER JOIN "Measurement_Point" link ON link.measurement_id = measurement.id
    INNER JOIN "Point" point ON point.id = link.point_id
WHERE
    measurement.id IN (
        SELECT
            measurement.id
        FROM
            "Point" point
            INNER JOIN "Measurement_Point" link ON link.point_id = point.id
            INNER JOIN "Measurement" measurement ON measurement.id = link.measurement_id
        GROUP BY
            measurement.id
        HAVING
            COUNT(point.id) = 1
    )
ORDER BY
    point.id