import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CesiumDirective } from '../cesium.directive';
import { TerrainService } from '../services/terrain.service';
import { Subscription, switchMap } from 'rxjs';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { Entity } from 'cesium';
import { CableMeasurementInfoComponent } from '../cable-measurement-info/cable-measurement-info.component';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
  standalone: true,
  imports: [CesiumDirective, SidenavComponent, CableMeasurementInfoComponent],
})
export class MapViewComponent implements OnInit, OnDestroy {
  @ViewChild(CesiumDirective, { static: true })
  cesiumDirective!: CesiumDirective;
  @ViewChild(SidenavComponent, { static: true })
  sidenavComponent!: SidenavComponent;
  @ViewChild(CableMeasurementInfoComponent, { static: true }) cableMeasurementInfoComponent!: CableMeasurementInfoComponent;


  alpha = 100;
  tilesetVisible: boolean = true;
  polygonsVisible: boolean = true;
  Math!: Math;
  inquiryId: number | undefined;
  private queryParamsSubscription: Subscription | undefined;
  private bboxSubscription: Subscription | undefined;
  private entitySubscription: Subscription | undefined;
  private editingSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private terrainService: TerrainService
  ) {}

  ngOnInit() {
    console.log('initmapview');
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
        console.log('entity', entity);
        this.handleEntitySelected(entity);
      });
    this.editingSubscription = this.sidenavComponent.editingToggled.subscribe(
      isEditing => {
        console.log('mapviewediting', isEditing);
        this.cesiumDirective.setEditingMode(isEditing);
      }
    );
    console.log('initmapview');
  }

  ngOnDestroy() {
    console.log('destroymapview');
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
    console.log('destroymapview');
  }

  /**
   * Calculates the width and height based on the bounding box coordinates.
   */
  calculateWidthHeight(bbox: string): { width: number; height: number } {
    const [minX, minY, maxX, maxY] = bbox.split(',').map(Number);
    const width = Math.abs(maxX - minX);
    const height = Math.abs(maxY - minY);
    return { width, height };
  }

  /**
   * Fetches and processes the terrain data based on the provided bounding box, width, and height.
   */
  fetchAndProcessTerrain(bbox: string, width: number, height: number) {
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
          if (response && response.tilesetUrl) {
            console.log(
              `Loading terrain from tileset URL: ${response.tilesetUrl}`
            );
            await this.cesiumDirective.loadTerrainFromUrl(response.tilesetUrl);
          } else {
            console.error('Tileset URL not provided in the response', response);
          }
        },
        error: (error: Error) => {
          console.error('Error processing GeoTIFF file:', error);
        },
      });
  }

  public updateAlpha(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.alpha = inputElement.valueAsNumber;
    this.cesiumDirective.updateGlobeAlpha(this.alpha / 100);
  }

  toggleTileset(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.tilesetVisible = inputElement.checked;
    if (this.cesiumDirective) {
      this.cesiumDirective.setTilesetVisibility(this.tilesetVisible);
    }
  }

  togglePolygons(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.polygonsVisible = inputElement.checked;
    if (this.cesiumDirective) {
      this.cesiumDirective.setPolygonsVisibility(this.polygonsVisible);
    }
  }
  handleEntitySelected(entity: Entity) {
    console.log('handleentityselected');
    console.log('Handling selected entity:', entity); // Further verification
    this.sidenavComponent.updateSelectedEntity(entity);
    console.log('handleentityselected');
  }
  handleEntityDeselection() {
    console.log('handleentitydeselected');
    this.sidenavComponent.clearSelectedEntity();
    console.log('handleentitydeselected');
  }
}
