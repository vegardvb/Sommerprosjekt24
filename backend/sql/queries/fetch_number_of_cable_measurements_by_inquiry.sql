

/*
This query retrieves the number of cable measurements for each inquiry 
*/
select cables.inquiry_id, cables.inquiry_cable_id, count(cables.inquiry_id) as number_of_measurements
from cable_measurements_by_inquiry_and_inquiry_cable as cables
GROUP BY cables.inquiry_id, cables.inquiry_cable_id