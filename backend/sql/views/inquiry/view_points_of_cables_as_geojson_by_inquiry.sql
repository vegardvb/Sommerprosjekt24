CREATE OR REPLACE VIEW "Points_of_Cables_as_GeoJSON_by_Inquiry" AS
SELECT inquiry_id,
       JSON_AGG(point_cable_geojson.cable_points_geojson)
FROM "Points_of_Cables_as_GeoJSON"            point_cable_geojson
         RIGHT JOIN "Measurements_by_Inquiry" measurement_inquiry
                    ON measurement_inquiry.measurement_id = point_cable_geojson.cable_measurement_id
         RIGHT JOIN "Cables_by_Measurement"   cable_measurements
                    ON cable_measurements.cable_measurement_id = point_cable_geojson.cable_measurement_id
GROUP BY inquiry_id