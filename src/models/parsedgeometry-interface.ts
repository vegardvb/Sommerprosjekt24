export interface ParsedGeometry {
  type: string;
  bbox: number[];
  coordinates: number[][][][]; // This represents a MultiPolygon
}