/**
 * Fetches the geometry data for a specific inquiry ID from the 'henvendelse' and 'geometri' tables.
 *
 * @param inquiryId The ID of the inquiry for which to fetch the geometry data.
 */
select h.id , st_asgeojson(g.geom) as geometry
from henvendelse h
inner join geometri g ON g.henvendelse_id = h.id    
WHERE h.id = :inquiry_id
limit 50;
