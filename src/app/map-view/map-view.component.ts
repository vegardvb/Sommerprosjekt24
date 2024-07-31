import {
  Component,
  OnInit,
  ViewChild,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CesiumDirective } from '../cesium.directive';
import { TerrainService } from '../services/terrain.service';
import { Subscription, switchMap } from 'rxjs';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { Entity, Viewer } from 'cesium';
import { CableMeasurementInfoComponent } from '../cable-measurement-info/cable-measurement-info.component';
import { CesiumImageService } from '../services/image/cesium-image.service';
import { CesiumDataService } from '../services/cesium-data.service'; // Import the new service

/**
 * Represents the map view component.
 */
@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
  standalone: true,
  imports: [CesiumDirective, SidenavComponent, CableMeasurementInfoComponent],
})
export class MapViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(CesiumDirective, { static: true })
  cesiumDirective!: CesiumDirective;

  @ViewChild(SidenavComponent, { static: true })
  sidenavComponent!: SidenavComponent;

  public alpha = 100;
  public polygonsVisible: boolean = true;
  public geoJsonData!: string;
  private tilesetVisible: boolean = true;
  private inquiryId: number | undefined;
  private viewer!: Viewer;
  private queryParamsSubscription: Subscription | undefined;
  private bboxSubscription: Subscription | undefined;
  private entitySubscription: Subscription | undefined;
  private editingSubscription: Subscription | undefined;
  private geoJsonSubscription: Subscription | undefined;
  public billboardsVisible: boolean = true;

  /**
   * Initializes the component.
   */
  constructor(
    private route: ActivatedRoute,
    private terrainService: TerrainService,
    private cesiumImageService: CesiumImageService,
    private cesiumDataService: CesiumDataService // Inject the CesiumDataService
  ) {}

  /**
   * Lifecycle hook that is called after data-bound properties of the component are initialized.
   */
  ngOnInit() {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });

    this.bboxSubscription = this.cesiumDirective.bboxExtracted.subscribe(
      bbox => {
        const { width, height } = this.calculateWidthHeight(bbox);
        this.fetchAndProcessTerrain(bbox, width, height);
      }
    );
    this.entitySubscription =
      this.cesiumDirective.selectedEntityChanged.subscribe(entity => {
        this.handleEntitySelected(entity);
      });
    this.editingSubscription = this.sidenavComponent.editingToggled.subscribe(
      isEditing => {
        this.cesiumDirective.setEditingMode(isEditing);
      }
    );
    this.geoJsonSubscription = this.sidenavComponent.geoJsonUpload.subscribe(
      geoJsonData => {
        this.cesiumDirective.handleGeoJsonUpload(geoJsonData);
      }
    );
  }

  ngAfterViewInit() {
    // Ensure the viewer is ready before setting billboard visibility
    if (this.cesiumDirective.viewer) {
      this.viewer = this.cesiumDirective.viewer;
      this.cesiumImageService.setBillboardsVisibility(
        this.viewer,
        this.billboardsVisible
      );
    } else {
      console.error('Viewer is not initialized after view init');
    }
  }

  /**
   * Lifecycle hook that is called when the component is destroyed.
   */
  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
    if (this.bboxSubscription) {
      this.bboxSubscription.unsubscribe();
    }
    if (this.entitySubscription) {
      this.entitySubscription.unsubscribe();
    }
    if (this.editingSubscription) {
      this.editingSubscription.unsubscribe();
    }
    if (this.geoJsonSubscription) {
      this.geoJsonSubscription.unsubscribe();
    }
  }

  /**
   * Calculates the width and height based on the bounding box coordinates.
   * @param bbox - The bounding box coordinates.
   * @returns An object containing the width and height.
   */
  calculateWidthHeight(bbox: string): { width: number; height: number } {
    const [minX, minY, maxX, maxY] = bbox.split(',').map(Number);
    const width = Math.abs(maxX - minX);
    const height = Math.abs(maxY - minY);
    return { width, height };
  }

  /**
   * Fetches and processes the terrain data based on the provided bounding box, width, and height.
   * @param bbox - The bounding box coordinates.
   * @param width - The width.
   * @param height - The height.
   */
  private fetchAndProcessTerrain(bbox: string, width: number, height: number) {
    this.terrainService
      .fetchGeoTIFF(bbox, width, height)
      .pipe(
        switchMap(response => {
          const filePath = response.file_path;
          return this.terrainService.processGeoTIFF(filePath);
        })
      )
      .subscribe({
        next: async response => {
          if (response && response.tileSetUrl) {
            await this.cesiumDataService.loadTerrainFromUrl(
              this.cesiumDirective.viewer,
              response.tileSetUrl
            );
          } else {
            console.error('Tileset URL not provided in the response', response);
          }
        },
        error: (error: Error) => {
          console.error('Error processing GeoTIFF file:', error);
        },
      });
  }

  /**
   * Updates the alpha value.
   * @param event - The event object.
   */
  public updateAlpha(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.alpha = inputElement.valueAsNumber;
    this.cesiumDirective.updateGlobeAlpha(this.alpha / 100);
  }

  /**
   * Toggles the visibility of the tileset.
   * @param event - The event object.
   */
  toggleTileset(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.tilesetVisible = inputElement.checked;
    if (this.cesiumDirective) {
      this.cesiumDirective.setTilesetVisibility(this.tilesetVisible);
    }
  }

  /**
   * Toggles the visibility of the polygons.
   * @param event - The event object.
   */
  togglePolygons(event: Event): void {
    try {
      const inputElement = event.target as HTMLInputElement;
      this.polygonsVisible = inputElement.checked;
      if (this.cesiumDirective) {
        this.cesiumDirective.setPolygonsVisibility(this.polygonsVisible);
      }
    } catch (error) {
      console.error('Error toggling polygons visibility:', error);
    }
  }

  /**
   * Toggles the visibility of billboards.
   * @param event - The event triggered by the input element.
   */
  toggleBillboards(event: Event): void {
    try {
      const inputElement = event.target as HTMLInputElement;
      this.billboardsVisible = inputElement.checked;

      if (this.cesiumDirective.viewer) {
        this.cesiumImageService.setBillboardsVisibility(
          this.cesiumDirective.viewer,
          this.billboardsVisible
        );
      } else {
        console.error('Viewer is not initialized');
      }
    } catch (error) {
      console.error('Error toggling billboards visibility:', error);
    }
  }

  /**
   * Handles the selection of an entity.
   * @param entity - The selected entity.
   */
  handleEntitySelected(entity: Entity) {
    this.sidenavComponent.updateSelectedEntity(entity);
  }

  /**
   * Handles the deselection of an entity.
   */
  handleEntityDeselection() {
    this.sidenavComponent.clearSelectedEntity();
  }
}
