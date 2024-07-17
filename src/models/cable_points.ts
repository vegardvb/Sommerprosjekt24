export interface CablePoints {
  inquiry_id: number;
  geojson: {
    type: 'FeatureCollection';
    features: {
      type: 'Feature';
      properties: {
        point_id: number;
        measurement_id: number;
        metadata: {
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
      };
      geometry: {
        type: 'Point';
        coordinates: number[];
      };
    }[];
  }[];
}
