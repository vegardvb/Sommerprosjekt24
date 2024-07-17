export interface Metadata {
  id: string;
  x: number;
  y: number;
  lat: number;
  lon: number;
  PDOP: number;
  height: number;
  fixType: string;
  accuracy: number;
  timestamp: number;
  imgFileName: string;
  antennaHeight: number;
  numSatellites: number;
  numMeasurements: number;
  verticalAccuracy: number;
}

export interface Properties {
  metadata?: Metadata;
  measurement_id?: number;
  point_id?: number;
}

export interface Geometry {
  type: string;
  coordinates: number[] | number[][];
}

export interface Feature {
  type: string;
  geometry: Geometry;
  properties: Properties;
}

export interface GeoJSON {
  type: string;
  features: Feature[];
}
