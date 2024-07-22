SELECT inquiry.id, json_build_object(
        'type', 'Feature', 'properties', json_build_object(), 'geometry', public.st_asgeojson (geometry)::jsonb
    ) AS geojson
FROM
    "Inquiry" inquiry
    INNER JOIN "Geometry_from_Area_by_Inquiry_as_geometry" geometry ON geometry.inquiry_id = inquiry.id
WHERE
    inquiry.id =:inquiry_id;