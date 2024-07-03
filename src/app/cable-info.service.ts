import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CableInfo } from '../models/cable-info';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CableInfoService {
  private apiUrl =
    'http://127.0.0.1:8000/cable_measurements/inquiry/{inquiry_id}';

  constructor(private http: HttpClient) {}

  getData(inquiry_id: string): Observable<CableInfo[]> {
    const url = this.apiUrl.replace('{inquiry_id}', inquiry_id);
    return this.http.get<CableInfo[]>(url).pipe(catchError(this.handleError));
  }
  private handleError(error: Error): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
