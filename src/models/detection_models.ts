/**
 * Represents a GeoJSON point.
 */
export interface GeoJSONPoint {
  type: string;
  coordinates: [number, number]; // Assuming all points are [longitude, latitude]
}

/**
 * Represents a detection image.
 */
export interface DetectionImage {
  /**
   * The ID of the image.
   */
  id: number;
  /**
   * The bearing of the image.
   */
  bearing: number | null;
  /**
   * The description of the image.
   */
  beskrivelse: string | null;
  /**
   * The archive ID of the image.
   */
  bra_arkiv_id: string;
  /**
   * The geometry of the image.
   */
  geom: string;
  /**
   * The timestamp of the image.
   */
  tidspunkt: string | null;
  /**
   * The filename of the image.
   */
  filnavn: string;
}
