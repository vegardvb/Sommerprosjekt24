/**
 * Represents a parsed geometry object with GeoJSON-like structure.
 */
export interface ParsedGeometry {
  type: string;
  properties: {
    center?: {
      coordinates: number[];
      type: string;
    };
  };
  geometry: {
    coordinates: number[][][]; // Adjusted to match MultiPolygon with simpler structure
    type: string;
  };
}
