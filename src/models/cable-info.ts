export interface CableInfo {
  properties: {
    point_id: number;
  }
  feature_type: string;
  metadata: {
    objectType: {
      text: string;
      value: string;
      geomType: string;
    } | null;
  } | null;
}
