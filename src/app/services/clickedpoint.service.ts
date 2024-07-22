// shared.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClickedPointService {
  private clickedPointIdSource = new BehaviorSubject<number | null>(null);
  clickedPointId$ = this.clickedPointIdSource.asObservable();

  setClickedPointId(pointId: number) {
    this.clickedPointIdSource.next(pointId);
  }
}
