import { Injectable } from '@angular/core';
import { Feature, FeatureCollection } from 'geojson';
import { MeasurementGeometry } from '../../models/measurement_geometry';

/**
 * Service for parsing JSON data into GeoJSON format.
 */
@Injectable({
  providedIn: 'root',
})
export class GeojsonParserService {
  constructor() {}

  /**
   * Filters an array of MeasurementGeometry objects and inserts them into a GeoJSON FeatureCollection.
   * @param data - The array of MeasurementGeometry objects to filter and convert.
   * @returns The GeoJSON FeatureCollection.
   */
  filterJSONToGeoJSON(data: Array<MeasurementGeometry>): FeatureCollection {
    const global_feature_collection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [],
    };

    data.forEach((object: MeasurementGeometry) => {
      // The object geometry
      const geometry = JSON.parse(object.geometry);

      // Feature to encapsulate the geometry
      const feature: Feature = {
        type: 'Feature',
        geometry: geometry,
        //TODO Add metadata to the properties of the feature to allow for editing of properties/attributes
        properties: null,
      };
      global_feature_collection.features.push(feature);
    });

    return global_feature_collection;
  }
}
