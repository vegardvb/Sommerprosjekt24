import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GeoJSON, Feature } from '../../models/geojson.model';

interface GeoJSONResponse {
  geojson: GeoJSON[];
}

/**
 * Service for handling GeoJSON data.
 */
@Injectable({
  providedIn: 'root',
})
export class GeojsonService {
  private apiUrl =
    'http://127.0.0.1:8000/geometries/measurements/cable_points/inquiry/{inquiry_id}';

  private featuresSubject = new BehaviorSubject<Feature[]>([]);
  public updatedFeatures$ = this.featuresSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Retrieves GeoJSON data from the server.
   * @param inquiry_id The ID of the inquiry.
   * @returns An Observable that emits void.
   */
  getData(inquiry_id: number): Observable<void> {
    const url = this.apiUrl.replace('{inquiry_id}', inquiry_id.toString());
    return this.http.get<GeoJSONResponse[]>(url).pipe(
      map((response: GeoJSONResponse[]) => {
        if (response && response.length > 0 && response[0].geojson) {
          response[0].geojson.forEach((geojson: GeoJSON) => {
            this.processGeoJSON(geojson);
            console.log('Cable_point_metadata', geojson);
          });
        } else {
          throw new Error('Invalid GeoJSON response');
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Processes the retrieved GeoJSON data.
   * @param geojson The GeoJSON data to process.
   */
  private processGeoJSON(geojson: GeoJSON): void {
    this.featuresSubject.next(geojson.features);
  }

  /**
   * Refreshes the GeoJSON data for a specific inquiry.
   * @param inquiry_id The ID of the inquiry.
   */
  refreshData(inquiry_id: number): void {
    this.getData(inquiry_id).subscribe({
      error: err => console.error('Error refreshing data:', err),
    });
  }

  /**
   * Retrieves the current features.
   * @returns An array of Feature objects.
   */
  getFeatures(): Feature[] {
    return this.featuresSubject.getValue();
  }

  /**
   * Handles errors that occur during data retrieval.
   * @param error The error that occurred.
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
