export interface ParsedGeometry {
  type: string;
  crs: {
    type: string;
    properties: {
      name: string;
    };
  };
  coordinates: number[][][][];
}
