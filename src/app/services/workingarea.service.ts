import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


import { Geometry } from '../../models/geometry-interface';

/**
 * Service for retrieving cable measurement data.
 */
@Injectable({
  providedIn: 'root',
})
export class WorkingAreaService {
  // Parser service for converting JSON to GeoJSON


  constructor(private http: HttpClient) {}

  /**
   * Retrieves data for a specific inquiry ID.
   *
   * @param inquiry_id - The ID of the inquiry.
   * @returns An Observable that emits a FeatureCollection.
   */
  getArea(inquiry_id: number | undefined): Observable<Array<Geometry>> {
    const apiUrl = `http://127.0.0.1:8000/geometries/area/working_area/inquiry/${inquiry_id}`;
    return this.http.get<Array<Geometry>>(apiUrl).pipe(
      map((data: Array<Geometry>) => {
        console.log(
          'Processed geometry: ',
          data
        );
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
