/**
 * Fetches cable measurements by inquiry ID.
 *
 * @param inquiry_id The ID of the inquiry.
 */
select *
from
    cable_measurements_by_inquiry_and_inquiry_cable as cables
where
    cables.inquiry_id =:inquiry_id