CREATE
OR REPLACE VIEW "Geometry_from_Area_by_Inquiry_as_GeoJSON" AS
SELECT
        inquiry.id AS inquiry_id,
        PUBLIC.st_asgeojson(
                PUBLIC.st_transform(PUBLIC.st_collect(geometry.geom), 4326),
                15,
                9
        ) AS geometry
FROM
        "Inquiry" inquiry
        INNER JOIN "Geometry" geometry ON geometry.inquiry_id = inquiry.id
GROUP BY
        inquiry.id