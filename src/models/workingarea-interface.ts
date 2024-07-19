/**
 * Represents the parsed geometry of a working area.
 */
export interface ParsedGeometry {
  type: string;
  properties: {
    center: {
      coordinates: number[];
      type: string;
    };
  };
  geometry: {
    coordinates: number[][][];
    type: string;
  };
}
