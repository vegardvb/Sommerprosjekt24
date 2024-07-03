SELECT
    *
FROM
    ledningsmaaling_innmaaling_punkt punkter
    --- Relater punkter til ledningsmålinger
    INNER JOIN ledningsmaaling_innmaaling_kobling kobling ON kobling.ledningsmaaling_innmaaling_punkt_id = punkter.id
    INNER JOIN ledningsmaaling_innmaaling ledningsmaaling ON ledningsmaaling.id = kobling.ledningsmaaling_innmaaling_id
    --- Filtrer ut kabler
GROUP BY
    *
HAVING
    COUNT(punkter.id) = 1