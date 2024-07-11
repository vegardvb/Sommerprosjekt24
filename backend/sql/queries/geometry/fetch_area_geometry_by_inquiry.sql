/**
 * Fetches transformed geometry data for a specific inquiry ID including a Bounding box 
 * and its SRID should it differ from the default SRID (WGS84/EPSG4326).
 *
 * @param inquiry_id The ID of the inquiry for which to fetch the geometry data.
 **/
SELECT inquiry.id AS inquiry_id,
       PUBLIC.st_asgeojson(
               PUBLIC.st_transform(PUBLIC.st_collect(geometry.geom), 4326),
               15,
               9
       )          AS geometry
FROM "Inquiry"                 inquiry
         INNER JOIN "Geometry" geometry ON geometry.inquiry_id = inquiry.id
WHERE inquiry.id = :inquiry_id
GROUP BY inquiry.id