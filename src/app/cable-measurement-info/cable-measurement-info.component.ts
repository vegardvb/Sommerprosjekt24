import { Component, OnInit, ViewChild } from '@angular/core';
import { Feature, Metadata } from '../../models/geojson.model';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FieldsetModule } from 'primeng/fieldset';
import { TreeTableModule } from 'primeng/treetable';
import { AccordionModule } from 'primeng/accordion';
import { GeojsonService } from '../geojson.service';
import {
  Cartographic,
  Entity,
  Math as CesiumMath,
  Cartesian3,
  ConstantPositionProperty,
  JulianDate,
} from 'cesium';
import { CesiumDirective } from '../cesium.directive';
import { ClickedPointService } from '../services/clickedpoint.service';




@Component({
  selector: 'app-cable-measurement-info',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FieldsetModule,
    TreeTableModule,
    AccordionModule,
    CesiumDirective,
  ],
  templateUrl: './cable-measurement-info.component.html',
  styleUrls: ['./cable-measurement-info.component.css'],
})
export class CableMeasurementInfoComponent implements OnInit {
  @ViewChild(CesiumDirective, { static: true })
  cesiumDirective!: CesiumDirective;

  @ViewChild('accordion')
  accordion!: AccordionModule;

  inquiryId: string | null = null;
  measurementIds: number[] = [];
  pointIds: number[] = [];
  metadata: Metadata[] = [];
  type: string[] = [];
  features: Feature[] = [];
  selectedEntity!: Entity | null;
  longitude: number = 0;
  latitude: number = 0;
  height: number = 0;
  isEditing: boolean = false;
  clickedPointId: number | null = null;
  activeIndex: number = 0;
  activeHeader: string = '';



  constructor(
    private route: ActivatedRoute,
    private geojsonService: GeojsonService,
    private clickedPointService: ClickedPointService
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
    this.clickedPointService.clickedPointId$.subscribe(pointId => {
      this.clickedPointId = pointId;
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

  getID(feature: Feature): string {
    
    return feature.properties.point_id !== undefined
      ? `${feature.properties.point_id}`
      : 'ID Not Available';
  }



  getHeaderClass(feature: Feature): string {
    const header = this.getID(feature);
    const clickedPointIdStr = this.clickedPointId?.toString();
    return header === clickedPointIdStr ? 'clicked-header' : 'default-header';
  }

  captureHeader(headerId: string) {
    console.log('Header clicked:', headerId);
    const match = headerId.match(/(?:Measurement ID:|Point ID:)\s*(\d+)/);
    if (match) {
      const extractedID = match[1]; // Extract the ID from the match
      console.log('Extracted ID:', extractedID);
      
      this.activeHeader = headerId;
      console.log('Active tab header:', this.activeHeader);
      this.clickedPointService.setPointSidenav(Number(extractedID));
    } else {
      console.log('Invalid header: ID Not Available');
      this.activeHeader = '';
    }
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

      const editedFeatures: { [key: string]: string } = {};

      const editableElements = document.querySelectorAll('.editable');

      editableElements.forEach(element => {
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

  updateSelectedEntity(entity: Entity) {
    this.selectedEntity = entity;
    const position = this.selectedEntity.position?.getValue(JulianDate.now());
    if (position) {
      console.log('before cond', position);
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
      const newPosition = Cartesian3.fromDegrees(
        this.longitude,
        this.latitude,
        this.height
      );
      this.selectedEntity.position = new ConstantPositionProperty(newPosition);
      console.log('after text', this.selectedEntity.position);
    }
  }

  onTabChange(event:any) {
    this.activeIndex = event.index;
  }

 


  
}

