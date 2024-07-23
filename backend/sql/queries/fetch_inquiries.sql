SELECT
    h.id AS inquiry_id,
    hl.id AS inquiry_measurement_id,
    h.navn AS name,
    h.beskrivelse AS description,
SELECT
    o.navn AS organization,
    h.kunde_epost AS mail,
    k.navn AS municipality,
    h.gateadresse AS address,
    h.status,
    h.behandlingsfrist AS processing_deadline,
    h.fra_dato AS start_date,
    h.til_dato AS end_date
FROM
    henvendelse h
    INNER JOIN henvendelse_ledningsmaaling hl ON hl.henvendelse_id = h.id -- Include the number of measurements related to the inquiry as a sub-query
    INNER JOIN organisasjon o ON o.id = h.organisasjon_id
    INNER JOIN kommune k ON k.id = h.kommune_id
    INNER JOIN geometri g ON g.henvendelse_id = h.id
ORDER BY inquiry_id DESC