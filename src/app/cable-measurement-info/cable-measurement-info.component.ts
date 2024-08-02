/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
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
import { SidenavPointService } from '../services/sidenav-point.service';
import { switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
  public featurePoints: Feature[] = [];
  public singlePoints: Feature[] = [];

  private clickedPointId: number | null = null;
  public activeHeader: string = '';
  public groupedMeasurements: { id: number; features: Feature[] }[] = [];
  constructor(
    private route: ActivatedRoute,
    private geojsonService: GeojsonService,
    private clickedPointService: ClickedPointService,
    private sidenavPointService: SidenavPointService
  ) {}

  measurementTypeMap: { [key: number]: string } = {};

  /**
   * Initializes the component.
   */

  ngOnInit(): void {
    this.route.queryParams
      .pipe(
        switchMap(params => {
          this.inquiryId = params['inquiryId'];
          if (this.inquiryId) {
            this.fetchPointData(this.inquiryId);
            return this.geojsonService.getData(this.inquiryId);
          } else {
            console.error('Inquiry ID not found in the query parameters');
            return throwError(
              () => new Error('Inquiry ID not found in the query parameters')
            );
          }
        })
      )
      .subscribe({
        next: () => {
          this.features = this.geojsonService.getFeatures();
          this.groupFeaturesByMeasurementId();
        },
        error: error => {
          console.error('Error fetching data:', error);
        },
      });

    this.clickedPointService.clickedPointId$.subscribe(pointId => {
      this.clickedPointId = pointId;
    });

    this.sidenavPointService.updatedFeatures$.subscribe(updatedFeatures => {
      updatedFeatures.forEach(feature => {
        if (feature.properties.point_id) {
          this.addFeatureIfNotExists(this.features, feature);
          if (!feature.properties.measurement_id) {
            this.addFeatureIfNotExists(this.singlePoints, feature);
          }
        }
      });
    });

    this.geojsonService.updatedFeatures$.subscribe(updatedFeatures => {
      updatedFeatures.forEach(feature =>
        this.addFeatureIfNotExists(this.features, feature)
      );
      this.groupFeaturesByMeasurementId();
    });
  }
  /**
   * Fetches GeoJSON data for the given inquiry ID.
   * @param inquiry_id The inquiry ID.
   */
  fetchPointData(inquiry_id: number): void {
    this.sidenavPointService.getData(inquiry_id).subscribe({
      next: () => {
        this.featurePoints = this.sidenavPointService.getFeatures();
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
  groupFeaturesByMeasurementId() {
    const grouped = this.features.reduce(
      (acc, feature) => {
        const measurementId = feature.properties.measurement_id;
        if (measurementId !== undefined) {
          if (!acc[measurementId]) {
            acc[measurementId] = [];
          }
          acc[measurementId].push(feature);
        }
        return acc;
      },
      {} as { [key: number]: Feature[] }
    );

    this.groupedMeasurements = Object.keys(grouped).map(id => ({
      id: Number(id),
      features: grouped[Number(id)],
    }));
  }

  getHeader(feature: Feature): string {
    return `Point ID: ${feature.properties.point_id}`;
  }

  /**
   * Gets the ID for a feature.
   * @param feature The feature.
   * @returns The ID string.
   */
  getID(feature: Feature): number | undefined {
    return feature.properties.point_id;
  }

  /**
   * Gets the CSS class for the header of a feature.
   * @param feature The feature.
   * @returns The CSS class string.
   */
  getHeaderClass(feature: Feature): string | null {
    const header = this.getID(feature);
    const clickedPointIdStr = this.clickedPointId?.toString();

    if (header !== undefined && clickedPointIdStr !== undefined) {
      return header.toString() === clickedPointIdStr
        ? 'clicked-header'
        : 'default-header';
    } else {
      return null;
    }
  }
  /**
   * Gets the class for a measurement based on its ID.
   *
   * Checks if the measurement with the given ID has a feature associated with
   * the clicked point ID. If it does, returns 'clicked-measurement-id', otherwise returns null.
   *
   * @param {number} measurementId - The ID of the measurement.
   * @returns {string|null} - 'clicked-measurement-id' or null.
   */

  getMeasurementClass(measurementId: number): string | null {
    if (this.clickedPointId !== null) {
      const features = this.groupedMeasurements.find(
        m => m.id === measurementId
      )?.features;
      if (
        features &&
        features.some(f => f.properties.point_id === this.clickedPointId)
      ) {
        return 'clicked-measurement-id';
      }
    }
    return null;
  }
  /**
   * Captures the header ID and performs necessary actions.
   * @param headerId The header ID.
   */
  captureHeader(headerId: string) {
    const match = headerId.match(/(?:Point ID:)\s*(\d+)/);
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

  /**
   * Adds a feature to the array if it does not already exist.
   *
   * @param {Feature[]} featuresArray - The array of features.
   * @param {Feature} feature - The feature to add.
   * @returns {void}
   */

  private addFeatureIfNotExists(
    featuresArray: Feature[],
    feature: Feature
  ): void {
    const existingFeature = featuresArray.find(
      f => f.properties.point_id === feature.properties.point_id
    );
    if (!existingFeature) {
      featuresArray.push(feature);
    }
  }
}
