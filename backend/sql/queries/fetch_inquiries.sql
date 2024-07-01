select h.id as inquiry_id, hl.id as inquiry_measurement_id, h.navn as name, h.beskrivelse as description,  
    o.navn as organization, h.kunde_epost as mail, 
    k.navn as municipality, h.gateadresse as address, h.status, 
    h.behandlingsfrist as processing_deadline, h.fra_dato as start_date, h.til_dato as end_date,
    cable_measurements.number_of_measurements
from henvendelse_ledningsmaaling hl 
inner join henvendelse h ON h.id = hl.henvendelse_id
-- Include the number of measurements related to the inquiry as a sub-query
inner join(/*cable_measurements*/) as cable_measurements on cable_measurements.inquiry_id = h.id
inner join organisasjon o ON o.id = h.organisasjon_id
inner join kommune k ON k.id = h.kommune_id
order by inquiry_id desc



