/**
 * Represents metadata associated with a geojson feature.
 */
export interface Metadata {
  id: string;
  x: number;
  y: number;
  lat: number;
  lon: number;
  pdop: number;
  height: number;
  fixType: string;
  accuracy: number;
  timestamp: number;
  imgFileName: string;
  antennaHeight: number;
  numSatellites: number;
  numMeasurements: number;
  verticalAccuracy: number;
  edited: boolean;
}

/**
 * Represents properties of a geojson feature.
 */
export interface Properties {
  metadata?: Metadata;
  measurement_id?: number;
  point_id?: number;
}

/**
 * Represents the geometry of a geojson feature.
 */
export interface Geometry {
  type: string;
  coordinates: number[] | number[][];
}

/**
 * Represents a geojson feature.
 */
export interface Feature {
  type: string;
  geometry: Geometry;
  properties: Properties;
}

/**
 * Represents a geojson object.
 */
export interface GeoJSON {
  type: string;
  features: Feature[];
}
