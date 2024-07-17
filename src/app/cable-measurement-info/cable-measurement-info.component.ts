 import { Component, OnInit } from '@angular/core';
 import { Feature, GeoJSON, Metadata } from '../../models/geojson.model';
 import { ActivatedRoute } from '@angular/router';
 import { CommonModule } from '@angular/common';
 import { TableModule } from 'primeng/table';
 import { FieldsetModule } from 'primeng/fieldset';
 import { TreeTableModule } from 'primeng/treetable';
 import { AccordionModule } from 'primeng/accordion';
import { GeojsonService } from '../geojson.service';

@Component({
  selector: 'app-cable-measurement-info',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FieldsetModule,
    TreeTableModule,
    AccordionModule,
],
  templateUrl: './cable-measurement-info.component.html',
  styleUrls: ['./cable-measurement-info.component.css'],
})


export class CableMeasurementInfoComponent implements OnInit {

  inquiryId: string | null = null;
  measurementIds: number[] = [];
  pointIds: number[] = [];
  metadata: Metadata[] = [];
  type: string[] = []
  features: Feature[] = [];

  constructor(
    private route: ActivatedRoute,
    private geojsonService: GeojsonService
  ) {}

  measurementTypeMap: { [key: number]: string } = {};


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
      if (this.inquiryId) {
        this.fetchGeoJsonData(this.inquiryId);
      } else {
        console.error('Inquiry ID not found in the query parameters');
      }
    });
  }

  fetchGeoJsonData(inquiry_id: string): void {
    this.geojsonService.getData(inquiry_id).subscribe({
      next: () => {

        this.features = this.geojsonService.getFeatures();

      },
      error: error => {
        console.error('Error fetching data:', error);
      },
      complete: () => {},
    });
  }
  
  getHeader(feature: Feature): string {
    return feature.properties.measurement_id !== undefined 
      ? `Measurement ID: ${feature.properties.measurement_id}` 
      : feature.properties.point_id !== undefined 
        ? `Point ID: ${feature.properties.point_id}` 
        : 'ID Not Available';
  }


formatCoordinates(coordinates: number[] | number[][]): string[] {
  if (Array.isArray(coordinates[0])) {
    return (coordinates as number[][]).map(coord => `[${coord.join(', ')}]`);
  } else {
    return [`[${(coordinates as number[]).join(', ')}]`];
  }
}


document.addEventListener('DOMContentLoaded', () => {
  const editableSpan = document.getElementById('editableContent') as HTMLSpanElement | null;
  const editButton = document.getElementById('editButton') as HTMLButtonElement | null;
  const saveButton = document.getElementById('saveButton') as HTMLButtonElement | null;

  if (!editableSpan || !editButton || !saveButton) {
      console.error("One or more required elements are missing.");
      return;
  }

  // Define the types for the custom event listener
  type CustomEventType = 'click' | 'type1';
  type CustomEventListener = (ev: Event | number) => any;

  // Custom addEventListener function
  function addEventListener(type: CustomEventType, listener: CustomEventListener): void {
      if (type === 'click' && listener instanceof Function) {
          document.addEventListener(type, listener as EventListener);
      } else if (type === 'type1' && typeof listener === 'function') {
          // Simulate the custom event type1
          listener(1);
      }
  }

  // Load saved content from local storage
  const savedContent = localStorage.getItem('editableContent');
  if (savedContent) {
      editableSpan.innerText = savedContent;
  }

  // Toggle editing mode
  addEventListener('click', () => {
      if (editableSpan.contentEditable === "true") {
          editableSpan.contentEditable = "false";
          editableSpan.classList.remove('editing');
          editButton.textContent = "Edit";
          saveButton.disabled = true;
      } else {
          editableSpan.contentEditable = "true";
          editableSpan.classList.add('editing');
          editButton.textContent = "Stop Editing";
          saveButton.disabled = false;
      }
  });

  // Save content to local storage on button click
  addEventListener('click', () => {
      localStorage.setItem('editableContent', editableSpan.innerText);
      alert('Changes saved!');
      editableSpan.contentEditable = "false";
      editableSpan.classList.remove('editing');
      editButton.textContent = "Edit";
      saveButton.disabled = true;
  });



}
  


