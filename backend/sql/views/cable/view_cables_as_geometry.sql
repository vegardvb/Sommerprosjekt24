--TODO optimize query
CREATE VIEW
    cables_as_geometry AS
SELECT measurement.id,
       PUBLIC.ST_MakeLine(point.geom)
FROM "Measurement" measurement
         INNER JOIN "Measurement_Point" link ON link.measurement_id = measurement.id
         INNER JOIN "Point" point ON point.id = link.point_id ) AS cable_geojson
WHERE
/*    All measurements with more than one measurement point */
    measurement.id IN (SELECT measurement.id
                       FROM "Point" point
                                INNER JOIN "Measurement_Point" link ON link.point_id = point.id
                                INNER JOIN "Measurement" measurement ON measurement.id = link.measurement_id
                       GROUP BY measurement.id
                       HAVING COUNT(point.id) > 1)
GROUP BY measurement.id
ORDER BY measurement.id
