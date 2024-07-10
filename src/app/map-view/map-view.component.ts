import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CesiumDirective } from '../cesium.directive';
import { TerrainService } from '../services/terrain.service';
import { Subscription, switchMap } from 'rxjs';
import { SidenavComponent } from '../sidenav/sidenav.component';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
  standalone: true,
  imports: [CesiumDirective, SidenavComponent],
})
export class MapViewComponent implements OnInit, OnDestroy {
  @ViewChild(CesiumDirective, { static: true })
  cesiumDirective!: CesiumDirective;
  alpha = 1;
  tilesetVisible: boolean = true;
  polygonsVisible: boolean = true;
  Math!: Math;
  inquiryId: number | undefined;
  private queryParamsSubscription: Subscription | undefined;
  private bboxSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private terrainService: TerrainService
  ) {}

  ngOnInit() {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });

    this.bboxSubscription = this.cesiumDirective.bboxExtracted.subscribe(
      bbox => {
        const { width, height } = this.calculateWidthHeight(bbox);
        console.log(
          `Fetching and processing terrain with bbox: ${bbox}, width: ${width}, height: ${height}`
        );
        this.fetchAndProcessTerrain(bbox, width, height);
      }
    );
  }

  ngOnDestroy() {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
    if (this.bboxSubscription) {
      this.bboxSubscription.unsubscribe();
    }
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
          if (response && response.layerUrl) {
            await this.cesiumDirective.loadTerrainFromUrl(response.layerUrl);
          } else {
            console.error('Layer URL not provided in the response', response);
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
}
