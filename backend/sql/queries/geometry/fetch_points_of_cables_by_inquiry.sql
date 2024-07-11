SELECT inquiry_id, json_agg as geojson
FROM "Points_of_Cables_as_GeoJSON_by_Inquiry"
WHERE inquiry_id = :inquiry_id