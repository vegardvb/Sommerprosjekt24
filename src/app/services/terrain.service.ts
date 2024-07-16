import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TerrainService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  fetchGeoTIFF(
    bbox: string,
    width: number,
    height: number
  ): Observable<{ file_path: string }> {
    const url = `${this.apiUrl}/fetch-geotiff?bbox=${bbox}&width=${width}&height=${height}`;
    return this.http.get<{ file_path: string }>(url);
  }

  processGeoTIFF(filePath: string): Observable<{ tilesetUrl: string }> {
    const url = `${this.apiUrl}/process-geotiff?file_path=${encodeURIComponent(filePath)}`;
    return this.http.get<{ tilesetUrl: string }>(url);
  }
}
