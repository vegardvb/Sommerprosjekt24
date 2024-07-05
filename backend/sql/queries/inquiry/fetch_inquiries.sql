-- Tables stor og gul, variabler liten og rød
-- SET
--     search_path TO analytics_cable_measurement_inquiries;
SELECT DISTINCT
    inquiry.id AS inquiry_id,
    inquiry_measurement.id AS inquiry_measurement_id,
    inquiry.name AS name,
    inquiry.description AS description,
    organization.name AS organization,
    municipality.name AS municipality,
    inquiry.adress AS address,
    inquiry.status,
    inquiry.start_date AS start_date,
    inquiry.end_date AS end_date,
    cable_measurements.number_of_measurements
FROM
    inquiry inquiry
    INNER JOIN inquiry_measurement inquiry_measurement ON inquiry.id = inquiry_measurement.inquiry_id
    -- Include the number of measurements related to the inquiry as a sub-query
    INNER JOIN (/*cable_measurements*/) AS cable_measurements ON cable_measurements.inquiry_id = inquiry.id
    INNER JOIN organization organization ON organization.id = inquiry.organization_id
    INNER JOIN municipality municipality ON municipality.id = inquiry.municipality_id
    INNER JOIN geometry geometry ON geometry.inquiry_id = inquiry.id
ORDER BY
    inquiry_id desc