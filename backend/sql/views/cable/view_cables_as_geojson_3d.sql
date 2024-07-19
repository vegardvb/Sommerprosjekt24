CREATE
OR REPLACE VIEW "Cables_as_GeoJSON_3D" AS
SELECT
    cable.cable_measurement_id,
    json_build_object(
        'type',
        'Feature',
        'properties',
        json_build_object('measurement_id', cable.cable_measurement_id),
        'geometry',
        PUBLIC.st_asgeojson(
            PUBLIC.ST_MakeLine(public.st_geomfromgeojson(point.point_geojson))
        ) :: jsonb
    ) AS cable_geojson
FROM
    "Cables_by_Measurement" cable
    INNER JOIN "Measurement_Point" link ON link.measurement_id = cable.cable_measurement_id
    INNER JOIN "Point_coordinates_with_height" point ON point.id = link.point_id
GROUP BY
    cable.cable_measurement_id
ORDER BY
    cable.cable_measurement_id