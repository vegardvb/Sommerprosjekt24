import { Injectable, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  ScreenSpaceEventHandler,
  Entity,
  Viewer,
  Cartesian2,
  PointPrimitive,
  Billboard,
  Polyline,
  ScreenSpaceEventType,
  defined,
  ConstantProperty,
  Cartesian3,
  ConstantPositionProperty,
} from 'cesium';
import { ImageDialogComponent } from '../components/image-dialog.component';
import { SidenavService } from '../sidenav/sidenav.service';
import { ImageService } from './image/image.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class CesiumInteractionService {
  private handler: ScreenSpaceEventHandler | undefined;
  public selectedEntityChanged = new EventEmitter<Entity>();
  public entityUpdated = new EventEmitter<void>();

  private selectedEntity: Entity | undefined;
  public clickedPointId: number | null = null;
  public isEditing: boolean = false;

  @Output() editingToggled = new EventEmitter<boolean>();

  constructor(
    private dialog: MatDialog,
    private imageService: ImageService,
    private sidenavService: SidenavService,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Toggles the editing state and emits the new state.
   */
  toggleEditing() {
    this.isEditing = !this.isEditing;
    this.editingToggled.emit(this.isEditing);
  }

  /**
   * Sets up the click handler for the Cesium viewer.
   * Handles picking objects from the scene on click and performs actions based on the type of object picked.
   * @param viewer The Cesium viewer instance.
   */
  setupClickHandler(viewer: Viewer): void {
    // Ensure that the handler is cleaned up if it was previously set
    this.dispose();

    this.handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
    this.handler.setInputAction((movement: { position: Cartesian2 }) => {
      try {
        const pickedObject = viewer.scene.pick(movement.position);

        if (!pickedObject) {
          this.deselectEntity();
          return;
        }

        if (pickedObject.primitive) {
          if (pickedObject.primitive instanceof PointPrimitive) {
            this.handlePointClick(pickedObject);
          } else if (pickedObject.primitive instanceof Billboard) {
            this.handleImageClick(pickedObject);
          } else if (pickedObject.primitive instanceof Polyline) {
            this.handlePolylineClick(pickedObject);
          }
        }
      } catch (error) {
        console.error('Error handling click event', error);
        this.snackBar.open(
          'An error occurred while processing the click event.',
          'Close',
          { duration: 3000, panelClass: ['custom-snackbar-container'] }
        );
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  }

  /**
   * Deselects the currently selected entity and emits the change.
   */
  private deselectEntity(): void {
    this.selectedEntity = undefined;
    this.selectedEntityChanged.emit(undefined);
  }

  /**
   * Handles the click event on a point primitive.
   * Updates the selected entity and emits the change.
   * @param pickedObject The picked object containing the point primitive and its ID.
   */
  private handlePointClick(pickedObject: {
    primitive: PointPrimitive;
    id: Entity;
  }): void {
    try {
      if (defined(pickedObject)) {
        this.selectedEntity = pickedObject.id as Entity;
        this.clickedPointId =
          this.selectedEntity?.properties?.['point_id']?._value;
        this.selectedEntityChanged.emit(this.selectedEntity);
      }
    } catch (error) {
      console.error('Error handling point click', error);
      this.snackBar.open('Error selecting point', 'Close', {
        duration: 3000,
        panelClass: ['custom-snackbar-container'],
      });
    }
  }

  /**
   * Handles the click event on a billboard.
   * Opens an image dialog with the associated image.
   * @param pickedObject The picked object containing the billboard and its ID.
   */
  private handleImageClick(pickedObject: {
    primitive: Billboard;
    id: Entity;
  }): void {
    try {
      if (pickedObject.id && pickedObject.id.properties) {
        const braArkivId =
          pickedObject.id.properties['bra_arkiv_id'].getValue();
        this.showImage(braArkivId);
      }
    } catch (error) {
      console.error('Error handling image click', error);
      this.snackBar.open('Error displaying image', 'Close', {
        duration: 3000,
        panelClass: ['custom-snackbar-container'],
      });
    }
  }

  /**
   * Handles the click event on a polyline.
   * Updates the selected entity and emits the change.
   * @param pickedObject The picked object containing the polyline and its ID.
   */
  private handlePolylineClick(pickedObject: {
    primitive: Polyline;
    id: Entity;
  }): void {
    try {
      if (defined(pickedObject)) {
        this.selectedEntity = pickedObject.id as Entity;
        this.selectedEntityChanged.emit(this.selectedEntity);
      }
    } catch (error) {
      console.error('Error handling polyline click', error);
      this.snackBar.open('Error selecting polyline', 'Close', {
        duration: 3000,
        panelClass: ['custom-snackbar-container'],
      });
    }
  }

  /**
   * Updates the visibility of point entities based on the selected entity.
   * If the selected entity is a polyline, it shows all points.
   * @param selectedEntity The selected entity.
   * @param pointEntities The array of point entities.
   */
  updatePointVisibility(selectedEntity: Entity, pointEntities: Entity[]): void {
    try {
      if (selectedEntity) {
        pointEntities.forEach(pointEntity => {
          if (pointEntity.point) {
            pointEntity.point.show = new ConstantProperty(true);
          }
        });
      } else {
        pointEntities.forEach(pointEntity => {
          if (pointEntity.point) {
            pointEntity.point.show = new ConstantProperty(false);
          }
        });
      }
    } catch (error) {
      console.error('Error updating point visibility', error);
      this.snackBar.open('Error updating point visibility', 'Close', {
        duration: 3000,
        panelClass: ['custom-snackbar-container'],
      });
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
      this.snackBar.open('Failed to load image URL', 'Close', {
        duration: 3000,
        panelClass: ['custom-snackbar-container'],
      });
    }
  }

  /**
   * Updates the coordinates of the selected entity.
   * Communicates the change to the server and updates the view accordingly.
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
            this.snackBar.open('Coordinates updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['custom-snackbar-container'],
            }); // Show MatSnackBar
            this.entityUpdated.emit();
          },
          error: (error: Error) => {
            console.error('Error updating coordinates', error);
            this.snackBar.open('Error updating coordinates', 'Close', {
              duration: 3000,
              panelClass: ['custom-snackbar-container'],
            }); // Show error MatSnackBar
          },
        });
        this.toggleEditing();
      } else {
        console.error('Invalid entity ID');
        this.snackBar.open('Invalid entity ID', 'Close', {
          duration: 3000,
          panelClass: ['custom-snackbar-container'],
        });
      }
    } else {
      console.error('No entity selected for updating coordinates');
      this.snackBar.open(
        'No entity selected for updating coordinates',
        'Close',
        { duration: 3000, panelClass: ['custom-snackbar-container'] }
      );
    }
  }

  /**
   * Disposes of the current click handler, if it exists.
   * Cleans up resources to prevent memory leaks.
   */
  dispose(): void {
    if (this.handler) {
      this.handler.destroy();
      this.handler = undefined;
    }
  }
}
