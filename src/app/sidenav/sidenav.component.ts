import { Component, EventEmitter, HostListener, Output, ViewEncapsulation } from '@angular/core';
import { SidenavService } from './sidenav.service';
import { SidenavLinkComponent } from './sidenav-link.component';
import { CableMeasurementInfoComponent } from '../cable-measurement-info/cable-measurement-info.component';
import { Entity, JulianDate, Cartographic, Math as CesiumMath, Cartesian3, ConstantPositionProperty} from 'cesium';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [SidenavLinkComponent, CableMeasurementInfoComponent, ReactiveFormsModule, CommonModule],
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
  

  get sidenavWidth(): number {
    return parseInt(
      getComputedStyle(document.body).getPropertyValue('--sidenav-width'),
      10
    );
  }

  setSidenavWidth(width: number) {
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

  constructor(public sidenavService: SidenavService) {

  }

  startResizing(event: MouseEvent): void {
    this.resizingEvent = {
      isResizing: true,
      startingCursorX: event.clientX,
      startingWidth: this.sidenavService.sidenavWidth,
    };
  }

  updateSelectedEntity(entity: Entity) {
    this.selectedEntity = entity;
    const position = this.selectedEntity.position?.getValue(JulianDate.now());
    if (position) {
      console.log('before cond',position)
      const cartographic = Cartographic.fromCartesian(position);
      this.longitude = CesiumMath.toDegrees(cartographic.longitude);
      this.latitude = CesiumMath.toDegrees(cartographic.latitude);
      this.height = cartographic.height;
    }
  }

  clearSelectedEntity() {
    this.selectedEntity = null;
    this.longitude = 0;
    this.latitude = 0;
    this.height = 0;
  }

  onLongitudeChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.longitude = Number(inputElement.value);
    this.updateEntityPosition();
  }

  onLatitudeChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.latitude = Number(inputElement.value);
    this.updateEntityPosition();
  }

  onHeightChange(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.height = Number(inputElement.value);
    this.updateEntityPosition();
  }

  private updateEntityPosition() {
    if (this.selectedEntity) {
      const newPosition = Cartesian3.fromDegrees(this.longitude, this.latitude, this.height);
      this.selectedEntity.position = new ConstantPositionProperty(newPosition);
      console.log('after text', this.selectedEntity.position)
    

      
    }
  }
  
  toggleEditing() {
    this.isEditing = !this.isEditing;
    this.editingToggled.emit(this.isEditing);
    console.log('toggle dit sidenav', this.editingToggled)
  }

  @HostListener('window:mousemove', ['$event'])
  updateSidenavWidth(event: MouseEvent) {
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

  @HostListener('window:mouseup')
  stopResizing() {
    this.resizingEvent.isResizing = false;
  }
}
