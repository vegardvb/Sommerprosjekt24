import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-geojson-drop',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './geojson-drop.component.html',
  styleUrl: './geojson-drop.component.scss',
})
export class GeojsonDropComponent {
  allowDrop!: boolean;
  geojson!: string;
  @Output() geoJsonUpload = new EventEmitter<string>();

  toggleGeoJSONtextfield() {
    this.allowDrop = !this.allowDrop;
    this.allowDropToggled.emit(this.allowDrop);
  }

  uploadGeoJSON() {
    this.geoJsonUpload.emit(this.geojson);
  }
}
