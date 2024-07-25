import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DetectionImage } from '../../../models/detection_models';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private imageApiUrl =
    'http://10.254.12.157/braarkivfsapi/files/geomelding_demo/';
  private databaseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  /**
   * Retrieves the images associated with a specific inquiry.
   * @param inquiryId - The ID of the inquiry.
   * @returns An Observable that emits an array of DetectionImage objects.
   */
  getImagesByInquiry(
    inquiryId: number | undefined
  ): Observable<DetectionImage[]> {
    return this.http.get<DetectionImage[]>(
      `${this.databaseUrl}/images/inquiry/${inquiryId}`
    );
  }

  /**
   * Generates the URL for a specific image based on its braArkivId.
   * @param braArkivId - The ID of the image in the braarkivfsapi.
   * @returns The URL of the image.
   */
  getImageUrl(braArkivId: string): string {
    return `${this.imageApiUrl}${braArkivId}`;
  }
}
