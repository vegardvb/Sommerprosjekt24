import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TerrainService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  /**
   * Fetches a GeoTIFF file from the server.
   * @param bbox - The bounding box coordinates as a string.
   * @param width - The width of the GeoTIFF image.
   * @param height - The height of the GeoTIFF image.
   * @returns An Observable that emits an object with the file path.
   */
  fetchGeoTIFF(
    bbox: string,
    width: number,
    height: number
  ): Observable<{ file_path: string }> {
    const url = `${this.apiUrl}/fetch-geotiff?bbox=${bbox}&width=${width}&height=${height}`;
    return this.http
      .get<{ file_path: string }>(url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Processes a GeoTIFF file on the server.
   * @param filePath - The file path of the GeoTIFF file.
   * @returns An Observable that emits an object with the tile set URL.
   */
  processGeoTIFF(filePath: string): Observable<{ tileSetUrl: string }> {
    const url = `${this.apiUrl}/process-geotiff?file_path=${encodeURIComponent(filePath)}`;
    return this.http
      .get<{ tileSetUrl: string }>(url)
      .pipe(catchError(this.handleError));
  }

  /**
   * Handles errors that occur during HTTP requests.
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
