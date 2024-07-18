import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Geometry } from '../models/geometry-interface';

import proj4 from 'proj4';
import { ParsedGeometry } from '../models/parsedgeometry-interface';

@Injectable({
  providedIn: 'root',
})
export class GeometryService {
  private apiUrl =
    'http://127.0.0.1:8000/geometries/area/boundary/inquiry/{inquiry_id}';
  private parsedGeometry!: ParsedGeometry;

  constructor(private http: HttpClient) {
    // Define the projection
    proj4.defs(
      'EPSG:32633',
      '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs'
    );
  }
  getGeometry(inquiry_id: number | undefined): Observable<Array<Geometry>> {
    const apiUrl = `http://127.0.0.1:8000/geometries/area/boundary/inquiry/${inquiry_id}`;
    return this.http.get<Array<Geometry>>(apiUrl).pipe(
      map((data: Array<Geometry>) => {
        console.log('Processed geometry: ', data);
        return data;
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: Error): Observable<never> {
    console.error('An error occurred', error);
    return throwError('Something bad happened; please try again later.');
    //TODO: Fix depricated error handling
  }
}
