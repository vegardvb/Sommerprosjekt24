import { ImageDialogComponent } from '../components/image-dialog.component';
import { ImageService } from './image/image.service';

import { Injectable, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Cartesian2, defined } from 'cesium';
import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Entity,
  PointPrimitive,
  Billboard,
  Viewer,
} from 'cesium';

@Injectable({
  providedIn: 'root',
})
export class CesiumInteractionService {
  private handler!: ScreenSpaceEventHandler;
  public selectedEntityChanged = new EventEmitter<Entity>();

  private selectedEntity: Entity | undefined;
  public clickedPointId: number | null = null;

  constructor(
    private dialog: MatDialog,
    private imageService: ImageService
  ) {}

  /**
   * Sets up the click handler for the Cesium viewer.
   * @param viewer The Cesium viewer object.
   */
  setupClickHandler(viewer: Viewer): void {
    this.handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    this.handler.setInputAction((movement: { position: Cartesian2 }) => {
      const pickedObject = viewer.scene.pick(movement.position);
      if (pickedObject && pickedObject.primitive) {
        if (pickedObject.primitive instanceof PointPrimitive) {
          this.handlePointClick(pickedObject);
        } else if (pickedObject.primitive instanceof Billboard) {
          this.handleImageClick(pickedObject);
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  }

  /**
   * Handles the click event on a point primitive.
   * @param pickedObject The picked object containing the point primitive and its ID.
   */
  private handlePointClick(pickedObject: {
    primitive: PointPrimitive;
    id: Entity;
  }): void {
    if (defined(pickedObject)) {
      this.selectedEntity = pickedObject.id;
      this.clickedPointId =
        this.selectedEntity?.properties?.['point_id']?._value;
      this.selectedEntityChanged.emit(this.selectedEntity);
      console.log('Point clicked:', this.selectedEntity);
      // Additional logic for handling the selected point can be added here
    }
  }

  /**
   * Handles the click event on a billboard.
   * @param pickedObject The picked object containing the billboard and its ID.
   */
  private handleImageClick(pickedObject: {
    primitive: Billboard;
    id: Entity;
  }): void {
    if (pickedObject.id && pickedObject.id.properties) {
      const braArkivId = pickedObject.id.properties['bra_arkiv_id'].getValue();
      this.showImage(braArkivId);
    }
  }

  /**
   * Shows the image associated with the given braArkivId.
   * @param braArkivId The ID of the image in the image service.
   */
  async showImage(braArkivId: string): Promise<void> {
    try {
      const imageUrl = this.imageService.getImageUrl(braArkivId);
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
  dispose(): void {
    if (this.handler) {
      this.handler.destroy();
    }
  }
}
