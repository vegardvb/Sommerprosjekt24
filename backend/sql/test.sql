-- CREATE OR REPLACE VIEW "Point_coordinates_with_height" AS
-- SELECT point.id,
--        JSONB_INSERT((public.st_asgeojson(geom)::jsonb -> 'coordinates')::jsonb, '{2}',
--                     point.metadata::jsonb -> 'height')
-- FROM "Point" point


SELECT jsonb_set(public.st_asgeojson(geom)::jsonb, '{0}', json_build_object('test', 1)::jsonb)
FROM "Point"



