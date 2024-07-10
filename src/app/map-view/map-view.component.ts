import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CesiumDirective } from '../cesium.directive';
import { TerrainService } from '../services/terrain.service';
import { GeoTiffService } from '../services/geo-tiff.service';
import { Subscription } from 'rxjs';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { Entity } from 'cesium';

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
  @ViewChild(SidenavComponent, { static: true }) sidenavComponent!: SidenavComponent;

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
    private terrainService: TerrainService,
    private geoTiffService: GeoTiffService
  ) {}

  ngOnInit() {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
    });

    this.bboxSubscription = this.cesiumDirective.bboxExtracted.subscribe(
      bbox => {
        console.log('bbox',bbox)
        const { width, height } = this.calculateWidthHeight(bbox);
        this.fetchTerrain(bbox, width, height);
      });

    this.entitySubscription = this.cesiumDirective.selectedEntityChanged.subscribe(
      entity => {
        console.log('entity', entity)
        this.handleEntitySelected(entity);
      }
    );
    this.editingSubscription = this.sidenavComponent.editingToggled.subscribe(
      isEditing => { 
      console.log('mapviewediting', isEditing)
      this.cesiumDirective.setEditingMode(isEditing);
    });
  
  }

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
   * Fetches the terrain data based on the provided bounding box, width, and height.
   */
  fetchTerrain(bbox: string, width: number, height: number) {
    this.terrainService.getTerrain(bbox, width, height).subscribe(blob => {
      const reader = new FileReader();
      reader.onload = async () => {
        if (reader.result instanceof ArrayBuffer) {
          try {
            const arrayBuffer: ArrayBuffer = reader.result;
            const decodedData =
              await this.geoTiffService.decodeGeoTiff(arrayBuffer);
            console.log('Decoded GeoTIFF Data:', decodedData);
          } catch (error) {
            console.error('Error decoding GeoTIFF file:', error);
          }
        } else {
          console.error('Failed to read the file as an ArrayBuffer.');
        }
      };
      reader.readAsArrayBuffer(blob);
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
    console.log('Handling selected entity:', entity); // Further verification
    this.sidenavComponent.updateSelectedEntity(entity);
  }
  handleEntityDeselection() {
    this.sidenavComponent.clearSelectedEntity();
  }
}
