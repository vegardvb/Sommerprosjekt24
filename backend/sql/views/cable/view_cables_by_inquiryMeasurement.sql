-- CREATE VIEW
--     "TEstingSOmething" AS
SELECT
    inquiry_measurement_id,
    cable_measurement_id
FROM
    measurements_by_inquiry_and_inquiry_measurement miim
    INNER JOIN cables_by_measurement ON cables_by_measurement.cable_measurement_id = miim.measurement_id
ORDER BY
    miim.measurement_id