import { Injectable } from '@angular/core';
import {
  Viewer,
  Cartesian3,
  VerticalOrigin,
  Math as CesiumMath,
  HeightReference,
  Entity,
} from 'cesium';
import { ImageService } from './image.service';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CesiumImageService {
  private billboards: Entity[] = [];

  constructor(private imageService: ImageService) {}

  async loadImages(
    viewer: Viewer,
    inquiryId: number | undefined
  ): Promise<void> {
    if (!inquiryId) return;

    try {
      const images = await lastValueFrom(
        this.imageService.getImagesByInquiry(inquiryId)
      );
      images.forEach(image => {
        const geom = JSON.parse(image.geom);
        const coordinates = geom.coordinates;
        const position = Cartesian3.fromDegrees(coordinates[0], coordinates[1]);

        const entity = viewer.entities.add({
          position: position,
          billboard: {
            image: 'assets/images/Image_bearing_logo.png',
            verticalOrigin: VerticalOrigin.BOTTOM,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            rotation: CesiumMath.toRadians(image.bearing || 0),
            alignedAxis: Cartesian3.UNIT_Z,
          },
          properties: {
            bra_arkiv_id: image.bra_arkiv_id,
            description: image.beskrivelse,
            bearing: image.bearing,
            filnavn: image.filnavn,
          },
        });

        this.billboards.push(entity);
      });
    } catch (error) {
      console.error('Error loading images:', error);
    }
  }

  setBillboardsVisibility(viewer: Viewer, visible: boolean): void {
    this.billboards.forEach(billboard => {
      billboard.show = visible;
    });
  }
}