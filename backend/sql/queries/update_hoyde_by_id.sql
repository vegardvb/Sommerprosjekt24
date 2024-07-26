UPDATE "Point_coordinates_with_height"
SET point_geojson = :point_geojson
WHERE id = :id;
