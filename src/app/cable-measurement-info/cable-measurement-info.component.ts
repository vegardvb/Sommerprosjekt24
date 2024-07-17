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

editMode: boolean = false;
toggleEditMode(): void {
  this.editMode = !this.editMode;

  if (!this.editMode) {
    console.log('Save changes');

    const editedFeatures: any = {}; 

    const editableElements = document.querySelectorAll('.editable');

    editableElements.forEach((element) => {
      const editableElement = element as HTMLElement; 
      const id = editableElement.getAttribute('id');
      if (id) {
        editedFeatures[id] = editableElement.innerText.trim();
      }
    });

    console.log('Edited features:', editedFeatures);

  } else {
    console.log('Edit mode enabled');
  }
}

}