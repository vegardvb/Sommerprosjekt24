CREATE VIEW
    cables_by_measurement_as_geometry AS
SELECT
    measurement.id,
    PUBLIC.ST_MakeLine (point.geom) AS cable_geometry
    -- Henter ut eksklusivt ledningsmålinger som inneholder punkter
FROM
    measurement measurement
    INNER JOIN measurement_point link ON link.measurement_id = measurement.id
    INNER JOIN point point ON point.id = link.point_id
WHERE
    measurement.id IN (
        SELECT
            measurement.id
        FROM
            point point
            --- Relater punkter til ledningsmålinger
            INNER JOIN measurement_point link ON link.point_id = point.id
            INNER JOIN measurement measurement ON measurement.id = link.measurement_id
            --- Filtrer ut kabler
        GROUP BY
            measurement.id
        HAVING
            COUNT(point.id) > 1
    )
    -- Alle ledningsmålinger som representerer punkter
GROUP BY
    measurement.id
ORDER BY
    measurement.id