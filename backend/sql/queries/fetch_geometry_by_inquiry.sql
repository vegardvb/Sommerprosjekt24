/**
 * Fetches the geometry data for a specific inquiry ID from the 'henvendelse' and 'geometri' tables.
 *
 * @param inquiryId The ID of the inquiry for which to fetch the geometry data.
 */
select h.id as inquiry_id , st_asgeojson(st_collect(g.geom)) as geometry
from henvendelse h 
inner join cable_measurements_by_inquiry_and_inquiry_cable as cables on cables.inquiry_id = h.id
inner join geometri g ON g.henvendelse_id = h.id 
WHERE h.id = :inquiry_id
group by h.id
limit 50;
