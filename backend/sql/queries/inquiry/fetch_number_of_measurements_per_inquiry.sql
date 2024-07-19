/*
This query retrieves the number of cable measurements for each inquiry 
 */
SELECT
    cables.inquiry_id,
    COUNT(cables.measurement_id) AS number_of_measurements
FROM
    measurements_by_inquiry_and_inquiry_measurement AS cables
GROUP BY
    cables.inquiry_id
ORDER BY
    cables.inquiry_id