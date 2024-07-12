SELECT inquiry.id,
       public.st_asgeojson(public.st_envelope(public.st_collect(measurement_geometry.geometry, area_geometry.geometry)))
FROM "Inquiry"                                                  inquiry
         INNER JOIN "Geometry_from_Area_by_Inquiry_as_geometry" area_geometry
                    ON area_geometry.inquiry_id = inquiry.id
         INNER JOIN "Geometry_from_Measurement_by_Inquiry"      measurement_geometry
                    ON measurement_geometry.inquiry_id = inquiry.id
WHERE inquiry.id = 5008886


























