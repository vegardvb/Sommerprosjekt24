CREATE VIEW "Measurements_as_GeoJSON_3D" AS (
    SELECT
        measurement_id AS measurement_id,
        point_geojson :: jsonb
    FROM
        "Standalone_Points_by_Measurement_as_GeoJSON"
)
UNION
ALL (
    SELECT
        cable_measurement_id AS measurement_id,
        cable_geojson :: jsonb
    FROM
        "Cables_as_GeoJSON_3D"
)
ORDER BY
    measurement_id