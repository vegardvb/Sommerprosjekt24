import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClickedPointService {
  private clickedPointIdSource = new BehaviorSubject<number | null>(null);
  private latitudeSource = new BehaviorSubject<string | null>(null);
  private longitudeSource = new BehaviorSubject<string | null>(null);
  private zoomTriggerSource = new BehaviorSubject<boolean>(false);

  clickedPointId$ = this.clickedPointIdSource.asObservable();
  latitude$ = this.latitudeSource.asObservable();
  longitude$ = this.longitudeSource.asObservable();
  zoomTrigger$ = this.zoomTriggerSource.asObservable();

  setClickedPointId(pointId: number) {
    this.clickedPointIdSource.next(pointId);
  }

  setLatitude(latitude: string) {
    this.latitudeSource.next(latitude);
  }

  setLongitude(longitude: string) {
    this.longitudeSource.next(longitude);
  }

  triggerZoom() {
    this.zoomTriggerSource.next(true);
  }

  resetZoomTrigger() {
    this.zoomTriggerSource.next(false);
  }

  resetCoordinates() {
    this.clickedPointIdSource.next(null);
    this.latitudeSource.next(null);
    this.longitudeSource.next(null);
    this.resetZoomTrigger();
  }
}
