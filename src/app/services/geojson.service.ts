import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, debounceTime } from 'rxjs/operators';
import { GeoJSON, Feature } from '../../models/geojson.model';

interface GeoJSONResponse {
  geojson: GeoJSON[];
}

@Injectable({
  providedIn: 'root',
})
export class GeojsonService {
  private apiUrl =
    'http://127.0.0.1:8000/geometries/measurements/cable_points/inquiry/{inquiry_id}';
  private featuresSubject = new BehaviorSubject<Feature[]>([]);
  public updatedFeatures$ = this.featuresSubject.asObservable();

  constructor(private http: HttpClient) {}

  getData(inquiry_id: number): Observable<void> {
    const url = this.apiUrl.replace('{inquiry_id}', inquiry_id.toString());
    return this.http.get<GeoJSONResponse[]>(url).pipe(
      debounceTime(300),
      map((response: GeoJSONResponse[]) => {
        if (response && response.length > 0 && response[0].geojson) {
          const newFeatures: Feature[] = [];
          response[0].geojson.forEach((geojson: GeoJSON) => {
            newFeatures.push(...geojson.features);
          });
          this.featuresSubject.next(newFeatures);
        } else {
          throw new Error('Invalid GeoJSON response');
        }
      }),
      catchError(this.handleError)
    );
  }

  refreshData(inquiry_id: number): void {
    this.getData(inquiry_id).subscribe({
      error: err => console.error('Error refreshing data:', err),
    });
  }

  getFeatures(): Feature[] {
    return this.featuresSubject.getValue();
  }

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
