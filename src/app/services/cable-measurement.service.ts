import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { CableMeasurement } from '../../models/cable_measurement';
import { FeatureCollection, Feature, Polygon } from 'geojson';
import { GeojsonParserService } from './geojson-parser.service';
import * as turf from '@turf/turf';

@Injectable({
  providedIn: 'root',
})
export class CableMeasurementService {
  private apiUrl = 'http://127.0.0.1:8000/cable_measurements/inquiry/5001956';
  private geojsonParserService = inject(GeojsonParserService);

  constructor(private http: HttpClient) {}

  getData(): Observable<FeatureCollection> {
    return this.http.get<Array<CableMeasurement>>(this.apiUrl).pipe(
      map((data: Array<CableMeasurement>) => {
        return this.geojsonParserService.filterJSONToGeoJSON(data);
      }),
      catchError(this.handleError)
    );
  }

  init() {
    // test = this.getData().subscribe();
    // console.log(test);
  }

  private handleError(error: Error): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
