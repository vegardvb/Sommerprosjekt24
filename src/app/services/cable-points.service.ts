import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CablePoints } from '../../models/cable_points';

/**
 * Service for retrieving cable measurement data.
 */
@Injectable({
  providedIn: 'root',
})
export class CablePointsService {
  // Parser service for converting JSON to GeoJSON

  constructor(private http: HttpClient) {}

  /**
   * Retrieves data for a specific inquiry ID.
   *
   * @param inquiry_id - The ID of the inquiry.
   * @returns An Observable that emits a FeatureCollection.
   */
  getData(inquiry_id: number | undefined): Observable<Array<CablePoints>> {
    const apiUrl = `http://127.0.0.1:8000/geometries/measurements/cable_points/inquiry/${inquiry_id}`;
    return this.http.get<Array<CablePoints>>(apiUrl).pipe(
      map((data: Array<CablePoints>) => {
        return data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Handles the error occurred during the HTTP request.
   *
   * @param error - The error object.
   * @returns An Observable that emits an error.
   */
  private handleError(error: Error): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
