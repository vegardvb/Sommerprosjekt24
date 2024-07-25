WITH converted AS (
    SELECT
        st_asgeojson(
            st_transform(
                ST_GeomFromGeoJSON(geojson :: json ->> 'geometry'),
                4326
            )
        ) as geom
    FROM
        ledningsmaaling_innmaaling
)
SELECT
    geom,
    geojson
FROM
    converted,
    ledningsmaaling_innmaaling;