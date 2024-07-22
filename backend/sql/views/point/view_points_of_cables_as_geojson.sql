CREATE OR REPLACE VIEW "Points_of_Cables_as_GeoJSON_3D" AS
SELECT
    measurement_point.measurement_id AS cable_measurement_id,
    json_build_object(
        'type',
        'FeatureCollection',
        'features',
        json_agg(
            json_build_object(
                'type',
                'Feature',
                'properties',
                json_build_object(
                    'point_id',
                    point.id,
                    'measurement_id',
                    measurement_point.measurement_id,
                    'metadata',
                    point.metadata
                ),
                'geometry',
                point_coords.point_geojson
            )
        )
    ) AS cable_points_geojson
FROM
    "Measurement_Point" measurement_point -- Filters table to measurements of cables
    RIGHT JOIN "Cables_by_Measurement" cable ON cable.cable_measurement_id = measurement_point.measurement_id
    INNER JOIN "Point" point ON point.id = measurement_point.point_id
    INNER JOIN "Point_coordinates_with_height" point_coords ON point_coords.id = point.id -- Adds point details to remaining measurements
GROUP BY
    measurement_point.measurement_id