import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Inquiry } from '../models/inquiry-interface';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl = 'http://127.0.0.1:8000/inquiries';

  constructor(private http: HttpClient) {}

  getData(): Observable<Inquiry[]> {
    return this.http
      .get<Inquiry[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: Error): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
