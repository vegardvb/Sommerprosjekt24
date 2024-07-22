CREATE OR REPLACE VIEW "Standalone_Points_by_Measurement_as_GeoJSON" AS
SELECT
    measurement.id AS measurement_id,
    json_build_object(
        'type',
        'Feature',
        'properties',
        json_build_object(
            'point_id',
            point.id,
            'metadata',
            point.metadata
        ),
        'geometry',
        point_with_height.point_geojson
    ) AS point_geojson
FROM
    "Measurement" measurement
    INNER JOIN "Measurement_Point" link ON link.measurement_id = measurement.id
    INNER JOIN "Point" point ON point.id = link.point_id
    INNER JOIN "Point_coordinates_with_height" point_with_height ON point_with_height.id = point.id
WHERE
    measurement.id IN (
        SELECT measurement.id
        FROM
            "Point" point
            INNER JOIN "Measurement_Point" link ON link.point_id = point.id
            INNER JOIN "Measurement" measurement ON measurement.id = link.measurement_id
        GROUP BY
            measurement.id
        HAVING
            count(point.id) = 1
    )
ORDER BY point.id