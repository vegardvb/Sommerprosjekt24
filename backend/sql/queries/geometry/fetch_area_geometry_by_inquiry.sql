/**
 * Fetches transformed geometry data for a specific inquiry ID which includes a Bounding box (Polygon)
 * of the total area measurementand its SRID should it differ from the default SRID (WGS84/EPSG4326).
 *
 * @param inquiry_id The ID of the inquiry for which to fetch the geometry data.
 **/
SELECT inquiry.id,
       public.st_asgeojson(public.st_envelope(public.st_collect(measurement_geometry.geometry, area_geometry.geometry)))
FROM "Inquiry"                                                  inquiry
         INNER JOIN "Geometry_from_Area_by_Inquiry_as_geometry" area_geometry
                    ON area_geometry.inquiry_id = inquiry.id
         INNER JOIN "Geometry_from_Measurement_by_Inquiry"      measurement_geometry
                    ON measurement_geometry.inquiry_id = inquiry.id

