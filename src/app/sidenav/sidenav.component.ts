import {
  Component,
  EventEmitter,
  HostListener,
  Output,
  ViewEncapsulation,
  OnInit,
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
import { GeojsonService } from '../services/geojson.service';
import { ActivatedRoute } from '@angular/router';

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
export class SidenavComponent implements OnInit {
  readonly sidenavMinWidth = 250;
  readonly sidenavMaxWidth = window.innerWidth - 300;

  private inquiryId: number | undefined;
  private geoJsonText = '';
  public allowDrop = false;
  public height: number = 0;
  public isEditing: boolean = false;
  public latitude: number = 0;
  public longitude: number = 0;
  public selectedEntity!: Entity | null;

  @Output() editingToggled = new EventEmitter<boolean>();
  @Output() geoJsonUpload = new EventEmitter<object>();

  constructor(
    private route: ActivatedRoute,
    public sidenavService: SidenavService,
    public geojsonService: GeojsonService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
      if (this.inquiryId) {
        // Do something with the inquiryId if needed
      } else {
        console.error('Inquiry ID not found in the query parameters');
      }
    });
  }

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
   * Toggles the visibility of the GeoJSON text field.
   */
  toggleGeoJSONtextfield() {
    this.allowDrop = !this.allowDrop;
  }

  /**
   * Handles the change event of the GeoJSON input element.
   * Updates the `geoJsonText` property with the new value.
   *
   * @param event - The change event object.
   */
  onGeoJsonChange(event: Event) {
    const inputElement = event.target as HTMLTextAreaElement;
    this.geoJsonText = inputElement.value;
  }

  /**
   * Uploads a GeoJSON object to the map.
   * @remarks
   * This method parses the provided GeoJSON text and performs basic validation to check if it's a valid GeoJSON.
   * If the GeoJSON is valid, it emits the `geoJSONObject` using the `geoJsonUpload` event and displays a success message.
   * If the GeoJSON is invalid, it displays an error message.
   */
  uploadGeoJSON() {
    try {
      const geoJSONObject = JSON.parse(this.geoJsonText); //TODO: type geoJsonObject
      const snackBarConfig = {
        duration: 3000,
        panelClass: ['custom-snackbar'],
      };

      // Perform basic validation to check if it's a valid GeoJSON
      if (
        geoJSONObject.type &&
        ((geoJSONObject.type === 'FeatureCollection' &&
          Array.isArray(geoJSONObject.features)) ||
          geoJSONObject.type === 'Feature')
      ) {
        this.geoJsonUpload.emit(geoJSONObject);
        this.snackBar.open('GeoJSON was added to map!', '', snackBarConfig);
      } else {
        throw new Error('Invalid GeoJSON format');
      }
    } catch (error) {
      console.error('Invalid GeoJSON:', error);
      this.snackBar.open('Please enter a valid GeoJSON', '', {
        duration: 3000,
        panelClass: ['custom-snackbar'],
      });
    }
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

  /**
   * Saves the changes made to the selected entity's coordinates.
   */
  saveChanges() {
    const hoyde = this.height;
    const lat = this.latitude;
    const lon = this.longitude;

    if (this.selectedEntity?.properties) {
      const id = this.selectedEntity?.properties?.['point_id']?._value;

      if (id !== undefined) {
        this.sidenavService.updateCoordinates(id, hoyde, lat, lon).subscribe({
          next: () => {
            this.snackBar.open('Changes saved successfully', '', {
              duration: 3000,
              panelClass: ['custom-snackbar'],
            });

            if (this.inquiryId !== undefined) {
              this.geojsonService.refreshData(this.inquiryId);
            }
          },
          error: error => {
            console.error('Error saving changes', error);
            this.snackBar.open('Error saving changes', '', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['custom-snackbar'],
            });
          },
        });
        this.toggleEditing();
      } else {
        console.error('Invalid entity ID');
        this.snackBar.open('Invalid entity selected', '', {
          duration: 3000,
          panelClass: ['custom-snackbar'],
        });
      }
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
