export interface ParsedGeometry {
  type: string;
  coordinates: number[][][][]; // This represents a MultiPolygon
}