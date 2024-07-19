/*Create views for all psuedo tables */
CREATE MATERIALIZED VIEW "Inquiry" AS
SELECT PUBLIC.henvendelse.id              AS id,
       PUBLIC.henvendelse.navn            AS name,
       PUBLIC.henvendelse.beskrivelse     AS description,
       PUBLIC.henvendelse.status          AS status,
       PUBLIC.henvendelse.fra_dato        AS start_date,
       PUBLIC.henvendelse.til_dato        AS end_date,
       PUBLIC.henvendelse.gateadresse     AS address,
       PUBLIC.henvendelse.kommune_id      AS municipality_id,
       PUBLIC.henvendelse.organisasjon_id AS organization_id
FROM PUBLIC.henvendelse