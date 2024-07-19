/**
 * Represents the geometry of a measurement.
 */
export interface MeasurementGeometry {
  id: number;
  geojson: JSON;
}

export interface GeoJSONProperties {
  measurement_id?: number;
  point_id?: number;
}
