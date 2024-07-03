// map-view.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CesiumDirective } from '../cesium.directive';
import { Math as cesiumMath, Cartesian2 } from 'cesium';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { TerrainService } from '../services/terrain.service';
import { GeoTiffService } from '../services/geo-tiff.service';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
  standalone: true,
  imports: [CesiumDirective, DropdownComponent, SidenavComponent],
})
export class MapViewComponent implements OnInit {
  inquiryId: number | undefined;
  CesiumDirective!: CesiumDirective;

  constructor(
    private route: ActivatedRoute,
    private terrainService: TerrainService,
    private geoTiffService: GeoTiffService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
      const bbox = '10.4476425,63.3941117,10.4556179,63.3994555'; // New bounding box in WGS 84
      const width = 440;
      const height = 566;
      this.fetchTerrain(bbox, width, height);
    });
  }

  filterMapById(inquiryId: number | undefined) {
    if (inquiryId) {
      console.log('Filtering map for inquiry ID:', inquiryId);
    }
  }

  viewModel = {
    translucencyEnabled: true,
    fadeByDistance: true,
    showVectorData: false,
    alpha: 0.8,
  };

  updateCesium(): void {
    const event = new CustomEvent('viewModelChange', {
      detail: this.viewModel,
    });
    window.dispatchEvent(event);
  }

  computeCircle(radius: number) {
    const positions = [];
    for (let i = 0; i < 360; i++) {
      const radians = cesiumMath.toRadians(i);
      positions.push(
        new Cartesian2(radius * Math.cos(radians), radius * Math.sin(radians))
      );
    }
    return positions;
  }

  fetchTerrain(bbox: string, width: number, height: number) {
    this.terrainService.getTerrain(bbox, width, height).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      console.log('Terrain model URL:', url);
      console.log('Blob size:', blob.size);
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
}
