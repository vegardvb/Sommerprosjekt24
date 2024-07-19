CREATE
OR REPLACE VIEW "Geometry_from_Measurement_by_Inquiry" AS
SELECT
    inquiry_id,
    public.st_collect(
        public.st_geomfromgeojson(point_geojson :: json ->> 'geometry')
    ) AS geometry
FROM
    "Measurements_as_GeoJSON" measurements_as_geojson
    INNER JOIN "Measurements_by_Inquiry" measurements_by_inquiry ON measurements_by_inquiry.measurement_id = measurements_as_geojson.measurement_id
GROUP BY
    inquiry_id -- SELECT point_geojson
    -- FROM "Measurements_as_GeoJSON"