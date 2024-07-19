-- Finn ut hvor mange measurement_inquiry som er 
-- Sjekk at det stemmer overens med antall measurements
--TODO sjekke null values hvorfor det skjer? 
CREATE VIEW
    measurement_inquiry_geometry AS
SELECT
    -- *
    measurement_inquiries.inquiry_measurement_id,
    PUBLIC.st_asgeojson (
        PUBLIC.st_collect (
            PUBLIC.st_collect (cable.cable_geometry),
            public.st_collect (point.point_geometry)
        )
    ) AS geometry_collection
FROM
    measurements_by_inquiry_and_inquiry_measurement measurement_inquiries
    LEFT JOIN cables_by_measurement_as_geometry cable ON measurement_inquiries.measurement_id = cable.id
    LEFT JOIN points_by_measurement_as_geometry point ON measurement_inquiries.measurement_id = point.point_id
GROUP BY
    measurement_inquiries.inquiry_measurement_id
ORDER BY
    measurement_inquiries.inquiry_measurement_id