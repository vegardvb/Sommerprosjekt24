import { ParsedGeometry } from './parsedgeometry-interface';

/**
 * Represents a geometry object.
 */
export interface Geometry {
  id: number;
  geojson: ParsedGeometry;
}
