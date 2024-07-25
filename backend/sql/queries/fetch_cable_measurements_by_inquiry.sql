/**
 -- Fetches cable measurements by inquiry ID.
 --
 -- @param inquiry_id The ID of the inquiry.
 -- @return The cable measurements.
 */
SELECT
    *
FROM
    cable_measurements_by_inquiry_and_inquiry_cable AS cables
WHERE
    cables.inquiry_id = :inquiry_id;