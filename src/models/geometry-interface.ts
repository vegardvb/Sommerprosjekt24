import { ParsedGeometry } from './parsedgeometry-interface';

export interface Geometry {
  id: number;
  st_asgeojson: string | ParsedGeometry;
}
