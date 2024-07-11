SELECT inquiry_id,
       JSON_BUILD_OBJECT(
               'type',
               'FeatureCollection',
               'features',
               JSON_AGG(measurements_as_geojson.point_geojson)
       ) AS geojson
FROM "Measurements_by_Inquiry"                measurement_by_inquiry
         INNER JOIN "Measurements_as_GeoJSON" measurements_as_geojson
                    ON measurements_as_geojson.measurement_id = measurement_by_inquiry.measurement_id
WHERE inquiry_id = :inquiry_id
GROUP BY inquiry_id
ORDER BY inquiry_id
