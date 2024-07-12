CREATE OR REPLACE VIEW "Points_of_Cables_as_GeoJSON" AS
SELECT measurement_point.measurement_id AS cable_measurement_id,
       JSON_BUILD_OBJECT('type', 'FeatureCollection', 'features',
                         JSON_AGG(
                                 JSON_BUILD_OBJECT(
                                         'type',
                                         'Feature',
                                         'properties',
                                         JSON_BUILD_OBJECT('point_id', point.id, 'measurement_id',
                                                           measurement_point.measurement_id, 'metadata',
                                                           point.metadata),
                                         'geometry',
                                         PUBLIC.st_asgeojson(point.geom)
                                 ))
       )                                AS cable_points_geojson
FROM "Measurement_Point"                    measurement_point
         -- Filters table to measurements of cables
         RIGHT JOIN "Cables_by_Measurement" cable
                    ON cable.cable_measurement_id = measurement_point.measurement_id
         INNER JOIN "Point"                 point ON point.id = measurement_point.point_id
-- Adds point details to remaining measurements
GROUP BY measurement_point.measurement_id


