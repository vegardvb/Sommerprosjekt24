import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GeoJSON, Feature } from '../../models/geojson.model';

interface GeoJSONResponse {
  geojson: GeoJSON;
}

@Injectable({
  providedIn: 'root',
})
export class GeojsonService {
  private apiUrl =
    'http://127.0.0.1:8000/geometries/measurements/inquiry/{inquiry_id}';

  private features: Feature[] = [];

  constructor(private http: HttpClient) {}

  /**
   * Retrieves GeoJSON data for a specific inquiry ID.
   * @param inquiry_id - The ID of the inquiry.
   * @returns An Observable that emits void when the data is processed.
   */
  getData(inquiry_id: number): Observable<void> {
    const url = this.apiUrl.replace('{inquiry_id}', inquiry_id.toString());
    return this.http.get<GeoJSONResponse[]>(url).pipe(
      map((response: GeoJSONResponse[]) => {
        if (
          Array.isArray(response) &&
          response.length > 0 &&
          response[0].geojson
        ) {
          this.processGeoJSON(response[0].geojson);
        } else {
          throw new Error('Invalid GeoJSON response');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Processes the GeoJSON data and updates the features array.
   * @param geojson - The GeoJSON data to process.
   */
  private processGeoJSON(geojson: GeoJSON): void {
    this.features = geojson.features;
  }

  /**
   * Returns the processed GeoJSON features.
   * @returns An array of GeoJSON features.
   */
  getFeatures(): Feature[] {
    return this.features;
  }

  /**
   * Handles errors during the HTTP request.
   * @param error - The error object.
   * @returns An Observable that emits an error.
   */
  private handleError(error: Error): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(
      () =>
        new Error(
          'An error occurred while fetching GeoJSON data. Please try again later.'
        )
    );
  }
}
