import { Injectable } from '@angular/core';
import { FeatureCollection } from 'geojson';
import { CableMeasurement } from '../../models/cable_measurement';

@Injectable({
  providedIn: 'root',
})
export class GeojsonParserService {
  constructor() {}

  filterJSONToGeoJSON(data: Array<CableMeasurement>) {
    const global_feature_collection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };

    data.forEach((cableMeasurement: CableMeasurement) =>
      global_feature_collection.features.push(
        JSON.parse(cableMeasurement.geojson)
      )
    );

    return global_feature_collection;
  }
}
