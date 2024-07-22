import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError, map } from 'rxjs';
import { GeoJSON, Feature } from '../models/geojson.model';

@Injectable({
  providedIn: 'root',
})
export class GeojsonService {
  private apiUrl =
    'http://127.0.0.1:8000/geometries/measurements/inquiry/{inquiry_id}';

  private features: Feature[] = [];

  constructor(private http: HttpClient) {}

  getData(inquiry_id: string): Observable<void> {
    const url = this.apiUrl.replace('{inquiry_id}', inquiry_id);
    return this.http.get<Response>(url).pipe(
      map((response: Response) => {
        //console.log('API Response:', response);
        if (
          Array.isArray(response) &&
          response.length > 0 &&
          response[0].geojson
        ) {
          this.processGeoJSON(response[0].geojson as GeoJSON);
        } else {
          throw new Error('Invalid GeoJSON response');
        }
      }),
      catchError(this.handleError)
    );
  }

  private processGeoJSON(geojson: GeoJSON): void {
    this.features = geojson.features;
  }

  getFeatures(): Feature[] {
    return this.features;
  }
  private handleError(error: Error): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(() => new Error('Error'));
  }
}
