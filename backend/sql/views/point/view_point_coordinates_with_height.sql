CREATE OR REPLACE VIEW "Point_coordinates_with_height" AS
SELECT point.id,
       json_build_object(
               'type', 'Point',
               'coordinates',
               (SELECT jsonb_insert(
                               (public.st_asgeojson(point.geom)::jsonb -> 'coordinates')::jsonb,
                               '{2}',
                               point.metadata::jsonb -> 'height')
                FROM "Point" subpoint
                WHERE subpoint.id = point.id)::jsonb) AS point_geojson
FROM "Point" point;