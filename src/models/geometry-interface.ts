import { ParsedGeometry } from './parsedgeometry-interface';

/**
 * Represents a geometry object that includes an ID and parsed geometry data.
 */
export interface Geometry {
  id: number;
  geojson: ParsedGeometry;
}
