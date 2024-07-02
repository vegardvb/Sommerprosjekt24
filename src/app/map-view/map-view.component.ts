import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TerrainService } from '../services/terrain.service';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
})
export class MapViewComponent implements OnInit {
  inquiryId: string | undefined;

  constructor(
    private route: ActivatedRoute,
    private terrainService: TerrainService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.inquiryId = params['inquiryId'];
      // Placeholder: Use inquiryId to get bbox, width, and height
      const bbox = '272669,7037582,273109,7038148'; // Replace with dynamic value
      const width = 440; // Replace with dynamic value
      const height = 566; // Replace with dynamic value
      this.fetchTerrain(bbox, width, height);
    });
  }

  /**
   * Fetch the terrain data and handle the response.
   * @param bbox - Bounding box coordinates.
   * @param width - Width of the bounding box.
   * @param height - Height of the bounding box.
   */
  fetchTerrain(bbox: string, width: number, height: number) {
    this.terrainService.getTerrain(bbox, width, height).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      console.log('Terrain model URL:', url);
      // Implement functionality to use the GeoTIFF data in the map
    });
  }
}
