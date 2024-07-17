select miim.inquiry_measurement_id, array_agg(measurement_id)
from "Measurements_by_Inquiry_and_inquiryMeasurement" miim
         INNER JOIN cables_by_inquirymeasurement cables on cables.inquiry_measurement_id = miim.inquiry_measurement_id
         INNER JOIN points_by_inquirymeasurement points on points.inquiry_measurement_id = miim.inquiry_measurement_id
GROUP BY miim.inquiry_measurement_id


