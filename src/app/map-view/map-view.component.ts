import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TerrainService } from '../services/terrain.service';
import { GeoTiffService } from '../services/geo-tiff.service';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
})
export class MapViewComponent implements OnInit {
  inquiryId: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private terrainService: TerrainService,
    private geoTiffService: GeoTiffService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
      const bbox = '272669,7037582,273109,7038148';
      const width = 440;
      const height = 566;
      this.fetchTerrain(bbox, width, height);
    });
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
