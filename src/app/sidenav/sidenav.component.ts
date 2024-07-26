import {
  Component,
  EventEmitter,
  HostListener,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { SidenavService } from './sidenav.service';
import { SidenavLinkComponent } from './sidenav-link.component';
// import { CableMeasurementInfoComponent } from '../cable-measurement-info/cable-measurement-info.component';
import {
  Entity,
  JulianDate,
  Cartographic,
  Math as CesiumMath,
  Cartesian3,
  ConstantPositionProperty,
} from 'cesium';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CableMeasurementInfoComponent } from '../cable-measurement-info/cable-measurement-info.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * Component for the side navigation bar.
 */
@Component({
  selector: 'app-sidenav',
  standalone: true,
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  encapsulation: ViewEncapsulation.None,

  imports: [
    SidenavLinkComponent,
    CableMeasurementInfoComponent,
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
  ],
})
export class SidenavComponent {
  readonly sidenavMinWidth = 250;
  readonly sidenavMaxWidth = window.innerWidth - 300;
  selectedEntity!: Entity | null;
  longitude: number = 0;
  latitude: number = 0;
  height: number = 0;
  isEditing: boolean = false;
  @Output() editingToggled = new EventEmitter<boolean>();

  /**
   * Gets the current width of the side navigation bar.
   * @returns The width of the side navigation bar.
   */
  get sidenavWidth(): number {
    return parseInt(
      getComputedStyle(document.body).getPropertyValue('--sidenav-width'),
      10
    );
  }

  /**
   * Sets the width of the side navigation bar.
   * @param width - The width to set.
   */
  setSidenavWidth(width: number): void {
    const clampedWidth = Math.min(
      Math.max(width, this.sidenavMinWidth),
      this.sidenavMaxWidth
    );

    document.body.style.setProperty('--sidenav-width', `${clampedWidth}px`);
  }

  resizingEvent = {
    isResizing: false,
    startingCursorX: 0,
    startingWidth: 0,
  };

  constructor(
    public sidenavService: SidenavService,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Starts the resizing of the side navigation bar.
   * @param event - The mouse event.
   */
  startResizing(event: MouseEvent): void {
    this.resizingEvent = {
      isResizing: true,
      startingCursorX: event.clientX,
      startingWidth: this.sidenavService.sidenavWidth,
    };
  }

  /**
   * Updates the selected entity.
   * @param entity - The entity to update.
   */
  updateSelectedEntity(entity: Entity) {
    this.selectedEntity = entity;
    const position = this.selectedEntity.position?.getValue(JulianDate.now());
    if (position) {
      const cartographic = Cartographic.fromCartesian(position);
      this.longitude = CesiumMath.toDegrees(cartographic.longitude);
      this.latitude = CesiumMath.toDegrees(cartographic.latitude);
      this.height = cartographic.height;
    }
  }

  /**
   * Clears the selected entity.
   */
  clearSelectedEntity() {
    this.selectedEntity = null;
    this.longitude = 0;
    this.latitude = 0;
    this.height = 0;
  }

  /**
   * Handles the change event for the longitude input.
   * @param event - The change event.
   */
  onLongitudeChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.longitude = Number(inputElement.value);
    this.updateEntityPosition();
  }

  /**
   * Handles the change event for the latitude input.
   * @param event - The change event.
   */
  onLatitudeChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.latitude = Number(inputElement.value);
    this.updateEntityPosition();
  }

  /**
   * Handles the change event for the height input.
   * @param event - The change event.
   */
  onHeightChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.height = Number(inputElement.value);
    this.updateEntityPosition();
    console.log(this.height);
  }
  /**
   * Updates the position of the selected entity.
   * If there is a selected entity, it updates its position based on the longitude, latitude, and height values.
   */
  private updateEntityPosition() {
    if (this.selectedEntity) {
      const newPosition = Cartesian3.fromDegrees(
        this.longitude,
        this.latitude,
        this.height
      );
      this.selectedEntity.position = new ConstantPositionProperty(newPosition);
    }
  }
  /**
   * Toggles the editing mode.
   */
  toggleEditing() {
    this.isEditing = !this.isEditing;
    this.editingToggled.emit(this.isEditing);
  }
  /**
   * Closes the editor.
   */
  closeEditor() {
    this.selectedEntity = null; // Or undefined, depending on how you handle entity selection
    this.isEditing = false;
    this.editingToggled.emit(this.isEditing);
  }

  /**
   * Updates the width of the side navigation bar during resizing.
   * @param event - The mouse event.
   */
  @HostListener('window:mousemove', ['$event'])
  updateSidenavWidth(event: MouseEvent): void {
    // No need to even continue if we're not resizing
    if (!this.resizingEvent.isResizing) {
      return;
    }

    // 1. Calculate how much mouse has moved on the x-axis
    const cursorDeltaX = event.clientX - this.resizingEvent.startingCursorX;

    // 2. Calculate the new width according to initial width and mouse movement
    const newWidth = this.resizingEvent.startingWidth + cursorDeltaX;

    // 3. Set the new width
    this.sidenavService.setSidenavWidth(newWidth);
  }

  saveChanges() {
    const hoyde = this.height as unknown as number;
    const lat = this.latitude as unknown as number;
    const lon = this.longitude as unknown as number;

    if (this.selectedEntity?.properties) {
      const id = this.selectedEntity?.properties?.['point_id']._value; // Assuming each entity has an id
      this.sidenavService.updateCoordinates(id, hoyde, lat, lon).subscribe(
        () => {
          this.snackBar.open('Changes saved successfully', '', {
            duration: 3000,
            panelClass: ['custom-snackbar'],
          });
          window.location.reload();
        },
        () => {
          this.snackBar.open('Error saving changes', '', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['custom-snackbar'],
          });
        }
      );
    }
  }

  /**
   * Stops the resizing of the side navigation bar.
   */
  @HostListener('window:mouseup')
  stopResizing(): void {
    this.resizingEvent.isResizing = false;
  }
}
