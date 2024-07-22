/*
 This query retrieves the number of cable measurements for each inquiry 
 */
SELECT
    measurements.inquiry_id,
    COUNT(measurements.measurement_id) AS number_of_measurements
FROM
    "Measurements_by_Inquiry" AS measurements
GROUP BY
    measurements.inquiry_id
ORDER BY
    measurements.inquiry_id