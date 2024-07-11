CREATE VIEW "Measurements_as_GeoJSON" AS
(SELECT id AS measurement_id, point_geojson
 FROM "Points_by_Measurement_as_GeoJSON")
UNION ALL
(SELECT cable_measurement_id AS measurement_id, cable_geojson
 FROM "Cables_as_GeoJSON")
ORDER BY measurement_id
