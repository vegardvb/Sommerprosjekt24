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
  private apiUrl = 'http://127.0.0.1:8000/geometries/inquiry/{inquiry_id}';
  private parsedGeometry!: ParsedGeometry;

  constructor(private http: HttpClient) {
    // Define the projection
    proj4.defs(
      'EPSG:32633',
      '+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs'
    );
  }

  getGeometry(inquiry_id: number): Observable<Geometry[]> {
    const url = this.apiUrl.replace('{inquiry_id}', inquiry_id.toString());
    console.log(url);
    return this.http.get<Geometry[]>(url).pipe(
      map(geometries => this.parseAndConvertGeometries(geometries)),
      catchError(this.handleError)
    );
  }

  private parseAndConvertGeometries(geometries: Geometry[]): Geometry[] {
    console.log('Geometry Object', geometries);

    return geometries.map(geometry => {
      this.parseGeoJSON(geometry);

      if (this.parsedGeometry) {
        geometry.geometry = this.parsedGeometry; // Replace geometry with parsed geometry
      }
      console.log('GEOMETRY AFTER', geometry.geometry);
      return geometry;
    });
  }

  private parseGeoJSON(geometry: Geometry): ParsedGeometry | null {
    try {
      this.parsedGeometry = JSON.parse(
        geometry.geometry as string
      ) as ParsedGeometry;
      return this.parsedGeometry;
    } catch (error) {
      console.error('Error parsing geojson:', error);
      return null;
    }
  }

  private handleError(error: Error): Observable<never> {
    console.error('An error occurred', error);
    return throwError('Something bad happened; please try again later.');
  }
}
