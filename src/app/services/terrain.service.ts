// terrain-service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TerrainService {
  private baseUrl = 'https://wcs.geonorge.no/skwms1/wcs.hoyde-dtm-nhm-25833';

  constructor(private http: HttpClient) {}

  getTerrain(bbox: string, width: number, height: number): Observable<Blob> {
    const params = {
      SERVICE: 'WCS',
      VERSION: '1.0.0',
      REQUEST: 'GetCoverage',
      FORMAT: 'GeoTIFF',
      COVERAGE: 'nhm_dtm_topo_25833',
      BBOX: bbox,
      CRS: 'EPSG:4326', // Change to EPSG:4326
      RESPONSE_CRS: 'EPSG:4326', // Change to EPSG:4326
      WIDTH: width.toString(),
      HEIGHT: height.toString(),
    };
    const queryParams = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}?${queryParams}`;

    return this.http.get(url, { responseType: 'blob' });
  }
}
