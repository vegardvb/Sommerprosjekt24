/**
 * Fetches GeoJSON data for a specific inquiry ID which includes a Bounding box (Polygon)
 * of the total area as a boundary.
 *
 * @param inquiry_id The ID of the inquiry for which to fetch the geometry data.
 **/
SELECT
        inquiry.id,
        json_build_object(
                'type',
                'Feature',
                'properties',
                json_build_object(
                        'center',
                        public.st_centroid(
                                public.st_envelope(
                                        public.st_collect(
                                                measurement_geometry.geometry,
                                                area_geometry.geometry
                                        )
                                )
                        )
                ),
                'geometry',
                public.st_asgeojson(
                        public.st_envelope(
                                public.st_collect(
                                        measurement_geometry.geometry,
                                        area_geometry.geometry
                                )
                        )
                ) :: jsonb
        ) AS geojson
FROM
        "Inquiry" inquiry
        INNER JOIN "Geometry_from_Area_by_Inquiry_as_geometry" area_geometry ON area_geometry.inquiry_id = inquiry.id
        INNER JOIN "Geometry_from_Measurement_by_Inquiry" measurement_geometry ON measurement_geometry.inquiry_id = inquiry.id
WHERE
        inquiry.id = :inquiry_id