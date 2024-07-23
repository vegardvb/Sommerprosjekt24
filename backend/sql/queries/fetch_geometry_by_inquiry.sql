/**
 * Fetches the geometry data for a specific inquiry ID from the 'henvendelse' and 'geometri' tables.
 *
 * @param inquiryId The ID of the inquiry for which to fetch the geometry data.
 */
SELECT
    h.id AS inquiry_id,
    st_asgeojson (
        st_collect (st_transform (g.geom, 4326))
    ) AS geometry
FROM henvendelse h
    INNER JOIN geometri g ON g.henvendelse_id = h.id
WHERE
    h.id =:inquiry_id
GROUP BY
    h.id;