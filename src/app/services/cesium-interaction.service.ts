import { Injectable, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Cartesian2, Cartesian3, defined } from 'cesium';
import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  Viewer,
  Entity,
  PointPrimitive,
  Billboard,
  ConstantPositionProperty,
  Polyline,
} from 'cesium';
import { ImageDialogComponent } from '../components/image-dialog.component';
import { SidenavService } from '../sidenav/sidenav.service';
import { ImageService } from './image/image.service';

@Injectable({
  providedIn: 'root',
})
export class CesiumInteractionService {
  private handler!: ScreenSpaceEventHandler;
  public selectedEntityChanged = new EventEmitter<Entity>();
  public entityUpdated = new EventEmitter<void>();

  private selectedEntity: Entity | undefined;
  public clickedPointId: number | null = null;
  public isEditing: boolean = false;

  @Output() editingToggled = new EventEmitter<boolean>();

  constructor(
    private dialog: MatDialog,
    private imageService: ImageService,
    private sidenavService: SidenavService
  ) {}

  toggleEditing() {
    this.isEditing = !this.isEditing;
    this.editingToggled.emit(this.isEditing);
  }

  /**
   * Sets up the click handler for the Cesium viewer.
   * @param viewer The Cesium viewer instance.
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
        } else if (pickedObject.primitive instanceof Polyline) {
          this.handlePolylineClick(pickedObject);
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
      this.selectedEntity = pickedObject.id as Entity;
      this.clickedPointId =
        this.selectedEntity?.properties?.['point_id']?._value;
      this.selectedEntityChanged.emit(this.selectedEntity);
      console.log('Point clicked:', this.selectedEntity);
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
   * Handles the click event on a polyline.
   * @param pickedObject The picked object containing the polyline and its ID.
   */
  private handlePolylineClick(pickedObject: {
    primitive: Polyline;
    id: Entity;
  }): void {
    if (defined(pickedObject)) {
      this.selectedEntity = pickedObject.id as Entity;
      console.log('Polyline clicked:', this.selectedEntity);
      // Additional logic for handling the polyline click can be added here
    }
  }

  /**
   * Shows the image dialog for the given braArkivId.
   * @param braArkivId The ID of the image to show.
   */
  async showImage(braArkivId: string): Promise<void> {
    try {
      const imageUrl = this.imageService.getImageUrl(braArkivId);
      this.dialog.open(ImageDialogComponent, {
        data: { imageUrl },
      });
    } catch (error) {
      console.error('Failed to load image URL', error);
    }
  }

  /**
   * Updates the coordinates of the selected entity.
   * @param lat The latitude of the new position.
   * @param lon The longitude of the new position.
   * @param height The height of the new position.
   */
  updateEntityCoordinates(lat: number, lon: number, height: number): void {
    if (this.selectedEntity) {
      const newPosition = Cartesian3.fromDegrees(lon, lat, height);
      this.selectedEntity.position = new ConstantPositionProperty(newPosition);

      const id = this.selectedEntity.properties?.['point_id']?._value;
      if (id !== undefined) {
        this.sidenavService.updateCoordinates(id, height, lat, lon).subscribe({
          next: () => {
            console.log('Coordinates updated successfully');
            this.entityUpdated.emit();
          },
          error: (error: Error) => {
            console.error('Error updating coordinates', error);
          },
        });
        this.toggleEditing();
      } else {
        console.error('Invalid entity ID');
      }
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
