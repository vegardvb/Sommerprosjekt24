/* 
Hente ut datapunkter med geometri

Punkter er gitt i sekvenser som er relatert til en ledningsmåling. Kan
derfor hente ut ledningsmålinger basert på rekkefølge i sekvens.

En sekvens er relatert til en ledningsmåling som skiller målingene
fra hverandre.

En sekvens av punkter gjøres til en Line dersom det er flere enn 1 punkt.
Bør lages til en view. 

Disse samles til en geometry collection 

 */
SELECT
    lednings_punkter.id,
    henvendelse_ledning.id,
    st_asgeojson (lednings_punkter.geom) as geometry,
    st_asgeojson (lednings_punkter.survey_geom) as survey
FROM
    ledningsmaaling_innmaaling_punkt lednings_punkter
    --- Henter ut relasjoner mellom punkter og lednings målinger
    INNER JOIN ledningsmaaling_innmaaling_kobling kobling ON kobling.ledningsmaaling_innmaaling_punkt_id = lednings_punkter.id
    INNER JOIN ledningsmaaling_innmaaling ledningsmaaling ON ledningsmaaling.id = kobling.ledningsmaaling_innmaaling_id
    --- Relatere ledningsmåling til henvendelse
    INNER JOIN henvendelse_ledningsmaaling henvendelse_ledning on henvendelse_ledning.id = ledningsmaaling.henvendelse_ledningsmaaling_id
    -- WHERE henve.id = :inquiry_id
ORDER BY
    henvendelse_ledning.id
limit
    100