
select hl.id as inquiry_cable_id ,li.id as cable_measurement_id, li.navn as cable_measurement_name, li.metadata, li.geojson
from ledningsmaaling_innmaaling li
inner join henvendelse_ledningsmaaling hl ON hl.id = li.henvendelse_ledningsmaaling_id
inner join geometri g ON g.henvendelse_id = hl.henvendelse_id
inner join henvendelse h ON h.id = hl.henvendelse_id
ORDER BY hl.id
limit 50