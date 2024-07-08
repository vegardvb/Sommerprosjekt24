/**
 * Fetches cable measurements by inquiry ID.
 *
 * @param inquiry_id The ID of the inquiry.
 */

select *,  st_asgeojson(st_transform(st_setsrid(st_geomfromgeojson(metadata::json->>'geometry'), 32633), 4326)) as geometry , metadata as old_geometry
from cable_measurements_by_inquiry_and_inquiry_cable as cables
where inquiry_id = :inquiry_id
-- where inquiry_cable_id = 178




