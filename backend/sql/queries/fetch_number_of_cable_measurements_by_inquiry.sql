/*
 This query retrieves the number of cable measurements for each inquiry 
 */
SELECT
    cables.inquiry_id,
    cables.inquiry_cable_id,
    COUNT(cables.inquiry_id) AS number_of_measurements
FROM
    cable_measurements_by_inquiry_and_inquiry_cable AS cables
GROUP BY
    cables.inquiry_id,
    cables.inquiry_cable_id;