import { Injectable } from '@angular/core';
import { Cartesian3, Math as CesiumMath } from 'cesium';

@Injectable({
  providedIn: 'root',
})
export class CesiumUtilityService {
  convertBearingToRadians(bearing: number): number {
    return CesiumMath.toRadians(bearing);
  }

  createPositionFromDegrees(
    longitude: number,
    latitude: number,
    height: number = 0
  ): Cartesian3 {
    return Cartesian3.fromDegrees(longitude, latitude, height);
  }

  // Other utility methods...
}
