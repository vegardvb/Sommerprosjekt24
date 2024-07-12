--TODO Sjekke null values hvorfor det skjer? 
--TODO Enkelte instanser av MultiPoint. Hvorfor ikke multistring som andre? Ikke sammensatt målinger?
--TODO Sjekk om null på ny versjon
-- CREATE VIEW
--     Measurement_Inquiry_Geometry AS
SELECT
    measurement_inquiries.inquiry_measurement_id,
    --TODO Bygg som JSON features for kabler med ID som property. Points må legge til metadata
    PUBLIC.st_asgeojson (
        PUBLIC.st_collect (
            -- Bygges som features med properties begge to? Ta heller i geoJSON som egne features som 
            -- er bygd som json objekter også kombiner til feature collection med lednings id som property
            PUBLIC.st_collect (cable.cable_geometry),
            PUBLIC.st_collect (point.point_geometry)
        ),
        15,
        9
    ) AS geometry_collection
FROM
    measurements_by_inquiry_and_inquiry_measurement measurement_inquiries
    LEFT JOIN cables_by_measurement_as_geometry cable ON measurement_inquiries.measurement_id = cable.id
    LEFT JOIN points_by_measurement_as_geometry point ON measurement_inquiries.measurement_id = point.point_id
GROUP BY
    measurement_inquiries.inquiry_measurement_id
ORDER BY
    measurement_inquiries.inquiry_measurement_id