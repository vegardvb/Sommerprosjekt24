--TODO Optimalize query
CREATE OR REPLACE VIEW
    "Cables_as_GeoJSON" AS
SELECT cable.cable_measurement_id,
       JSON_BUILD_OBJECT(
               'type',
               'Feature',
               'properties',
               JSON_BUILD_OBJECT('measurement_id', cable.cable_measurement_id),
               'geometry',
               PUBLIC.ST_ASGEOJSON(PUBLIC.ST_MakeLine(point.geom))
       ) AS cable_geojson
FROM "Cables_by_Measurement"            cable
         INNER JOIN "Measurement_Point" link ON link.measurement_id = cable.cable_measurement_id
         INNER JOIN "Point"             point ON point.id = link.point_id
GROUP BY cable.cable_measurement_id
ORDER BY cable.cable_measurement_id