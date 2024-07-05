/**
 * Fetches transformed geometry data for a specific inquiry ID from the 'henvendelse' and 'geometri' tables.
 *
 * @param inquiryId The ID of the inquiry for which to fetch the geometry data.
 */
SELECT
    inquiry.id AS inquiry_id,
    public.st_asgeojson (
        PUBLIC.st_transform (PUBLIC.st_collect (geometry.geom), 4326)
    ) AS geometry
FROM
    inquiry inquiry
    INNER JOIN geometry geometry ON geometry.inquiry_id = inquiry.id
    WHERE inquiry.id = :inquiry_id
GROUP BY
    inquiry.id
LIMIT
    50;