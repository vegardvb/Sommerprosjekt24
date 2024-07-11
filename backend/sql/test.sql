-- SELECT
--     json_agg (geojson)
-- FROM
--     (
--         (
--             SELECT
--                 json_agg (point_geojson)
--             FROM
--                 points_as_geojson
--         )
--         UNION ALL
--         (
--             SELECT
--                 json_agg (cable_geojson)
--             FROM
--                 cables_as_geojson
--         )
--     ) AS geojson
-- SELECT
--     json_build_array (point_geojson,cable_geojson)
-- FROM
--     points_as_geojson,
--     cables_as_geojson
-- SELECT
--     all_measurements.inquiry_measurement_id,
--     json_build_array (points.point_geojson, cables.cable_geojson)
-- FROM
--     all_measurements_by_inquiry_and_inquirymeasurement all_measurements
--     LEFT JOIN points_as_geojson points ON all_measurements.measurement_id = points.id
--     LEFT JOIN cables_as_geojson cables ON all_measurements.cable_measurement_id = cables.id
--     -- FULL JOIN points_as_geojson points ON all_measurements.measurement_id = points.id
--     -- FULL JOIN cables_as_geojson cables ON all_measurements.cable_measurement_id = cables.id
-- WHERE
--     all_measurements.inquiry_id = 5008686
-- GROUP BY
--     inquiry_measurement_id


-- Trenger alle measurement id for en inquiryMeasurement


SELECT
--     inquiry_id, measurements_as_geojson.point_geojson
measurement_by_inquiry.measurement_id,
measurements_as_geojson.point_geojson
-- JSON_BUILD_OBJECT(
--         'type',
--         'FeatureCollection',
--         'features',
--         JSON_AGG(measurements_as_geojson.point_geojson)
-- )
FROM "Measurements_by_Inquiry"                measurement_by_inquiry
         INNER JOIN "Measurements_as_GeoJSON" measurements_as_geojson
                    ON measurements_as_geojson.measurement_id = measurement_by_inquiry.measurement_id
-- WHERE inquiry_id = 5008886
-- GROUP BY inquiry_id
-- ORDER BY inquiry_id










