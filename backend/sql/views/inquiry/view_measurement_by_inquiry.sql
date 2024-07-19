CREATE view "Measurements_by_Inquiry" AS
SELECT
    inquiry.id as inquiry_id,
    measurement.id as measurement_id
from
    "Inquiry" inquiry
    inner join "InquiryMeasurement" inquiryMeasurement on inquiryMeasurement.inquiry_id = inquiry.id
    inner join "Measurement" measurement on measurement.inquirymeasurement_id = inquiryMeasurement.id
ORDER BY
    measurement.id