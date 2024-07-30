import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Feature } from '../../models/geojson.model';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FieldsetModule } from 'primeng/fieldset';
import { TreeTableModule } from 'primeng/treetable';
import { AccordionModule } from 'primeng/accordion';
import { GeojsonService } from '../services/geojson.service';
import { CesiumDirective } from '../cesium.directive';
import { ClickedPointService } from '../services/clickedpoint.service';

/**
 * Component for displaying cable measurement information.
 */
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

  public editMode: boolean = false;
  private inquiryId: number | undefined;
  public features: Feature[] = [];
  private clickedPointId: number | null = null;
  public activeHeader: string = '';

  constructor(
    private route: ActivatedRoute,
    private geojsonService: GeojsonService,
    private clickedPointService: ClickedPointService,
    private cdr: ChangeDetectorRef
  ) {}

  measurementTypeMap: { [key: number]: string } = {};

  /**
   * Initializes the component.
   */
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

    this.geojsonService.updatedFeatures$.subscribe(updatedFeatures => {
      this.features = updatedFeatures;
    });
  }

  /**
   * Fetches GeoJSON data for the given inquiry ID.
   * @param inquiry_id The inquiry ID.
   */
  fetchGeoJsonData(inquiry_id: number): void {
    this.geojsonService.getData(inquiry_id).subscribe({
      next: () => {
        this.features = this.geojsonService.getFeatures();
      },
      error: error => {
        console.error('Error fetching data:', error);
      },
    });
  }

  /**
   * Gets the header for a feature.
   * @param feature The feature.
   * @returns The header string.
   */
  getHeader(feature: Feature): string {
    return feature.properties.measurement_id !== undefined
      ? `Measurement ID: ${feature.properties.measurement_id}`
      : feature.properties.point_id !== undefined
        ? `Point ID: ${feature.properties.point_id}`
        : 'ID Not Available';
  }

  /**
   * Gets the ID for a feature.
   * @param feature The feature.
   * @returns The ID string.
   */
  getID(feature: Feature): string {
    return feature.properties.point_id !== undefined
      ? `${feature.properties.point_id}`
      : 'ID Not Available';
  }

  /**
   * Gets the CSS class for the header of a feature.
   * @param feature The feature.
   * @returns The CSS class string.
   */
  getHeaderClass(feature: Feature): string {
    const header = this.getID(feature);
    const clickedPointIdStr = this.clickedPointId?.toString();

    return header === clickedPointIdStr ? 'clicked-header' : 'default-header';
  }

  /**
   * Captures the header ID and performs necessary actions.
   * @param headerId The header ID.
   */
  captureHeader(headerId: string) {
    const match = headerId.match(/(?:Measurement ID:|Point ID:)\s*(\d+)/);
    if (match) {
      const extractedID = match[1];

      this.activeHeader = headerId;
      const tab = document
        .querySelector(`#measurement-${extractedID}`)
        ?.closest('p-accordionTab');
      if (tab) {
        const latElement = tab.querySelector('#lat');
        const lonElement = tab.querySelector('#lon');

        if (latElement && lonElement) {
          const latitude = latElement.textContent?.trim() || 'Unknown';
          const longitude = lonElement.textContent?.trim() || 'Unknown';

          this.clickedPointService.setClickedPointId(Number(extractedID));
          this.clickedPointService.setLatitude(latitude);
          this.clickedPointService.setLongitude(longitude);
          this.clickedPointService.triggerZoom();
        } else {
          console.warn('Latitude or Longitude element not found.');
        }
      } else {
        console.warn('Tab not found.');
      }
    } else {
      this.activeHeader = '';
    }
  }

  /**
   * Formats the coordinates.
   * @param coordinates The coordinates.
   * @returns The formatted coordinates.
   */
  formatCoordinates(coordinates: number[] | number[][]): string[] {
    if (Array.isArray(coordinates[0])) {
      return (coordinates as number[][]).map(coord => `[${coord.join(', ')}]`);
    } else {
      return [`[${(coordinates as number[]).join(', ')}]`];
    }
  }

  /**
   * Toggles the edit mode.
   */
  toggleEditMode(): void {
    this.editMode = !this.editMode;

    if (!this.editMode) {
      const editedFeatures: { [key: string]: string } = {};

      const editableElements = document.querySelectorAll('.editable');

      editableElements.forEach(element => {
        const editableElement = element as HTMLElement;
        const id = editableElement.getAttribute('id');
        if (id) {
          editedFeatures[id] = editableElement.innerText.trim();
        }
      });
    }
  }
}
