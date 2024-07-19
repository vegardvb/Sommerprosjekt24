/**
 * Represents a cable measurement.
 */
export interface CableMeasurement {
  cable_measurement_id: number;
  cable_measurement_name: string;
  geojson: string;
  inquiry_cable_id: number;
  metadata: JSON;
}
