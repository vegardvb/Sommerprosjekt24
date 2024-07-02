import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TerrainService {
  constructor(private http: HttpClient) {}

  /**
   * Fetch the terrain model GeoTIFF data from the backend.
   * @param bbox - Bounding box coordinates.
   * @param width - Width of the bounding box.
   * @param height - Height of the bounding box.
   * @returns Observable of Blob containing GeoTIFF data.
   */
  getTerrain(bbox: string, width: number, height: number): Observable<Blob> {
    return this.http.get(`/api/terrain`, {
      params: {
        bbox: bbox,
        width: width.toString(),
        height: height.toString(),
      },
      responseType: 'blob',
    });
  }
}
