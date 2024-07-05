import { ParsedGeometry } from './parsedgeometry-interface';

export interface Geometry {
  id: number;
  geometry: string | ParsedGeometry;
}
