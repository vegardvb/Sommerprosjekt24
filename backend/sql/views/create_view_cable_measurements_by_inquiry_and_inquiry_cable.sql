 /*Creates a view for all cable measurements related to inquiries*/
create VIEW cable_measurements_by_inquiry_and_inquiry_cable AS
select li.id as cable_id , hl.id as inquiry_cable_id , h.id as inquiry_id, li.navn as feature_type ,metadata, geojson 
from ledningsmaaling_innmaaling li 
inner join henvendelse_ledningsmaaling hl on hl.id = li.henvendelse_ledningsmaaling_id
inner join henvendelse h on h.id = hl.henvendelse_id
order by li.id 


