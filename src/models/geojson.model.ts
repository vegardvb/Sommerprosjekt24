/**
 * Represents metadata associated with a GeoJSON feature.
 */
export interface Metadata {
  x: number;
  y: number;
  lat: number;
  lon: number;
  pdop: number;
  height: number;
  fixType: string;
  accuracy: number;
  timestamp: number;
  imgFileName?: string;
  antennaHeight: number;
  numSatellites: number;
  numMeasurements: number;
  verticalAccuracy: number;
}

/**
 * Represents properties of a GeoJSON feature.
 */
export interface Properties {
  metadata?: Metadata;
  measurement_id?: number;
  point_id?: number;
}

/**
 * Represents the geometry of a GeoJSON feature.
 */
export interface Geometry {
  type: 'Point' | 'LineString' | 'Polygon';
  coordinates: number[] | number[][];
}

/**
 * Represents a GeoJSON feature.
 */
export interface Feature {
  type: 'Feature';
  geometry: Geometry;
  properties: Properties;
}

/**
 * Represents a GeoJSON object.
 */
export interface GeoJSON {
  type: 'FeatureCollection';
  features: Feature[];
}
