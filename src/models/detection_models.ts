import { Timestamp } from 'rxjs';

export interface GeoJSONPoint {
  type: string;
  coordinates: [number, number]; // Assuming all points are [longitude, latitude]
}

export interface DetectionImage {
  id: number;
  bearing: number | null;
  beskrivelse: string | null;
  bra_arkiv_id: string;
  geom: string;
  tidspunkt: Timestamp<number> | null;
  filnavn: string;
}
