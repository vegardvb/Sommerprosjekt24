SELECT
    inquiry.id as inquiry_id,
    inquiry_measurement.id as inquiry_measurement_id,
    measurement_inquiry_geometry.geometry_collection as geometry
FROM
    measurement_inquiry_geometry measurement_inquiry_geometry
    INNER JOIN inquiry_measurement inquiry_measurement ON inquiry_measurement.id = measurement_inquiry_geometry.inquiry_measurement_id
    INNER JOIN inquiry inquiry ON inquiry.id = inquiry_measurement.inquiry_id   
WHERE
    inquiry.id = :inquiry_id