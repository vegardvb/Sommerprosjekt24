select h.id , st_asgeojson(g.geom) as geometry
from henvendelse h
inner join geometri g ON g.henvendelse_id = h.id    
WHERE h.id = :inquiry_id
limit 50;