import { Injectable } from '@angular/core';
import { CesiumDirective } from './cesium.directive';

@Injectable({
  providedIn: 'root'
})
export class TransparencyService {
  constructor(private cesiumDirective: CesiumDirective) {}

  adjustTransparency(transparencyValue: number) {
    this.setTransparency();
  }
  private async setTransparency() {

    
}
}

