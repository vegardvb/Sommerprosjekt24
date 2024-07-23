WITH inquiry_data AS (
    SELECT
        id
    FROM
        henvendelse
    WHERE
        id = :inquiry_id
),
ledningsmaaling_data AS (
    SELECT
        id AS ledningsmaaling_id
    FROM
        henvendelse_ledningsmaaling
    WHERE
        henvendelse_id IN (
            SELECT
                id
            FROM
                inquiry_data
        )
),
innmaaling_data AS (
    SELECT
        id AS innmaaling_id
    FROM
        ledningsmaaling_innmaaling
    WHERE
        henvendelse_ledningsmaaling_id IN (
            SELECT
                ledningsmaaling_id
            FROM
                ledningsmaaling_data
        )
),
kobling_data AS (
    SELECT
        ledningsmaaling_innmaaling_punkt_id
    FROM
        ledningsmaaling_innmaaling_kobling
    WHERE
        ledningsmaaling_innmaaling_id IN (
            SELECT
                innmaaling_id
            FROM
                innmaaling_data
        )
),
punkt_data AS (
    SELECT
        id
    FROM
        ledningsmaaling_innmaaling_punkt
    WHERE
        id IN (
            SELECT
                ledningsmaaling_innmaaling_punkt_id
            FROM
                kobling_data
        )
)
SELECT
    ledningsmaaling_innmaaling_bilde.id,
    ST_AsGeoJSON(
        ST_Transform(ledningsmaaling_innmaaling_bilde.geom, 4326)
    ) AS geom,
    vedlegg.bra_arkiv_id,
    vedlegg.beskrivelse,
    vedlegg.bearing
FROM
    ledningsmaaling_innmaaling_bilde
    JOIN vedlegg ON ledningsmaaling_innmaaling_bilde.bra_arkiv_id = vedlegg.bra_arkiv_id
WHERE
    ledningsmaaling_innmaaling_bilde.innmaaling_punkt_id IN (
        SELECT
            id
        FROM
            punkt_data
    );