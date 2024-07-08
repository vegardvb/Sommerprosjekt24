/*Creates a view for all cable measurements related to inquiries*/
-- CREATE VIEW
--     measurements_by_inquiry_and_inquiry_measurement AS
SELECT
    measurement.id AS measurement_id,
    inquiry.id AS inquiry_id,
    inquiry_measurement.id AS inquiry_measurement_id
FROM
    measurement measurement
    INNER JOIN inquiry_measurement inquiry_measurement ON inquiry_measurement.id = measurement.inquiry_measurement_id
    INNER JOIN inquiry inquiry ON inquiry.id = inquiry_measurement.inquiry_id
ORDER BY
    measurement.id