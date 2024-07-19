/*Creates a view for all cable measurements related to inquiries*/
CREATE VIEW cable_measurements_by_inquiry_and_inquiry_cable AS
SELECT
    li.id AS cable_id,
    hl.id AS inquiry_cable_id,
    h.id AS inquiry_id,
    li.navn AS feature_type,
    metadata,
    geojson
FROM
    ledningsmaaling_innmaaling li
    INNER JOIN henvendelse_ledningsmaaling hl ON hl.id = li.henvendelse_ledningsmaaling_id
    INNER JOIN henvendelse h ON h.id = hl.henvendelse_id
ORDER BY
    li.id;