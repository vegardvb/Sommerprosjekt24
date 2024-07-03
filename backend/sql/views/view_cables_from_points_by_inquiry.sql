-- CREATE VIEW points_by_inquiry AS 
--- 
SELECT
    ledningsmaaling.id as cable_measurement_id,
    st_asgeojson (punkter.geom) as point_geometry
    --- Henter ut eksklusivt ledningsmålinger som inneholder punkter
FROM
    ledningsmaaling_innmaaling ledningsmaaling,
    ledningsmaaling_innmaaling_punkt_id pi
    --- Alle ledningsmålinger som representerer punkter
WHERE
    ledningsmaaling.id IN (
        SELECT
            ledningsmaaling.id
        FROM
            ledningsmaaling_innmaaling_punkt punkter
            --- Relater punkter til ledningsmålinger
            INNER JOIN ledningsmaaling_innmaaling_kobling kobling ON kobling.ledningsmaaling_innmaaling_punkt_id = punkter.id
            INNER JOIN ledningsmaaling_innmaaling ledningsmaaling ON ledningsmaaling.id = kobling.ledningsmaaling_innmaaling_id
            --- Filtrer ut kabler
        GROUP BY
            ledningsmaaling.id
        HAVING
            COUNT(punkter.id) = 1
    )