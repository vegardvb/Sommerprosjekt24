import { Injectable } from '@angular/core';
import {
  Viewer,
  Cartesian2,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
} from 'cesium';
import { MatDialog } from '@angular/material/dialog';
import { ImageDialogComponent } from '../components/image-dialog.component';
import { ImageService } from './image/image.service';

/**
 * Service for handling interactions with Cesium.
 */
@Injectable({
  providedIn: 'root',
})
export class CesiumInteractionService {
  private handler!: ScreenSpaceEventHandler;

  constructor(
    private dialog: MatDialog,
    private imageService: ImageService
  ) {}

  /**
   * Sets up the click handler for the Cesium viewer.
   * @param viewer The Cesium viewer.
   */
  setupClickHandler(viewer: Viewer) {
    this.handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    this.handler.setInputAction((movement: { position: Cartesian2 }) => {
      const pickedObject = viewer.scene.pick(movement.position);
      if (pickedObject && pickedObject.id && pickedObject.id.properties) {
        const braArkivId = pickedObject.id.properties.bra_arkiv_id.getValue();
        this.showImage(braArkivId);
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  }

  /**
   * Shows the image dialog with the specified braArkivId.
   * @param braArkivId The braArkivId of the image.
   */
  async showImage(braArkivId: string): Promise<void> {
    try {
      const imageUrl = await this.imageService.getImageUrl(braArkivId);
      this.dialog.open(ImageDialogComponent, {
        data: { imageUrl },
      });
    } catch (error) {
      console.error('Failed to load image URL', error);
      // Handle the error, e.g., show an error message to the user
    }
  }

  /**
   * Disposes the click handler.
   */
  dispose() {
    if (this.handler) {
      this.handler.destroy();
    }
  }
}
