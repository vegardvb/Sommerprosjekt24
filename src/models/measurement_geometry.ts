/**
 * Represents the geometry of a measurement.
 */
export interface MeasurementGeometry {
  inquiry_id: number;
  geojson: {
    type: 'FeatureCollection';
    features: {
      type: string; // 'Feature'
      geometry: {
        type: string; // 'Point' or 'LineString'
        coordinates: number[] | number[][];
      };
      properties: {
        measurement_id?: number;
        metadata?: {
          x: number;
          y: number;
          lat: number;
          lon: number;
          PDOP: number;
          height: number;
          fixType: string;
          accuracy: number;
          timestamp: number;
          antennaHeight: number;
          numSatellites: number;
          numMeasurements: number;
          verticalAccuracy: number;
        };
        point_id?: number;
      };
    }[];
  };
}
