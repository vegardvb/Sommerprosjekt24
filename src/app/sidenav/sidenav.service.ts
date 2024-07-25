import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidenavService {
  private apiUrl = 'http://localhost:8000'; // Replace with your backend URL

  readonly sidenavMinWidth = 250;
  readonly sidenavMaxWidth = window.innerWidth - 300;

  constructor(private http: HttpClient) {}

  get sidenavWidth(): number {
    return parseInt(
      getComputedStyle(document.body).getPropertyValue('--sidenav-width'),
      10
    );
  }

  setSidenavWidth(width: number) {
    const clampedWidth = Math.min(
      Math.max(width, this.sidenavMinWidth),
      this.sidenavMaxWidth
    );

    document.body.style.setProperty('--sidenav-width', `${clampedWidth}px`);
  }

  updateHeight(
    id: number,
    hoyde: number,
    lat: number,
    lon: number
  ): Observable<unknown> {
    const payload = { hoyde, lat, lon };
    return this.http
      .put(`${this.apiUrl}/update-coordinates/${id}`, payload)
      .pipe(catchError(this.handleError));
  }
  private handleError(error: Error): Observable<never> {
    console.error('An error occurred:', error.message);
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
}
