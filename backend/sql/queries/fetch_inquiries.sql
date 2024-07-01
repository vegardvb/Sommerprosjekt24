

/**
 * Retrieves information about inquiries and their related measurements.
 *
 * @return The result set containing the following columns:
 *         - inquiry_id: The ID of the inquiry
 *         - inquiry_measurement_id: The ID of the inquiry measurement
 *         - name: The name of the inquiry
 *         - description: The description of the inquiry
 *         - organization: The name of the organization associated with the inquiry
 *         - mail: The email address of the customer
 *         - municipality: The name of the municipality
 *         - address: The address of the inquiry
 *         - status: The status of the inquiry
 *         - processing_deadline: The processing deadline of the inquiry
 *         - start_date: The start date of the inquiry
 *         - end_date: The end date of the inquiry
 *         - number_of_measurements: The number of measurements related to the inquiry
 */
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
select h.id as inquiry_id , hl.id as inquiry_measurement_id , h.navn as name, h.beskrivelse as description,  
o.navn as organization , h.kunde_epost as mail, 
k.navn as municipality, h.gateadresse as address, h.status , 
h.behandlingsfrist as processing_deadline , h.fra_dato as start_date, h.til_dato  as end_date,cable_measurements.number_of_measurements
from henvendelse_ledningsmaaling hl 
inner join henvendelse h ON h.id = hl.henvendelse_id
--- Include the number of measurements related to the inquiry as a sub-query
inner join(/*cable_measurements*/) as cable_measurements on cable_measurements.inquiry_id = h.id
inner join organisasjon o ON o.id = h.organisasjon_id
inner join kommune k ON k.id = h.kommune_id
order by inquiry_id desc



